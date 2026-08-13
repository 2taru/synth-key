interface Props {
  label: string;
  /** 0..1 */
  value: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
}

export function Slider({ label, value, onChange, format }: Props) {
  return (
    <div className="control">
      <span className="control-label">
        {label}
        <span className="pb-value">
          {format ? format(value) : `${Math.round(value * 100)}%`}
        </span>
      </span>
      <input
        type="range"
        className="mod-slider"
        min={0}
        max={100}
        value={Math.round(value * 100)}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        aria-label={label}
      />
    </div>
  );
}
