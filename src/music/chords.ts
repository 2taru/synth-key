import { Chord, Note } from 'tonal';
import { midiToName } from '../audio/notes';

export interface ChordResult {
  ok: boolean;
  /** Raw symbol the user typed. */
  symbol: string;
  /** Human-readable name from tonal, e.g. "C major seventh". */
  name: string;
  /** Component pitch classes, e.g. ["C", "E", "G", "B"]. */
  notes: string[];
  /** Pitch classes mapped onto concrete MIDI numbers within the keyboard range. */
  midi: number[];
}

/**
 * Parse any chord symbol with tonal and voice its notes onto the visual
 * keyboard. Notes ascend from `baseOctave`, bumping an octave whenever the
 * chroma wraps, so the voicing reads like a real stacked chord. Anything that
 * lands outside [low, high] is folded back in by whole octaves.
 */
export function chordToMidi(
  input: string,
  baseOctave = 4,
  low = 36,
  high = 84,
): ChordResult {
  const symbol = input.trim();
  const chord = Chord.get(symbol);

  if (chord.empty || chord.notes.length === 0) {
    return { ok: false, symbol, name: '', notes: [], midi: [] };
  }

  const midi: number[] = [];
  let octave = baseOctave;
  let prevChroma = -1;

  for (const pc of chord.notes) {
    const chroma = Note.chroma(pc);
    if (chroma == null) continue;

    // Ascend an octave whenever the pitch class steps back down.
    if (chroma <= prevChroma) octave += 1;
    prevChroma = chroma;

    let m = Note.midi(`${pc}${octave}`);
    if (m == null) continue;

    while (m < low) m += 12;
    while (m > high) m -= 12;
    midi.push(m);
  }

  return {
    ok: true,
    symbol,
    name: chord.name || chord.symbol || symbol,
    notes: chord.notes,
    midi,
  };
}

export interface DetectedChord {
  /** Best-guess chord symbol, e.g. "Cmaj7". */
  symbol: string;
  /** Full name from tonal, e.g. "C major seventh". */
  name: string;
  /** Alternative interpretations beyond the best guess. */
  alternatives: string[];
  /** The played pitches as note names, low to high. */
  playedNotes: string[];
}

/**
 * Identify the chord formed by a set of currently sounding MIDI notes. Returns
 * `null` until at least three distinct pitch classes are held (fewer notes name
 * an interval, not a chord).
 */
export function detectChord(midiNotes: Iterable<number>): DetectedChord | null {
  const sorted = [...midiNotes].sort((a, b) => a - b);
  const playedNotes = sorted.map(midiToName);

  const distinctChroma = new Set(sorted.map((m) => ((m % 12) + 12) % 12));
  if (distinctChroma.size < 3) return null;

  // Pass real note names (with octave) so tonal can spot the bass for slash chords.
  const detected = Chord.detect(playedNotes);
  if (detected.length === 0) return null;

  const [best, ...alternatives] = detected;
  const info = Chord.get(best);

  return {
    symbol: best,
    name: info.name || best,
    alternatives,
    playedNotes,
  };
}
