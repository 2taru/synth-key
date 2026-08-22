import { Panel } from './Panel';
import { Slider } from './Slider';
import { Slider as UiSlider } from '@/components/ui/slider';

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

/** A labelled range over an arbitrary numeric span. */
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
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="tabular-nums text-muted-foreground">
          {format(value)}
        </span>
      </div>
      <UiSlider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        aria-label={label}
      />
    </div>
  );
}

const secs = (v: number) => `${v.toFixed(2)}s`;

function Heading({ children }: { children: string }) {
  return (
    <h3 className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </h3>
  );
}

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
    <Panel id="sound" title="Sound shaping" defaultCollapsed>
      <div className="flex flex-col gap-5">
        <Range
          label="Transpose"
          value={transpose}
          min={-12}
          max={12}
          step={1}
          onChange={onTranspose}
          format={(v) => (v === 0 ? '0' : `${v > 0 ? '+' : ''}${v} st`)}
        />

        <Heading>Envelope</Heading>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Range label="Attack" value={attack} min={0.001} max={1.5} step={0.001} onChange={onAttack} format={secs} />
          <Range label="Decay" value={decay} min={0.001} max={2} step={0.001} onChange={onDecay} format={secs} />
          <Slider label="Sustain" value={sustain} onChange={onSustain} />
          <Range label="Release" value={release} min={0.01} max={3} step={0.01} onChange={onRelease} format={secs} />
        </div>

        <Heading>Effects</Heading>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Slider label="Delay" value={delay} onChange={onDelay} />
          <Slider label="Chorus" value={chorus} onChange={onChorus} />
        </div>
      </div>
    </Panel>
  );
}
