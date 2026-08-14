interface Props {
  /** Bottom / top visible octave (C of that octave). */
  lowOctave: number;
  highOctave: number;
  minOctave: number;
  maxOctave: number;
  onLowOctave: (o: number) => void;
  onHighOctave: (o: number) => void;
  onDown: () => void;
  onUp: () => void;
  canDown: boolean;
  canUp: boolean;
  follow: boolean;
  onFollowChange: (follow: boolean) => void;
}

/** Options C{min}..C{max}, optionally clamped to a sub-range. */
function octaveOptions(min: number, max: number): number[] {
  const out: number[] = [];
  for (let o = min; o <= max; o++) out.push(o);
  return out;
}

export function OctaveControl({
  lowOctave,
  highOctave,
  minOctave,
  maxOctave,
  onLowOctave,
  onHighOctave,
  onDown,
  onUp,
  canDown,
  canUp,
  follow,
  onFollowChange,
}: Props) {
  return (
    <div className="control octave-control">
      <span className="control-label">Keyboard range</span>

      <div className="octave-range-pickers">
        <select
          className="octave-select"
          value={lowOctave}
          onChange={(e) => onLowOctave(Number(e.target.value))}
          aria-label="Lowest octave"
        >
          {octaveOptions(minOctave, highOctave - 1).map((o) => (
            <option key={o} value={o}>
              C{o}
            </option>
          ))}
        </select>
        <span className="octave-range-dash">–</span>
        <select
          className="octave-select"
          value={highOctave}
          onChange={(e) => onHighOctave(Number(e.target.value))}
          aria-label="Highest octave"
        >
          {octaveOptions(lowOctave + 1, maxOctave).map((o) => (
            <option key={o} value={o}>
              C{o}
            </option>
          ))}
        </select>
      </div>

      <div className="octave-shift-row">
        <div className="octave-buttons">
          <button
            type="button"
            onClick={onDown}
            disabled={!canDown || follow}
            aria-label="Shift keyboard down an octave"
          >
            −
          </button>
          <span className="octave-shift-label">Shift</span>
          <button
            type="button"
            onClick={onUp}
            disabled={!canUp || follow}
            aria-label="Shift keyboard up an octave"
          >
            +
          </button>
        </div>
        <label className="octave-follow" title="Track the octave you play on a MIDI keyboard">
          <input
            type="checkbox"
            checked={follow}
            onChange={(e) => onFollowChange(e.target.checked)}
          />
          Follow MIDI
        </label>
      </div>
    </div>
  );
}
