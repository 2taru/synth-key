import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Panel } from './Panel';
import { cn } from '@/lib/utils';

interface Props {
  metronomeOn: boolean;
  onMetronome: (on: boolean) => void;
  timeSigNum: number;
  timeSigDen: number;
  onTimeSig: (num: number, den: number) => void;
  accentStrong: boolean;
  onAccentStrong: (on: boolean) => void;
  playWeak: boolean;
  onPlayWeak: (on: boolean) => void;
  /** Current beat within the bar (-1 when idle) for the visual indicator. */
  beat: number;
}

const PRESETS: [number, number][] = [
  [4, 4],
  [3, 4],
  [2, 4],
  [6, 8],
];
const DENOMINATORS = [1, 2, 4, 8, 16];

export function MetronomePanel({
  metronomeOn,
  onMetronome,
  timeSigNum,
  timeSigDen,
  onTimeSig,
  accentStrong,
  onAccentStrong,
  playWeak,
  onPlayWeak,
  beat,
}: Props) {
  const beats = Array.from({ length: Math.max(1, timeSigNum) }, (_, i) => i);

  return (
    <Panel
      id="metronome"
      title="Metronome"
      defaultCollapsed
      headerExtra={
        <Switch
          checked={metronomeOn}
          onCheckedChange={onMetronome}
          aria-label="Metronome on"
        />
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-foreground">
            Time signature
          </span>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={1}
              max={32}
              value={timeSigNum}
              onChange={(e) => onTimeSig(Number(e.target.value) || 1, timeSigDen)}
              aria-label="Beats per bar"
              className="w-16 text-center tabular-nums"
            />
            <span className="text-muted-foreground">/</span>
            <Select
              value={String(timeSigDen)}
              onValueChange={(v) => onTimeSig(timeSigNum, Number(v))}
            >
              <SelectTrigger className="w-20" aria-label="Beat note value">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DENOMINATORS.map((d) => (
                  <SelectItem key={d} value={String(d)}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map(([n, d]) => (
              <Button
                key={`${n}/${d}`}
                type="button"
                size="sm"
                variant={
                  n === timeSigNum && d === timeSigDen ? 'default' : 'outline'
                }
                onClick={() => onTimeSig(n, d)}
              >
                {n}/{d}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5" aria-hidden>
            {beats.map((i) => (
              <span
                key={i}
                className={cn(
                  'h-2.5 w-2.5 rounded-full transition-colors',
                  i === 0 ? 'bg-muted-foreground/60' : 'bg-muted-foreground/30',
                  metronomeOn &&
                    i === beat &&
                    (i === 0
                      ? 'scale-125 bg-primary'
                      : 'scale-110 bg-foreground'),
                )}
              />
            ))}
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            <Switch
              checked={accentStrong}
              onCheckedChange={onAccentStrong}
              aria-label="Strong beat"
            />
            Strong beat
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            <Switch
              checked={playWeak}
              onCheckedChange={onPlayWeak}
              aria-label="Weak beats"
            />
            Weak beats
          </label>
        </div>
      </div>
    </Panel>
  );
}
