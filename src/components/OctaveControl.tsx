interface Props {
  rangeLabel: string;
  onDown: () => void;
  onUp: () => void;
  canDown: boolean;
  canUp: boolean;
  follow: boolean;
  onFollowChange: (follow: boolean) => void;
}

export function OctaveControl({
  rangeLabel,
  onDown,
  onUp,
  canDown,
  canUp,
  follow,
  onFollowChange,
}: Props) {
  return (
    <div className="control octave-control">
      <span className="control-label">Octave</span>
      <div className="octave-buttons">
        <button
          type="button"
          onClick={onDown}
          disabled={!canDown || follow}
          aria-label="Shift keyboard down an octave"
        >
          −
        </button>
        <span className="octave-range">{rangeLabel}</span>
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
  );
}
