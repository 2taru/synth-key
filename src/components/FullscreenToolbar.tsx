import { Circle, ChevronUp, ChevronDown, X, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
  visualizer: boolean;
  onVisualizer: (v: boolean) => void;
  noteWaterfall: boolean;
  onNoteWaterfall: (v: boolean) => void;
  chordDetect: boolean;
  onChordDetect: (v: boolean) => void;
  intervalDetect: boolean;
  onIntervalDetect: (v: boolean) => void;
  chordLookup: boolean;
  onChordLookup: (v: boolean) => void;
  sustain: boolean;
  onSustain: (v: boolean) => void;
  metronomeOn: boolean;
  onMetronome: (v: boolean) => void;
  recording: boolean;
  recPlaying: boolean;
  onRecord: () => void;
  rangeLabel: string;
  onDown: () => void;
  onUp: () => void;
  canDown: boolean;
  canUp: boolean;
  minimized: boolean;
  onToggleMin: () => void;
  onExit: () => void;
}

function Pill({
  active,
  onClick,
  label,
  title,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title ?? label}
      aria-pressed={active}
      className={cn(
        'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      )}
    >
      {label}
    </button>
  );
}

/**
 * The top toolbar shown while the stage is fullscreen. Because only the stage
 * element is fullscreen, every runtime control the player might want lives here.
 * Collapses to a slim handle so it stays out of the way.
 */
export function FullscreenToolbar({
  visualizer,
  onVisualizer,
  noteWaterfall,
  onNoteWaterfall,
  chordDetect,
  onChordDetect,
  intervalDetect,
  onIntervalDetect,
  chordLookup,
  onChordLookup,
  sustain,
  onSustain,
  metronomeOn,
  onMetronome,
  recording,
  recPlaying,
  onRecord,
  rangeLabel,
  onDown,
  onUp,
  canDown,
  canUp,
  minimized,
  onToggleMin,
  onExit,
}: Props) {
  if (minimized) {
    return (
      <div className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-full border border-border bg-card/90 p-1 shadow-lg backdrop-blur">
        {recording && (
          <span
            className="ml-1 h-2.5 w-2.5 animate-pulse rounded-full bg-destructive"
            title="Recording"
          />
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onToggleMin}
          aria-label="Show toolbar"
        >
          <ChevronDown />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onExit}
          aria-label="Exit fullscreen"
        >
          <X />
        </Button>
      </div>
    );
  }

  return (
    <div className="absolute inset-x-2 top-2 z-10 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card/90 p-2 shadow-lg backdrop-blur">
      <div className="flex flex-wrap items-center gap-1.5">
        <Pill active={visualizer} onClick={() => onVisualizer(!visualizer)} label="Visualizer" />
        <Pill active={noteWaterfall} onClick={() => onNoteWaterfall(!noteWaterfall)} label="Waterfall" />
        <Pill active={chordDetect} onClick={() => onChordDetect(!chordDetect)} label="Chords" title="Chord detection" />
        <Pill active={intervalDetect} onClick={() => onIntervalDetect(!intervalDetect)} label="Intervals" title="Interval detection" />
        <Pill active={chordLookup} onClick={() => onChordLookup(!chordLookup)} label="Lookup" title="Chord lookup" />
        <Pill active={sustain} onClick={() => onSustain(!sustain)} label="Sustain" />
        <Pill active={metronomeOn} onClick={() => onMetronome(!metronomeOn)} label="Metronome" />
      </div>

      <Button
        type="button"
        variant={recording ? 'destructive' : 'secondary'}
        size="sm"
        onClick={onRecord}
        disabled={recPlaying}
        title={recording ? 'Stop recording' : 'Record'}
      >
        <Circle className={cn('fill-current', recording && 'animate-pulse')} />
        {recording ? 'Stop' : 'Rec'}
      </Button>

      <div className="flex items-center gap-1 rounded-full border border-border px-1">
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={onDown} disabled={!canDown} aria-label="Octave down">
          <Minus />
        </Button>
        <span className="min-w-16 text-center text-xs tabular-nums text-muted-foreground">
          {rangeLabel}
        </span>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={onUp} disabled={!canUp} aria-label="Octave up">
          <Plus />
        </Button>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={onToggleMin} aria-label="Minimize toolbar">
          <ChevronUp />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={onExit} aria-label="Exit fullscreen">
          <X />
        </Button>
      </div>
    </div>
  );
}
