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

export interface KeyGeom {
  /** Left edge as a fraction (0..1) of the keyboard width. */
  left: number;
  /** Width as a fraction (0..1) of the keyboard width. */
  width: number;
}

/**
 * Horizontal geometry of every key in [low, high], matching PianoKeyboard's
 * layout (white keys tile the row; black keys straddle the gaps). Shared so the
 * note waterfall lines up exactly with the on-screen keys.
 */
export function keyGeometry(low: number, high: number): Map<number, KeyGeom> {
  const midis: number[] = [];
  for (let m = low; m <= high; m++) midis.push(m);

  const whites = midis.filter((m) => !isBlackKey(m));
  const whiteW = 1 / whites.length;
  const blackW = whiteW * 0.62;

  const geom = new Map<number, KeyGeom>();
  whites.forEach((m, i) => geom.set(m, { left: i * whiteW, width: whiteW }));
  midis.filter(isBlackKey).forEach((m) => {
    const leftWhiteIndex = whites.indexOf(m - 1);
    geom.set(m, { left: (leftWhiteIndex + 1) * whiteW - blackW / 2, width: blackW });
  });
  return geom;
}
