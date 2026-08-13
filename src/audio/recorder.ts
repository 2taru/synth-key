import type { AudioEngine } from './audioEngine';
import { pairEvents, sequenceDuration, type SeqNote } from './sequence';

interface RawEvent {
  midi: number;
  on: boolean;
  velocity: number;
  t: number;
}

/** Records notes played on the engine (from any source) into a sequence. */
export class Recorder {
  private readonly engine: AudioEngine;
  private recording = false;
  private startTime = 0;
  private events: RawEvent[] = [];
  private unsub: (() => void) | null = null;
  private notes: SeqNote[] = [];

  constructor(engine: AudioEngine) {
    this.engine = engine;
  }

  get isRecording(): boolean {
    return this.recording;
  }

  start(): void {
    this.recording = true;
    this.events = [];
    this.notes = [];
    this.startTime = performance.now();
    this.unsub = this.engine.addNoteListener((midi, on, velocity) => {
      this.events.push({ midi, on, velocity, t: (performance.now() - this.startTime) / 1000 });
    });
  }

  stop(): SeqNote[] {
    this.recording = false;
    this.unsub?.();
    this.unsub = null;
    this.notes = pairEvents(this.events);
    return this.notes;
  }

  clear(): void {
    this.events = [];
    this.notes = [];
  }

  getNotes(): SeqNote[] {
    return this.notes;
  }

  get noteCount(): number {
    return this.notes.length;
  }

  get duration(): number {
    return sequenceDuration(this.notes);
  }
}
