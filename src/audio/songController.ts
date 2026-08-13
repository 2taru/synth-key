import type { AudioEngine } from './audioEngine';
import { sequenceDuration, type SeqNote } from './sequence';

export type SongMode = 'auto' | 'practice';

interface Step {
  time: number;
  midis: number[];
  notes: SeqNote[];
}

/** Group notes that start at (nearly) the same time into chord "steps". */
function groupSteps(notes: SeqNote[]): Step[] {
  const sorted = [...notes].sort((a, b) => a.start - b.start);
  const steps: Step[] = [];
  const TOL = 0.05;
  for (const n of sorted) {
    const last = steps[steps.length - 1];
    if (last && n.start - last.time <= TOL) {
      last.notes.push(n);
      last.midis.push(n.midi);
    } else {
      steps.push({ time: n.start, midis: [n.midi], notes: [n] });
    }
  }
  return steps;
}

/**
 * Drives a loaded MIDI song in two modes:
 *  - `auto`: plays itself; highlights the notes currently sounding.
 *  - `practice`: falling notes pause at the keyboard line until you play the
 *    right key(s), then advance (Synthesia "wait" mode).
 * `songTime()` feeds the falling-note view; `onTargets` feeds key highlighting.
 */
export class SongController {
  private readonly engine: AudioEngine;
  private notes: SeqNote[] = [];
  private steps: Step[] = [];
  private mode: SongMode = 'auto';
  private playing = false;

  private raf = 0;
  private lastReal = 0;
  private t = 0;
  private waiting = false;
  private stepIdx = 0;
  private readonly satisfied = new Set<number>();

  private autoTimers: number[] = [];
  private noteUnsub: (() => void) | null = null;
  private lastTargetsKey = '';

  /** Called with the MIDI notes to highlight as "play these". */
  onTargets: ((midis: number[]) => void) | null = null;
  onEnd: (() => void) | null = null;

  constructor(engine: AudioEngine) {
    this.engine = engine;
  }

  get isPlaying(): boolean {
    return this.playing;
  }

  load(notes: SeqNote[]): void {
    this.notes = notes;
    this.steps = groupSteps(notes);
  }

  songTime(): number {
    return this.t;
  }

  play(mode: SongMode, leadIn = 2): void {
    this.stop();
    if (this.notes.length === 0) return;
    this.mode = mode;
    this.playing = true;
    this.t = -leadIn;
    this.stepIdx = 0;
    this.waiting = false;
    this.satisfied.clear();
    this.lastReal = performance.now();
    this.lastTargetsKey = '';

    if (mode === 'auto') {
      for (const n of this.notes) {
        this.autoTimers.push(
          window.setTimeout(() => this.engine.noteOn(n.midi, n.velocity), (n.start + leadIn) * 1000),
        );
        this.autoTimers.push(
          window.setTimeout(() => this.engine.noteOff(n.midi), (n.start + n.duration + leadIn) * 1000),
        );
      }
      const endMs = (sequenceDuration(this.notes) + leadIn) * 1000 + 300;
      this.autoTimers.push(window.setTimeout(() => this.finish(), endMs));
    } else {
      // Practice: the player is the user; watch their notes.
      this.noteUnsub = this.engine.addNoteListener((midi, on) => this.onUserNote(midi, on));
    }

    this.raf = requestAnimationFrame(this.tick);
  }

  stop(): void {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.autoTimers.forEach((t) => clearTimeout(t));
    this.autoTimers = [];
    this.noteUnsub?.();
    this.noteUnsub = null;
    if (this.playing) this.engine.allNotesOff();
    this.playing = false;
    this.waiting = false;
    this.emitTargets([]);
  }

  private finish(): void {
    if (!this.playing) return;
    this.stop();
    this.onEnd?.();
  }

  private tick = (): void => {
    if (!this.playing) return;
    const now = performance.now();
    const dt = (now - this.lastReal) / 1000;
    this.lastReal = now;

    if (this.mode === 'auto') {
      this.t += dt;
      const sounding: number[] = [];
      for (const n of this.notes) {
        if (this.t >= n.start && this.t <= n.start + n.duration) sounding.push(n.midi);
      }
      this.emitTargets(sounding);
    } else {
      if (this.stepIdx >= this.steps.length) {
        this.finish();
        return;
      }
      const step = this.steps[this.stepIdx];
      if (!this.waiting) {
        this.t += dt;
        if (this.t >= step.time) {
          this.t = step.time;
          this.waiting = true;
          this.satisfied.clear();
          this.emitTargets(step.midis);
        } else {
          this.emitTargets([]);
        }
      }
    }

    this.raf = requestAnimationFrame(this.tick);
  };

  private onUserNote(midi: number, on: boolean): void {
    if (!on || this.mode !== 'practice' || !this.waiting) return;
    const step = this.steps[this.stepIdx];
    if (!step) return;
    if (step.midis.includes(midi)) this.satisfied.add(midi);
    if (step.midis.every((m) => this.satisfied.has(m))) {
      this.waiting = false;
      this.stepIdx += 1;
      this.satisfied.clear();
      this.emitTargets([]);
      if (this.stepIdx >= this.steps.length) {
        window.setTimeout(() => this.finish(), 400);
      }
    }
  }

  private emitTargets(midis: number[]): void {
    const key = [...midis].sort((a, b) => a - b).join(',');
    if (key === this.lastTargetsKey) return;
    this.lastTargetsKey = key;
    this.onTargets?.(midis);
  }
}
