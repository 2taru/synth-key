/**
 * A sample-accurate metronome using the Web Audio clock with a look-ahead
 * scheduler. Clicks are short oscillator blips, with a configurable time
 * signature and independent strong- / weak-beat playback.
 */

const NOTE_VALUES = [1, 2, 4, 8, 16];

export class Metronome {
  private readonly ctx: AudioContext;
  private readonly out: AudioNode;
  private bpm = 120;
  private beatsPerBar = 4;
  private noteValue = 4; // denominator of the time signature
  private accentStrong = true; // play + accent the downbeat
  private playWeak = true; // play the weak beats
  private running = false;
  private nextNoteTime = 0;
  private beat = 0;
  private timer: number | null = null;

  /** Fired (approximately) on each beat with its index within the bar, for a UI flash. */
  onBeat: ((beatInBar: number) => void) | null = null;

  constructor(ctx: AudioContext, out: AudioNode) {
    this.ctx = ctx;
    this.out = out;
  }

  get isRunning(): boolean {
    return this.running;
  }

  setBpm(bpm: number): void {
    this.bpm = Math.max(20, Math.min(300, Math.round(bpm)));
  }

  setTimeSignature(beats: number, noteValue: number): void {
    this.beatsPerBar = Math.max(1, Math.min(32, Math.round(beats) || 4));
    this.noteValue = NOTE_VALUES.includes(noteValue) ? noteValue : 4;
  }

  setAccentStrong(on: boolean): void {
    this.accentStrong = on;
  }

  setPlayWeak(on: boolean): void {
    this.playWeak = on;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.beat = 0;
    this.nextNoteTime = this.ctx.currentTime + 0.1;
    this.scheduler();
  }

  stop(): void {
    this.running = false;
    if (this.timer != null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  /** Duration of one beat in seconds. BPM counts quarter notes, so the beat
   *  scales with the denominator (e.g. 4/8 → half-length beats). */
  private beatDuration(): number {
    return (60 / this.bpm) * (4 / this.noteValue);
  }

  private scheduler = (): void => {
    while (this.nextNoteTime < this.ctx.currentTime + 0.12) {
      const beatInBar = this.beat % this.beatsPerBar;
      const isDownbeat = beatInBar === 0;
      const shouldClick = isDownbeat ? this.accentStrong : this.playWeak;
      if (shouldClick) this.scheduleClick(this.nextNoteTime, isDownbeat);

      const idx = beatInBar;
      const delayMs = Math.max(0, (this.nextNoteTime - this.ctx.currentTime) * 1000);
      window.setTimeout(() => this.onBeat?.(idx), delayMs);

      this.beat += 1;
      this.nextNoteTime += this.beatDuration();
    }
    if (this.running) this.timer = window.setTimeout(this.scheduler, 25);
  };

  private scheduleClick(time: number, accent: boolean): void {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.value = accent ? 1600 : 1000;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(accent ? 0.5 : 0.32, time + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
    osc.connect(gain);
    gain.connect(this.out);
    osc.start(time);
    osc.stop(time + 0.06);
  }
}
