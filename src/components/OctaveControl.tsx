import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Props {
  /** Bottom / top visible octave (C of that octave). */
  lowOctave: number;
  highOctave: number;
  minOctave: number;
  maxOctave: number;
  onLowOctave: (o: number) => void;
  onHighOctave: (o: number) => void;
  onDown: () => void;
  onUp: () => void;
  canDown: boolean;
  canUp: boolean;
  follow: boolean;
  onFollowChange: (follow: boolean) => void;
}

function octaveOptions(min: number, max: number): number[] {
  const out: number[] = [];
  for (let o = min; o <= max; o++) out.push(o);
  return out;
}

export function OctaveControl({
  lowOctave,
  highOctave,
  minOctave,
  maxOctave,
  onLowOctave,
  onHighOctave,
  onDown,
  onUp,
  canDown,
  canUp,
  follow,
  onFollowChange,
}: Props) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-sm font-medium text-foreground">Keyboard range</span>

      <div className="flex items-center gap-2">
        <Select
          value={String(lowOctave)}
          onValueChange={(v) => onLowOctave(Number(v))}
        >
          <SelectTrigger className="flex-1" aria-label="Lowest octave">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {octaveOptions(minOctave, highOctave - 1).map((o) => (
              <SelectItem key={o} value={String(o)}>
                C{o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-muted-foreground">–</span>
        <Select
          value={String(highOctave)}
          onValueChange={(v) => onHighOctave(Number(v))}
        >
          <SelectTrigger className="flex-1" aria-label="Highest octave">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {octaveOptions(lowOctave + 1, maxOctave).map((o) => (
              <SelectItem key={o} value={String(o)}>
                C{o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={onDown}
            disabled={!canDown || follow}
            aria-label="Shift keyboard down an octave"
          >
            <Minus />
          </Button>
          <span className="text-xs text-muted-foreground">Shift</span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={onUp}
            disabled={!canUp || follow}
            aria-label="Shift keyboard up an octave"
          >
            <Plus />
          </Button>
        </div>
        <label
          className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground"
          title="Track the octave you play on a MIDI keyboard"
        >
          Follow MIDI
          <Switch
            checked={follow}
            onCheckedChange={onFollowChange}
            aria-label="Follow MIDI octave"
          />
        </label>
      </div>
    </div>
  );
}
