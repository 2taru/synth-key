import { Panel } from './Panel';
import { midiToName } from '../audio/notes';
import { Button } from '@/components/ui/button';
import { Slider as UiSlider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type LayerMode = 'off' | 'layer' | 'split';

interface Props {
  mode: LayerMode;
  onMode: (m: LayerMode) => void;
  primaryName: string;
  secondary: string;
  onSecondary: (name: string) => void;
  /** Instrument names that are loaded and ready to be a second voice. */
  readyInstruments: string[];
  splitPoint: number;
  onSplitPoint: (midi: number) => void;
  low: number;
  high: number;
}

const MODES: { key: LayerMode; label: string }[] = [
  { key: 'off', label: 'Single' },
  { key: 'layer', label: 'Layer' },
  { key: 'split', label: 'Split' },
];

const NONE = '__none__';

const pretty = (name: string) =>
  name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export function SplitPanel({
  mode,
  onMode,
  primaryName,
  secondary,
  onSecondary,
  readyInstruments,
  splitPoint,
  onSplitPoint,
  low,
  high,
}: Props) {
  const others = readyInstruments.filter((n) => n !== primaryName);

  return (
    <Panel id="split" title="Split / Layer" defaultCollapsed>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-2">
          {MODES.map((m) => (
            <Button
              key={m.key}
              type="button"
              size="sm"
              variant={mode === m.key ? 'default' : 'outline'}
              onClick={() => onMode(m.key)}
            >
              {m.label}
            </Button>
          ))}
        </div>

        {mode !== 'off' && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-foreground">
                Second sound
              </span>
              {others.length > 0 ? (
                <Select
                  value={secondary || NONE}
                  onValueChange={(v) => onSecondary(v === NONE ? '' : v)}
                >
                  <SelectTrigger aria-label="Second instrument">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>— none —</SelectItem>
                    {others.map((n) => (
                      <SelectItem key={n} value={n}>
                        {pretty(n)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Load another sound from the library to use as the second
                  voice.
                </p>
              )}
            </div>

            {mode === 'split' && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">
                    Split point
                  </span>
                  <span className="tabular-nums text-muted-foreground">
                    {midiToName(splitPoint)}
                  </span>
                </div>
                <UiSlider
                  min={low}
                  max={high}
                  step={1}
                  value={[splitPoint]}
                  onValueChange={([v]) => onSplitPoint(v)}
                  aria-label="Split point"
                />
                <p className="text-xs text-muted-foreground">
                  Below plays the second sound; at and above plays{' '}
                  {pretty(primaryName)}.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Panel>
  );
}
