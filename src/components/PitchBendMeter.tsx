interface Props {
  /** Normalized bend, -1 (down) .. 0 (center) .. +1 (up). */
  value: number;
}

export function PitchBendMeter({ value }: Props) {
  const clamped = Math.max(-1, Math.min(1, value));
  const percent = 50 + clamped * 50;
  const semis = (clamped * 2).toFixed(1).replace(/\.0$/, '');

  return (
    <div className="control pitchbend">
      <span className="control-label">
        Pitch bend
        {clamped !== 0 && (
          <span className="pb-value">
            {clamped > 0 ? '+' : ''}
            {semis}
          </span>
        )}
      </span>
      <div className="pb-track">
        <span className="pb-center" aria-hidden />
        <span className="pb-thumb" style={{ left: `${percent}%` }} aria-hidden />
      </div>
    </div>
  );
}
