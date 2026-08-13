interface Props {
  /** Modulation amount, 0..127 (MIDI CC1). */
  value: number;
  onChange: (value: number) => void;
}

export function ModulationSlider({ value, onChange }: Props) {
  const pct = Math.round((value / 127) * 100);
  return (
    <div className="control modulation">
      <span className="control-label">
        Modulation
        {value > 0 && <span className="pb-value">{pct}%</span>}
      </span>
      <input
        type="range"
        className="mod-slider"
        min={0}
        max={127}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Modulation amount"
      />
    </div>
  );
}
