import { memo } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { isBlackKey, midiToName } from '../audio/notes';

interface Props {
  /** Lowest MIDI note shown (inclusive). */
  low: number;
  /** Highest MIDI note shown (inclusive). */
  high: number;
  /** Notes currently held down (via MIDI / pointer) — highlighted as "active". */
  activeKeys: Set<number>;
  /** Notes highlighted by the chord lookup — a distinct color. */
  chordKeys: Set<number>;
  /** Notes to play, highlighted during song / practice mode. */
  targetKeys?: Set<number>;
  /** Pitch classes (0..11) belonging to the highlighted scale. */
  scaleChromas?: Set<number>;
  /** Pitch class (0..11) of the scale's tonic, or null when off. */
  rootChroma?: number | null;
  onPress?: (midi: number, velocity: number) => void;
  onRelease?: (midi: number) => void;
}

/**
 * Derive a MIDI-style velocity (1..127) from a pointer press: pen/touch use real
 * pressure; a mouse uses how low on the key it clicked (bottom = louder), like a
 * real keybed.
 */
function velocityFromPointer(e: ReactPointerEvent<HTMLDivElement>): number {
  let v: number;
  if (e.pointerType !== 'mouse' && e.pressure > 0) {
    v = Math.round(e.pressure * 127);
  } else {
    const rect = e.currentTarget.getBoundingClientRect();
    const rel = rect.height > 0 ? (e.clientY - rect.top) / rect.height : 0.75;
    v = Math.round(28 + rel * 99); // ~28 (top) .. 127 (bottom)
  }
  return Math.max(1, Math.min(127, v));
}

/**
 * A visual piano. White keys flow in a flex row; black keys are absolutely
 * positioned over the gaps between them. Purely presentational — it renders
 * whatever `activeKeys` / `chordKeys` it is given.
 */
const EMPTY: Set<number> = new Set();

function PianoKeyboardBase({
  low,
  high,
  activeKeys,
  chordKeys,
  targetKeys = EMPTY,
  scaleChromas = EMPTY,
  rootChroma = null,
  onPress,
  onRelease,
}: Props) {
  const midis: number[] = [];
  for (let m = low; m <= high; m++) midis.push(m);

  const whites = midis.filter((m) => !isBlackKey(m));
  const blacks = midis.filter(isBlackKey);
  const whiteWidth = 100 / whites.length;
  const blackWidth = whiteWidth * 0.62;

  const press = (m: number) => (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    onPress?.(m, velocityFromPointer(e)); // sound first — capture must never block it
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch {
      /* ignore: capture can fail for synthetic/edge pointers */
    }
  };
  const release = (m: number) => () => onRelease?.(m);

  const classNames = (m: number, base: string): string => {
    const chroma = ((m % 12) + 12) % 12;
    return [
      'key',
      base,
      scaleChromas.has(chroma) && 'in-scale',
      rootChroma === chroma && 'scale-root',
      targetKeys.has(m) && 'target',
      chordKeys.has(m) && 'chord',
      activeKeys.has(m) && 'active',
    ]
      .filter(Boolean)
      .join(' ');
  };

  return (
    <div className="keyboard-inner" role="group" aria-label="Piano keyboard">
      {whites.map((m) => (
          <div
            key={m}
            className={classNames(m, 'white')}
            style={{ width: `${whiteWidth}%` }}
            onPointerDown={press(m)}
            onPointerUp={release(m)}
            onPointerLeave={release(m)}
            onPointerCancel={release(m)}
          >
            {m % 12 === 0 && <span className="key-label">{midiToName(m)}</span>}
          </div>
        ))}

        {blacks.map((m) => {
          // Every black key sits directly after a white key (m - 1).
          const leftWhiteIndex = whites.indexOf(m - 1);
          const left = (leftWhiteIndex + 1) * whiteWidth;
          return (
            <div
              key={m}
              className={classNames(m, 'black')}
              style={{
                left: `calc(${left}% - ${blackWidth / 2}%)`,
                width: `${blackWidth}%`,
              }}
              onPointerDown={press(m)}
              onPointerUp={release(m)}
              onPointerLeave={release(m)}
              onPointerCancel={release(m)}
            />
          );
        })}
    </div>
  );
}

/**
 * Memoized so unrelated App re-renders (e.g. a pitch-bend meter updating rapidly)
 * don't repaint all 49 keys. Re-renders only when its own props change.
 */
export const PianoKeyboard = memo(PianoKeyboardBase);
