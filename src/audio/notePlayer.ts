import type { AudioEngine } from './audioEngine';
import { sequenceDuration, type SeqNote } from './sequence';

/**
 * Plays a note sequence through the engine using scheduled timers. A `leadIn`
 * delays audio so a falling-note view has time to scroll notes in. `songTime()`
 * reports the current position (negative during the lead-in) for visualizers.
 */
export class NotePlayer {
  private readonly engine: AudioEngine;
  private timers: number[] = [];
  private playing = false;
  private startPerf = 0;
  private leadIn = 0;

  onEnd: (() => void) | null = null;

  constructor(engine: AudioEngine) {
    this.engine = engine;
  }

  get isPlaying(): boolean {
    return this.playing;
  }

  play(notes: SeqNote[], leadIn = 0): void {
    this.stop();
    if (notes.length === 0) return;
    this.playing = true;
    this.leadIn = leadIn;
    this.startPerf = performance.now();

    for (const n of notes) {
      const onAt = (n.start + leadIn) * 1000;
      const offAt = (n.start + n.duration + leadIn) * 1000;
      this.timers.push(window.setTimeout(() => this.engine.noteOn(n.midi, n.velocity), onAt));
      this.timers.push(window.setTimeout(() => this.engine.noteOff(n.midi), offAt));
    }

    const endMs = (sequenceDuration(notes) + leadIn) * 1000 + 250;
    this.timers.push(
      window.setTimeout(() => {
        this.playing = false;
        this.onEnd?.();
      }, endMs),
    );
  }

  stop(): void {
    this.timers.forEach((t) => clearTimeout(t));
    this.timers = [];
    if (this.playing) this.engine.allNotesOff();
    this.playing = false;
  }

  /** Position in the sequence's own timeline (seconds); negative during lead-in. */
  songTime(): number {
    return (performance.now() - this.startPerf) / 1000 - this.leadIn;
  }
}
