/** A single note in a recorded/loaded sequence. Times are seconds from t=0. */
export interface SeqNote {
  midi: number;
  start: number;
  duration: number;
  velocity: number; // 0..127
}

interface RawEvent {
  midi: number;
  on: boolean;
  velocity: number;
  t: number;
}

/** Pair raw note on/off events into notes with durations. */
export function pairEvents(events: RawEvent[]): SeqNote[] {
  const open = new Map<number, { velocity: number; t: number }>();
  const notes: SeqNote[] = [];
  const close = (midi: number, endT: number) => {
    const prev = open.get(midi);
    if (!prev) return;
    notes.push({
      midi,
      start: prev.t,
      duration: Math.max(0.05, endT - prev.t),
      velocity: prev.velocity,
    });
    open.delete(midi);
  };

  for (const e of events) {
    if (e.on) {
      if (open.has(e.midi)) close(e.midi, e.t); // retrigger
      open.set(e.midi, { velocity: e.velocity, t: e.t });
    } else {
      close(e.midi, e.t);
    }
  }

  const endT = events.length ? events[events.length - 1].t : 0;
  [...open.keys()].forEach((midi) => close(midi, endT));
  notes.sort((a, b) => a.start - b.start);
  return notes;
}

export function sequenceDuration(notes: SeqNote[]): number {
  return notes.reduce((max, n) => Math.max(max, n.start + n.duration), 0);
}
