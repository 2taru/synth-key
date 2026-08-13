import Soundfont from 'soundfont-player';
import { midiToName } from './notes';

export const DEFAULT_INSTRUMENT = 'acoustic_grand_piano';

// Gleitz `midi-js-soundfonts` bank. FluidR3_GM covers the full 128-instrument
// General MIDI set, so any standard instrument name can be fetched from it.
const SOUNDFONT_BANK = 'FluidR3_GM';

/**
 * A single sounding note handle returned by soundfont-player's `play()`. It is a
 * GainNode carrying the underlying `AudioBufferSourceNode` as `.source`, whose
 * `detune` param (in cents) we use for live pitch bend.
 */
interface PlayingNote {
  stop: (when?: number) => void;
  source?: { detune?: AudioParam };
}

/** The subset of soundfont-player's instrument API that we rely on. */
interface SfPlayer {
  play: (
    note: string | number,
    when?: number,
    options?: { gain?: number; duration?: number },
  ) => PlayingNote;
  stop: (when?: number) => void;
}

export type NoteCallback = (midi: number, on: boolean) => void;
export type BendCallback = (normalized: number) => void;
export type ModCallback = (value: number) => void;
export type SustainCallback = (on: boolean) => void;

/** Pitch-bend wheel range in semitones (±), matching the General MIDI default. */
const PITCH_BEND_RANGE_SEMITONES = 2;
/** Vibrato (mod-wheel) speed in Hz and its maximum depth in cents at full wheel. */
const VIBRATO_HZ = 5.5;
const VIBRATO_MAX_CENTS = 50;

/**
 * The core audio engine. It lives OUTSIDE of React so that MIDI callbacks can
 * trigger sound synchronously with zero re-render latency. React only observes
 * it through the optional `onNote` callback, which is wired up exclusively when
 * the visualizer is enabled.
 */
export class AudioEngine {
  readonly ctx: AudioContext;
  private readonly instruments = new Map<string, SfPlayer>();
  private readonly playing = new Map<number, PlayingNote>();

  /** Name of the instrument the keyboard currently plays. */
  activeName: string = DEFAULT_INSTRUMENT;

  /** Set by React only while the visualizer / chord-detect features are ON. */
  onNote: NoteCallback | null = null;

  /** Set by React to reflect the pitch-bend wheel in the UI. */
  onBend: BendCallback | null = null;

  /** Set by React to reflect the mod wheel in the UI. */
  onMod: ModCallback | null = null;

  /** Set by React to reflect the sustain pedal in the UI. */
  onSustain: SustainCallback | null = null;

  /** Current pitch bend in cents, applied to every sounding and future note. */
  private bendCents = 0;

  /** Sustain (CC64) pedal state and the notes it is holding after key release. */
  private sustainOn = false;
  private readonly heldKeys = new Set<number>();
  private readonly sustained = new Set<number>();

  /** Shared vibrato LFO (mod wheel / CC1): lfo -> modGain -> each note's detune. */
  private readonly lfo: OscillatorNode;
  private readonly modGain: GainNode;

  constructor() {
    const Ctx: typeof AudioContext =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new Ctx({ latencyHint: 'interactive' });

    // A single free-running LFO drives vibrato on every note. Its depth (modGain)
    // starts at 0, so it is silent until the mod wheel is moved.
    this.lfo = this.ctx.createOscillator();
    this.lfo.frequency.value = VIBRATO_HZ;
    this.modGain = this.ctx.createGain();
    this.modGain.gain.value = 0;
    this.lfo.connect(this.modGain);
    this.lfo.start();
  }

  get contextState(): AudioContextState {
    return this.ctx.state;
  }

  /** Browsers start the AudioContext suspended; resume it after a user gesture. */
  async resume(): Promise<void> {
    if (this.ctx.state !== 'running') {
      try {
        await this.ctx.resume();
      } catch {
        /* ignore — will retry on next gesture */
      }
    }
  }

  has(name: string): boolean {
    return this.instruments.has(name);
  }

