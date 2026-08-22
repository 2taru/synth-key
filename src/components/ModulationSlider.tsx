import { Slider as UiSlider } from '@/components/ui/slider';

interface Props {
  /** Modulation amount, 0..127 (MIDI CC1). */
  value: number;
  onChange: (value: number) => void;
}

export function ModulationSlider({ value, onChange }: Props) {
  const pct = Math.round((value / 127) * 100);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">Modulation</span>
        {value > 0 && (
          <span className="tabular-nums text-muted-foreground">{pct}%</span>
        )}
      </div>
      <UiSlider
        min={0}
        max={127}
        step={1}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        aria-label="Modulation amount"
      />
    </div>
  );
}
