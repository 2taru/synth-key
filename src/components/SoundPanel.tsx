import { Panel } from './Panel';
import { Slider } from './Slider';

interface Props {
  transpose: number;
  onTranspose: (v: number) => void;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  onAttack: (v: number) => void;
  onDecay: (v: number) => void;
  onSustain: (v: number) => void;
  onRelease: (v: number) => void;
  delay: number;
  onDelay: (v: number) => void;
  chorus: number;
  onChorus: (v: number) => void;
}

/** A labelled range input over an arbitrary numeric span. */
function Range({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
}) {
  return (
    <div className="control">
      <span className="control-label">
        {label}
        <span className="pb-value">{format(value)}</span>
      </span>
      <input
        type="range"
        className="mod-slider"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
      />
    </div>
  );
}

const secs = (v: number) => `${v.toFixed(2)}s`;

export function SoundPanel({
  transpose,
  onTranspose,
  attack,
  decay,
  sustain,
  release,
  onAttack,
  onDecay,
  onSustain,
  onRelease,
  delay,
  onDelay,
  chorus,
  onChorus,
}: Props) {
  return (
    <Panel id="sound" title="Sound shaping" className="sound" defaultCollapsed>
      <div className="sound-grid">
        <Range
          label="Transpose"
          value={transpose}
          min={-12}
          max={12}
          step={1}
          onChange={onTranspose}
          format={(v) => (v === 0 ? '0' : `${v > 0 ? '+' : ''}${v} st`)}
        />
      </div>

      <h3 className="sound-heading">Envelope</h3>
      <div className="sound-grid">
        <Range label="Attack" value={attack} min={0.001} max={1.5} step={0.001} onChange={onAttack} format={secs} />
        <Range label="Decay" value={decay} min={0.001} max={2} step={0.001} onChange={onDecay} format={secs} />
        <Slider label="Sustain" value={sustain} onChange={onSustain} />
        <Range label="Release" value={release} min={0.01} max={3} step={0.01} onChange={onRelease} format={secs} />
      </div>

      <h3 className="sound-heading">Effects</h3>
      <div className="sound-grid">
        <Slider label="Delay" value={delay} onChange={onDelay} />
        <Slider label="Chorus" value={chorus} onChange={onChorus} />
      </div>
    </Panel>
  );
}