  /** Fetch and decode an instrument from the Gleitz soundfont repo. Idempotent. */
  async load(name: string): Promise<void> {
    if (this.instruments.has(name)) return;
    const inst = (await Soundfont.instrument(this.ctx, name, {
      soundfont: SOUNDFONT_BANK,
    })) as SfPlayer;
    this.instruments.set(name, inst);
  }

  setActive(name: string): void {
    if (this.instruments.has(name)) this.activeName = name;
  }

  remove(name: string): void {
    if (name === DEFAULT_INSTRUMENT) return; // default is non-deletable
    this.instruments.delete(name);
    if (this.activeName === name) this.activeName = DEFAULT_INSTRUMENT;
  }

  /** Stop and fully tear down a sounding note (also unhooks its vibrato). */
  private stopNote(midi: number): void {
    const node = this.playing.get(midi);
    if (!node) return;
    if (node.source?.detune) {
      try {
        this.modGain.disconnect(node.source.detune);
      } catch {
        /* was not connected — ignore */
      }
    }
    node.stop();
    this.playing.delete(midi);
  }

  /** Trigger a note. Called synchronously from the MIDI/pointer callbacks. */
  noteOn(midi: number, velocity = 100): void {
    const inst = this.instruments.get(this.activeName);
    if (!inst) return;

    this.heldKeys.add(midi);
    this.sustained.delete(midi);

    // Retrigger: stop a still-sounding instance of the same note first.
    this.stopNote(midi);

    const gain = Math.max(0, Math.min(1, velocity / 127));
    const node = inst.play(midiToName(midi), this.ctx.currentTime, { gain });
    if (node.source?.detune) {
      // Start the new note already bent, and route vibrato into its detune.
      if (this.bendCents !== 0) node.source.detune.value = this.bendCents;
      try {
        this.modGain.connect(node.source.detune);
      } catch {
        /* ignore if the param can't be targeted */
      }
    }
    this.playing.set(midi, node);
    this.onNote?.(midi, true);
  }

  /** Release a note. Held by the sustain pedal if it is down. */
  noteOff(midi: number): void {
    this.heldKeys.delete(midi);
    if (this.sustainOn) {
      this.sustained.add(midi); // keep sounding until the pedal lifts
    } else {
      this.stopNote(midi);
    }
    // The physical key is up, so visual feedback releases regardless of sustain.
    this.onNote?.(midi, false);
  }

  /**
   * Apply a pitch-bend wheel value. `raw` is the 14-bit MIDI value (0..16383,
   * centered at 8192). Updates every sounding note synchronously.
   */
  setBend(raw: number): void {
    const normalized = (raw - 8192) / 8192; // -1 .. ~+1
    this.bendCents = normalized * PITCH_BEND_RANGE_SEMITONES * 100;
    this.playing.forEach((n) => {
      if (n.source?.detune) n.source.detune.value = this.bendCents;
    });
    this.onBend?.(normalized);
  }

  /**
   * Sustain pedal (CC64). When released, drops every note the pedal was holding
   * that isn't still physically pressed.
   */
  setSustain(on: boolean): void {
    if (on === this.sustainOn) return;
    this.sustainOn = on;
    if (!on) {
      this.sustained.forEach((midi) => {
        if (!this.heldKeys.has(midi)) this.stopNote(midi);
      });
      this.sustained.clear();
    }
    this.onSustain?.(on);
  }

  /**
   * Mod wheel (CC1), 0..127. Scales the shared vibrato depth applied to every
   * sounding and future note.
   */
  setModulation(value: number): void {
    const clamped = Math.max(0, Math.min(127, value));
    this.modGain.gain.value = (clamped / 127) * VIBRATO_MAX_CENTS;
    this.onMod?.(clamped);
  }

  /** Panic: silence everything (e.g. when switching instruments). */
  allNotesOff(): void {
    [...this.playing.keys()].forEach((midi) => this.stopNote(midi));
    this.heldKeys.clear();
    this.sustained.clear();
  }
}
