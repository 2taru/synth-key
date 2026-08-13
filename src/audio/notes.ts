// Note-name helpers. MIDI convention: middle C = C4 = MIDI note 60.

const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const BLACK_CHROMA = new Set([1, 3, 6, 8, 10]);

/** Convert a MIDI note number to a scientific-pitch name, e.g. 60 -> "C4". */
export function midiToName(midi: number): string {
  const name = NAMES[((midi % 12) + 12) % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${name}${octave}`;
}

/** True for the sharp/flat (black) keys of the keyboard. */
export function isBlackKey(midi: number): boolean {
  return BLACK_CHROMA.has(((midi % 12) + 12) % 12);
}
