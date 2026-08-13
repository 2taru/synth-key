/**
 * A sample-accurate metronome using the Web Audio clock with a look-ahead
 * scheduler. Clicks are short oscillator blips (accent on beat 1 of 4).
 */
export class Metronome {
  private readonly ctx: AudioContext;
  private readonly out: AudioNode;
  private bpm = 120;
  private running = false;
  private nextNoteTime = 0;
  private beat = 0;
  private timer: number | null = null;

  /** Fired (approximately) on each audible beat, for a UI flash. */
  onBeat: ((beat: number) => void) | null = null;

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

  private scheduler = (): void => {
    while (this.nextNoteTime < this.ctx.currentTime + 0.12) {
      this.scheduleClick(this.nextNoteTime, this.beat % 4 === 0);
      const beatIndex = this.beat;
      const delayMs = Math.max(0, (this.nextNoteTime - this.ctx.currentTime) * 1000);
      window.setTimeout(() => this.onBeat?.(beatIndex % 4), delayMs);
      this.beat += 1;
      this.nextNoteTime += 60 / this.bpm;
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
