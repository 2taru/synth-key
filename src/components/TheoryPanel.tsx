import { Note } from 'tonal';
import { Play } from 'lucide-react';
import { Panel } from './Panel';
import { TONICS, SCALE_TYPES, type ScaleInfo } from '../music/scales';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Props {
  tonic: string;
  scaleType: string;
  onTonic: (t: string) => void;
  onScaleType: (s: string) => void;
  info: ScaleInfo;
  /** Play a set of concrete MIDI notes (chord: together; scale: arpeggiated). */
  onPlayNotes: (midis: number[], arpeggio?: boolean) => void;
}

/** Voice pitch classes into ascending MIDI numbers from a base octave. */
function voice(pcs: string[], baseOctave = 4): number[] {
  const midis: number[] = [];
  let octave = baseOctave;
  let prev = -1;
  for (const pc of pcs) {
    const chroma = Note.chroma(pc);
    if (chroma == null) continue;
    if (chroma <= prev) octave += 1;
    prev = chroma;
    const m = Note.midi(`${pc}${octave}`);
    if (m != null) midis.push(m);
  }
  return midis;
}

export function TheoryPanel({
  tonic,
  scaleType,
  onTonic,
  onScaleType,
  info,
  onPlayNotes,
}: Props) {
  const playScale = () => {
    const asc = voice(info.notes);
    const top = asc.length ? asc[0] + 12 : null;
    onPlayNotes(top != null ? [...asc, top] : asc, true);
  };

  return (
    <Panel id="theory" title="Scales & keys">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex min-w-[6rem] flex-1 flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Key
            </span>
            <Select value={tonic} onValueChange={onTonic}>
              <SelectTrigger aria-label="Key / tonic">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TONICS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <label className="flex min-w-[8rem] flex-[2] flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Scale
            </span>
            <Select value={scaleType} onValueChange={onScaleType}>
              <SelectTrigger aria-label="Scale / mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SCALE_TYPES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <Button
            type="button"
            variant="outline"
            onClick={playScale}
            disabled={!info.ok}
            title="Play the scale ascending"
          >
            <Play /> Scale
          </Button>
        </div>

        {info.ok && (
          <>
            <div className="flex flex-wrap gap-1.5">
              {info.notes.map((n) => (
                <span
                  key={n}
                  className={cn(
                    'inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm font-medium',
                    Note.chroma(n) === info.tonicChroma
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground',
                  )}
                >
                  {n}
                </span>
              ))}
            </div>

            {info.chords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {info.chords.map((c) => (
                  <button
                    key={c.roman}
                    type="button"
                    className="flex flex-col items-center gap-0.5 rounded-lg border border-border bg-card px-3 py-2 transition-colors hover:border-primary/60 hover:bg-accent/50"
                    onClick={() => onPlayNotes(voice(c.notes))}
                    title={`${c.symbol} — click to hear`}
                  >
                    <span className="text-sm font-semibold text-primary">
                      {c.roman}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {c.symbol}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Panel>
  );
}
