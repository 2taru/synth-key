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
  onPress?: (midi: number) => void;
  onRelease?: (midi: number) => void;
}

/**
 * A visual piano. White keys flow in a flex row; black keys are absolutely
 * positioned over the gaps between them. Purely presentational — it renders
 * whatever `activeKeys` / `chordKeys` it is given.
 */
function PianoKeyboardBase({
  low,
  high,
  activeKeys,
  chordKeys,
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
    onPress?.(m); // trigger sound first — never let capture failures block it
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch {
      /* ignore: capture can fail for synthetic/edge pointers */
    }
  };
  const release = (m: number) => () => onRelease?.(m);

  const classNames = (m: number, base: string): string =>
    [
      'key',
      base,
      activeKeys.has(m) && 'active',
      chordKeys.has(m) && 'chord',
    ]
      .filter(Boolean)
      .join(' ');

  return (
    <div className="keyboard" role="group" aria-label="Piano keyboard">
      <div className="keyboard-inner">
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
    </div>
  );
}

/**
 * Memoized so unrelated App re-renders (e.g. a pitch-bend meter updating rapidly)
 * don't repaint all 49 keys. Re-renders only when its own props change.
 */
export const PianoKeyboard = memo(PianoKeyboardBase);
