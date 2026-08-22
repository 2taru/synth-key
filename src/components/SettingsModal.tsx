import type { Colors } from '../settings';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Slider as UiSlider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  onClose: () => void;
  colors: Colors;
  onColorChange: (key: keyof Colors, value: string) => void;
  onReset: () => void;
  keyHeight: number;
  onKeyHeight: (v: number) => void;
  noteSpeed: number;
  onNoteSpeed: (v: number) => void;
}

type ColorRow = { key: keyof Colors; label: string; hint: string };

const PALETTE_ROWS: ColorRow[] = [
  { key: 'accent', label: 'Accent', hint: 'Buttons, toggles, sliders' },
  { key: 'played', label: 'Played keys', hint: 'Keys you press' },
  { key: 'target', label: 'To-play keys', hint: 'Song / practice targets' },
  { key: 'chord', label: 'Chord keys', hint: 'Chord lookup highlight' },
  { key: 'noteWhite', label: 'Notes (white keys)', hint: 'Waterfall / song roll' },
  { key: 'noteBlack', label: 'Notes (black keys)', hint: 'Waterfall / song roll' },
];

const BACKGROUND_ROWS: ColorRow[] = [
  { key: 'bgBase', label: 'App background', hint: 'Page backdrop' },
  { key: 'bgPanel', label: 'Panel background', hint: 'Cards & panels' },
  { key: 'stageTop', label: 'Stage top', hint: 'Waterfall gradient (top)' },
  { key: 'stageBottom', label: 'Stage bottom', hint: 'Waterfall gradient (bottom)' },
];

function SectionTitle({ children }: { children: string }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </h3>
  );
}

function ColorRows({
  rows,
  colors,
  onColorChange,
}: {
  rows: ColorRow[];
  colors: Colors;
  onColorChange: (key: keyof Colors, value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {rows.map(({ key, label, hint }) => (
        <label
          key={key}
          className="flex cursor-pointer items-center gap-3 rounded-lg px-1 py-1.5 hover:bg-accent/40"
        >
          <input
            type="color"
            value={colors[key]}
            onChange={(e) => onColorChange(key, e.target.value)}
            aria-label={label}
            className="h-8 w-8 shrink-0 cursor-pointer rounded-md border border-border bg-transparent p-0.5"
          />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-sm font-medium text-foreground">{label}</span>
            <span className="text-xs text-muted-foreground">{hint}</span>
          </span>
          <span className="shrink-0 font-mono text-xs uppercase text-muted-foreground">
            {colors[key]}
          </span>
        </label>
      ))}
    </div>
  );
}

function RangeRow({
  label,
  hint,
  value,
  min,
  max,
  step,
  onChange,
  suffix,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  suffix: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="tabular-nums text-xs text-muted-foreground">
          {value}
          {suffix}
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
      <span className="text-xs text-muted-foreground">{hint}</span>
    </div>
  );
}

export function SettingsModal({
  open,
  onClose,
  colors,
  onColorChange,
  onReset,
  keyHeight,
  onKeyHeight,
  noteSpeed,
  onNoteSpeed,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent aria-label="Settings">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <SectionTitle>Colors</SectionTitle>
            <ColorRows
              rows={PALETTE_ROWS}
              colors={colors}
              onColorChange={onColorChange}
            />
          </div>

          <div className="flex flex-col gap-2">
            <SectionTitle>Background</SectionTitle>
            <ColorRows
              rows={BACKGROUND_ROWS}
              colors={colors}
              onColorChange={onColorChange}
            />
          </div>

          <div className="flex flex-col gap-4">
            <SectionTitle>Keyboard &amp; motion</SectionTitle>
            <RangeRow
              label="Key height"
              hint="On-screen key size (also drag the handle)."
              value={keyHeight}
              min={90}
              max={420}
              step={2}
              onChange={onKeyHeight}
              suffix="px"
            />
            <RangeRow
              label="Note speed"
              hint="Waterfall / song-roll scroll speed."
              value={noteSpeed}
              min={40}
              max={320}
              step={5}
              onChange={onNoteSpeed}
              suffix="px/s"
            />
          </div>

          <Button type="button" variant="outline" onClick={onReset}>
            Reset to defaults
          </Button>

          <p className="text-xs text-muted-foreground">
            Settings are saved to this browser (localStorage).
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
