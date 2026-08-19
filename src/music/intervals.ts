import { Interval } from 'tonal';
import { midiToName } from '../audio/notes';

export interface IntervalInfo {
  /** Distance in semitones, always positive (low → high). */
  semitones: number;
  /** Compact symbol, e.g. "P5", "m3", "A4". */
  short: string;
  /** Friendly name, e.g. "Perfect fifth", "Minor third". */
  label: string;
  /** Lower note name with octave, e.g. "C4". */
  fromNote: string;
  /** Higher note name with octave, e.g. "G4". */
  toNote: string;
}

export interface DetectedIntervals {
  /** The held pitches as note names, low to high. */
  playedNotes: string[];
  /** Interval between each adjacent pair of notes — how the stack is built. */
  stacked: IntervalInfo[];
  /** Interval from the lowest note to every higher note. */
  fromRoot: IntervalInfo[];
}

const QUALITY: Record<string, string> = {
  P: 'Perfect',
  M: 'Major',
  m: 'Minor',
  A: 'Augmented',
  AA: 'Doubly augmented',
  d: 'Diminished',
  dd: 'Doubly diminished',
};

const ORDINAL = [
  '',
  'unison',
  'second',
  'third',
  'fourth',
  'fifth',
  'sixth',
  'seventh',
  'octave',
  'ninth',
  'tenth',
  'eleventh',
  'twelfth',
  'thirteenth',
  'fourteenth',
  'fifteenth',
];

/** Turn two note names into a fully described ascending interval. */
function describe(fromNote: string, toNote: string): IntervalInfo {
  const name = Interval.distance(fromNote, toNote);
  const info = Interval.get(name);

  const quality = QUALITY[info.q] ?? info.q;
  const ordinal = ORDINAL[info.num ?? 0] ?? `${info.num}th`;
  let label = `${quality} ${ordinal}`.trim();

  // The tritone reads better with its common name flagged.
  if (info.semitones != null && ((info.semitones % 12) + 12) % 12 === 6) {
    label += ' (tritone)';
  }

  return {
    semitones: info.semitones ?? 0,
    short: `${info.q}${info.num}`,
    label,
    fromNote,
    toNote,
  };
}

/**
 * Analyze the intervals formed by a set of currently sounding MIDI notes.
 * Returns `null` until at least two distinct pitches are held, since a single
 * note names no interval. Duplicate MIDI numbers are collapsed.
 */
export function detectIntervals(midiNotes: Iterable<number>): DetectedIntervals | null {
  const sorted = [...new Set(midiNotes)].sort((a, b) => a - b);
  if (sorted.length < 2) return null;

  const playedNotes = sorted.map(midiToName);

  const stacked: IntervalInfo[] = [];
  for (let i = 1; i < playedNotes.length; i++) {
    stacked.push(describe(playedNotes[i - 1], playedNotes[i]));
  }

  const fromRoot: IntervalInfo[] = [];
  for (let i = 1; i < playedNotes.length; i++) {
    fromRoot.push(describe(playedNotes[0], playedNotes[i]));
  }

  return { playedNotes, stacked, fromRoot };
}
