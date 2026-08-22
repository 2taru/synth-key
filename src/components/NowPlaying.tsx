import type { DetectedChord as Detected } from '../music/chords';
import type { DetectedIntervals, IntervalInfo } from '../music/intervals';
import { Panel } from './Panel';

interface Props {
  /** Whether chord naming is enabled. */
  chordDetect: boolean;
  /** Whether interval analysis is enabled. */
  intervalDetect: boolean;
  detected: Detected | null;
  intervals: DetectedIntervals | null;
  /** How many notes are currently held (drives the empty/hint states). */
  heldCount: number;
}

function IntervalChip({ info }: { info: IntervalInfo }) {
  return (
    <span
      className="inline-flex items-baseline gap-1.5 rounded-full border border-border bg-secondary px-2.5 py-1 text-sm"
      title={`${info.label} · ${info.fromNote}→${info.toNote}`}
    >
      <span className="font-semibold text-foreground">{info.short}</span>
      <span className="text-xs text-muted-foreground">{info.label}</span>
    </span>
  );
}

/**
 * The "Now Playing" learning panel. Depending on which analyses are enabled it
 * names the chord being held, breaks it into its interval stack, or does both at
 * once — so you can see exactly which intervals a chord is made of.
 */
export function NowPlaying({
  chordDetect,
  intervalDetect,
  detected,
  intervals,
  heldCount,
}: Props) {
  const twoNotes = intervals != null && intervals.playedNotes.length === 2;

  const showChord = chordDetect && detected != null;
  const showIntervals = intervalDetect && intervals != null;
  const hasContent = showChord || showIntervals;

  return (
    <Panel id="now-playing" title="Now Playing">
      {/* Fixed min-height so the keyboard below never jumps between states. */}
      <div className="flex min-h-[92px] items-center">
        {hasContent ? (
          <div className="flex w-full flex-col gap-3">
            {showChord && (
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-3xl font-bold leading-none text-primary">
                  {detected!.symbol}
                </span>
                <span className="text-sm text-muted-foreground">
                  {detected!.name}
                </span>
                {detected!.alternatives.length > 0 && (
                  <span className="text-xs text-muted-foreground/80">
                    also: {detected!.alternatives.slice(0, 3).join(', ')}
                  </span>
                )}
              </div>
            )}

            {showIntervals && twoNotes && (
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-3xl font-bold leading-none text-primary">
                  {intervals!.stacked[0].short}
                </span>
                <span className="text-sm text-muted-foreground">
                  {intervals!.stacked[0].label}
                </span>
              </div>
            )}

            {showIntervals && !twoNotes && (
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="w-20 text-xs uppercase tracking-wide text-muted-foreground">
                    Stacked
                  </span>
                  <span className="flex flex-wrap gap-1.5">
                    {intervals!.stacked.map((iv, i) => (
                      <IntervalChip key={i} info={iv} />
                    ))}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="w-20 text-xs uppercase tracking-wide text-muted-foreground">
                    From root
                  </span>
                  <span className="flex flex-wrap gap-1.5">
                    {intervals!.fromRoot.map((iv, i) => (
                      <IntervalChip key={i} info={iv} />
                    ))}
                  </span>
                </div>
              </div>
            )}

            <span className="text-sm text-muted-foreground">
              {(intervals?.playedNotes ?? detected?.playedNotes ?? []).join(
                ' · ',
              )}
            </span>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {heldCount === 0
              ? intervalDetect && !chordDetect
                ? 'Play two or more notes to see their intervals…'
                : 'Play notes to analyze them…'
              : heldCount === 1
                ? 'Holding 1 note — add another for an interval'
                : `Holding ${heldCount} notes — add more for a chord`}
          </p>
        )}
      </div>
    </Panel>
  );
}
