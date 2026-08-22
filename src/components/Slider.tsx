import { Slider as UiSlider } from '@/components/ui/slider';

interface Props {
  label: string;
  /** 0..1 */
  value: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
}

export function Slider({ label, value, onChange, format }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="tabular-nums text-muted-foreground">
          {format ? format(value) : `${Math.round(value * 100)}%`}
        </span>
      </div>
      <UiSlider
        min={0}
        max={1}
        step={0.01}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        aria-label={label}
      />
    </div>
  );
}
