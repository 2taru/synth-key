import { Scale, Note, Chord } from 'tonal';

/** Selectable tonics (pitch classes), sharp spelling. */
export const TONICS = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
];

/** Scale / mode types offered in the UI, in a musically useful order. */
export const SCALE_TYPES = [
  'major',
  'minor',
  'harmonic minor',
  'melodic minor',
  'dorian',
  'phrygian',
  'lydian',
  'mixolydian',
  'locrian',
  'major pentatonic',
  'minor pentatonic',
  'blues',
];

export interface DiatonicChord {
  /** Roman-numeral degree, cased by quality (IV, ii, vii°, III+). */
  roman: string;
  /** Chord symbol, e.g. "Dm". */
  symbol: string;
  /** Component pitch classes. */
  notes: string[];
}

export interface ScaleInfo {
  ok: boolean;
  /** Full scale name from tonal, e.g. "C dorian". */
  name: string;
  /** Pitch class (0..11) of the tonic. */
  tonicChroma: number;
  /** Pitch classes (0..11) that belong to the scale. */
  chromas: Set<number>;
  /** Scale note names, ascending from the tonic. */
  notes: string[];
  /** Diatonic triads with roman numerals (only for 7-note scales). */
  chords: DiatonicChord[];
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

/** Tidy a triad symbol for display: "CM" → "C", "Bdim" → "B°", "Ebaug" → "Eb+". */
function niceSymbol(symbol: string): string {
  return symbol
    .replace(/M$/, '')
    .replace('dim', '°')
    .replace('aug', '+');
}

/** Case + decorate a roman numeral from the detected triad quality. */
function romanFor(degree: number, symbol: string): string {
  const base = ROMAN[degree] ?? String(degree + 1);
  const info = Chord.get(symbol);
  const q = info.quality; // "Major" | "Minor" | "Diminished" | "Augmented" | "Unknown"
  if (q === 'Minor') return base.toLowerCase();
  if (q === 'Diminished') return `${base.toLowerCase()}°`;
  if (q === 'Augmented') return `${base}+`;
  return base; // Major / unknown → uppercase
}

/** Build the diatonic triads of a 7-note scale by stacking scale thirds. */
function diatonicChords(notes: string[]): DiatonicChord[] {
  if (notes.length !== 7) return [];
  // Voice the scale across two octaves so degree+2 / +4 always resolve upward.
  const voiced = [
    ...notes.map((n) => `${n}4`),
    ...notes.map((n) => `${n}5`),
    ...notes.map((n) => `${n}6`),
  ];
  const chords: DiatonicChord[] = [];
  for (let i = 0; i < 7; i++) {
    const triad = [voiced[i], voiced[i + 2], voiced[i + 4]];
    const detected = Chord.detect(triad);
    const symbol = detected[0] ?? '';
    const info = Chord.get(symbol);
    chords.push({
      roman: romanFor(i, symbol),
      symbol: niceSymbol(info.symbol || symbol || '?'),
      notes: [notes[i], notes[(i + 2) % 7], notes[(i + 4) % 7]],
    });
  }
  return chords;
}

/** Resolve a tonic + scale type into everything the UI needs. */
export function getScale(tonic: string, type: string): ScaleInfo {
  const scale = Scale.get(`${tonic} ${type}`);
  if (scale.empty || scale.notes.length === 0) {
    return {
      ok: false,
      name: '',
      tonicChroma: 0,
      chromas: new Set(),
      notes: [],
      chords: [],
    };
  }

  const chromas = new Set<number>();
  for (const n of scale.notes) {
    const c = Note.chroma(n);
    if (c != null) chromas.add(c);
  }

  return {
    ok: true,
    name: scale.name,
    tonicChroma: Note.chroma(tonic) ?? 0,
    chromas,
    notes: scale.notes,
    chords: diatonicChords(scale.notes),
  };
}
