import { useState, type ReactNode } from 'react';
import { Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getScale, TONICS } from '../music/scales';
import { cn } from '@/lib/utils';

interface Props {
  /** Audition a set of MIDI notes; `arpeggio` staggers them melodically. */
  onPlayNotes: (midis: number[], arpeggio?: boolean) => void;
}

// Pitch-class names in sharp spelling, aligned with the rest of the app.
const NAMES = TONICS;
// Middle-register root so voicings sit in a comfortable octave.
const BASE_MIDI = 60; // C4

/** All simple intervals within one octave. */
interface IntervalRef {
  semis: number;
  short: string;
  name: string;
}

const INTERVALS: IntervalRef[] = [
  { semis: 0, short: 'P1', name: 'Unison' },
  { semis: 1, short: 'm2', name: 'Minor 2nd' },
  { semis: 2, short: 'M2', name: 'Major 2nd' },
  { semis: 3, short: 'm3', name: 'Minor 3rd' },
  { semis: 4, short: 'M3', name: 'Major 3rd' },
  { semis: 5, short: 'P4', name: 'Perfect 4th' },
  { semis: 6, short: 'TT', name: 'Tritone' },
  { semis: 7, short: 'P5', name: 'Perfect 5th' },
  { semis: 8, short: 'm6', name: 'Minor 6th' },
  { semis: 9, short: 'M6', name: 'Major 6th' },
  { semis: 10, short: 'm7', name: 'Minor 7th' },
  { semis: 11, short: 'M7', name: 'Major 7th' },
  { semis: 12, short: 'P8', name: 'Octave' },
];

/** A step in a stacked-thirds diagram: the interval that adds the next note. */
interface Step {
  semi: number;
  label: string;
}

interface TriadRef {
  name: string;
  symbol: string;
  degrees: string;
  /** How the chord is built, one interval at a time from the bottom. */
  stack: Step[];
  blurb: string;
}

const TRIADS: TriadRef[] = [
  {
    name: 'Major',
    symbol: 'C',
    degrees: '1 · 3 · 5',
    stack: [
      { semi: 4, label: 'M3' },
      { semi: 3, label: 'm3' },
    ],
    blurb: 'A major third on the bottom — bright and stable.',
  },
  {
    name: 'Minor',
    symbol: 'Cm',
    degrees: '1 · ♭3 · 5',
    stack: [
      { semi: 3, label: 'm3' },
      { semi: 4, label: 'M3' },
    ],
    blurb: 'The thirds swap — minor on the bottom, darker in colour.',
  },
  {
    name: 'Diminished',
    symbol: 'C°',
    degrees: '1 · ♭3 · ♭5',
    stack: [
      { semi: 3, label: 'm3' },
      { semi: 3, label: 'm3' },
    ],
    blurb: 'Two minor thirds — tense, wants to resolve.',
  },
  {
    name: 'Augmented',
    symbol: 'C+',
    degrees: '1 · 3 · ♯5',
    stack: [
      { semi: 4, label: 'M3' },
      { semi: 4, label: 'M3' },
    ],
    blurb: 'Two major thirds — restless and symmetrical.',
  },
];

interface ChordRef {
  name: string;
  symbol: string;
  degrees: string;
  /** Absolute semitone offsets from the root. */
  semis: number[];
  /** The stacked-interval recipe, e.g. "M3 + m3 + M3". */
  recipe: string;
}

const SEVENTHS: ChordRef[] = [
  { name: 'Major 7th', symbol: 'maj7', degrees: '1 · 3 · 5 · 7', semis: [0, 4, 7, 11], recipe: 'M3 + m3 + M3' },
  { name: 'Dominant 7th', symbol: '7', degrees: '1 · 3 · 5 · ♭7', semis: [0, 4, 7, 10], recipe: 'M3 + m3 + m3' },
  { name: 'Minor 7th', symbol: 'm7', degrees: '1 · ♭3 · 5 · ♭7', semis: [0, 3, 7, 10], recipe: 'm3 + M3 + m3' },
  { name: 'Minor 7th ♭5', symbol: 'm7♭5', degrees: '1 · ♭3 · ♭5 · ♭7', semis: [0, 3, 6, 10], recipe: 'm3 + m3 + M3' },
  { name: 'Diminished 7th', symbol: '°7', degrees: '1 · ♭3 · ♭5 · ♭♭7', semis: [0, 3, 6, 9], recipe: 'm3 + m3 + m3' },
  { name: 'Minor–major 7th', symbol: 'mMaj7', degrees: '1 · ♭3 · 5 · 7', semis: [0, 3, 7, 11], recipe: 'm3 + M3 + M3' },
];

const COLOUR: ChordRef[] = [
  { name: 'Suspended 2nd', symbol: 'sus2', degrees: '1 · 2 · 5', semis: [0, 2, 7], recipe: 'M2 + P4' },
  { name: 'Suspended 4th', symbol: 'sus4', degrees: '1 · 4 · 5', semis: [0, 5, 7], recipe: 'P4 + M2' },
  { name: 'Major 6th', symbol: '6', degrees: '1 · 3 · 5 · 6', semis: [0, 4, 7, 9], recipe: 'M3 + m3 + M2' },
  { name: 'Minor 6th', symbol: 'm6', degrees: '1 · ♭3 · 5 · 6', semis: [0, 3, 7, 9], recipe: 'm3 + M3 + M2' },
  { name: 'Added 9th', symbol: 'add9', degrees: '1 · 3 · 5 · 9', semis: [0, 4, 7, 14], recipe: 'triad + a 9th' },
];

const EXTENDED: ChordRef[] = [
  { name: 'Dominant 9th', symbol: '9', degrees: '1 · 3 · 5 · ♭7 · 9', semis: [0, 4, 7, 10, 14], recipe: '7 + M3' },
  { name: 'Major 9th', symbol: 'maj9', degrees: '1 · 3 · 5 · 7 · 9', semis: [0, 4, 7, 11, 14], recipe: 'maj7 + m3' },
  { name: 'Dominant 11th', symbol: '11', degrees: '1 · (3) · 5 · ♭7 · 9 · 11', semis: [0, 7, 10, 14, 17], recipe: '9 + P4' },
  { name: 'Dominant 13th', symbol: '13', degrees: '1 · 3 · 5 · ♭7 · 9 · 13', semis: [0, 4, 7, 10, 14, 21], recipe: '9 + M6' },
];

// Chroma (0..11) of a pitch-class name, handling both flat and sharp spelling.
const CHROMA: Record<string, number> = {
  C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5,
  'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11,
};

function pcChroma(pc: string): number | null {
  const key = pc.length > 1 ? pc[0].toUpperCase() + pc.slice(1) : pc.toUpperCase();
  return key in CHROMA ? CHROMA[key] : null;
}

/** Voice a set of pitch classes into ascending MIDI numbers from a base octave. */
function voice(pcs: string[], baseOctave = 4): number[] {
  const out: number[] = [];
  let octave = baseOctave;
  let prev = -1;
  for (const pc of pcs) {
    const chroma = pcChroma(pc);
    if (chroma == null) continue;
    if (chroma <= prev) octave += 1;
    prev = chroma;
    out.push((octave + 1) * 12 + chroma);
  }
  return out;
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </h3>
  );
}

/** A pitch-class chip; the root is highlighted. */
function NoteChip({ label, root = false }: { label: string; root?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm font-medium',
        root
          ? 'bg-primary text-primary-foreground'
          : 'bg-secondary text-secondary-foreground',
      )}
    >
      {label}
    </span>
  );
}

/** A tiny play button reused across the page. */
function PlayButton({
  onClick,
  title,
}: {
  onClick: () => void;
  title: string;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
      onClick={onClick}
      title={title}
      aria-label={title}
    >
      <Play />
    </Button>
  );
}

export function TheoryGuide({ onPlayNotes }: Props) {
  const [root, setRoot] = useState('C');
  const rootChroma = NAMES.indexOf(root);
  const rootMidi = BASE_MIDI + rootChroma;

  const pc = (semi: number) => NAMES[(rootChroma + semi) % 12];
  const midis = (semis: number[]) => semis.map((s) => rootMidi + s);

  const scale = getScale(root, 'major');

  return (
    <div className="flex flex-col gap-4">
      {/* Intro + root picker */}
      <Card>
        <CardContent className="flex flex-col gap-3 pt-5 sm:pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold tracking-tight">
              Music theory
            </h2>
            <p className="max-w-prose text-sm text-muted-foreground">
              A quick reference for intervals and how chords are stacked from
              them. Pick a root and tap any{' '}
              <Play className="inline h-3.5 w-3.5 -translate-y-px" /> to hear it.
            </p>
          </div>
          <label className="flex shrink-0 flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Root note
            </span>
            <Select value={root} onValueChange={setRoot}>
              <SelectTrigger className="w-28" aria-label="Root note">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NAMES.map((n) => (
                  <SelectItem key={n} value={n}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        </CardContent>
      </Card>

      {/* Intervals */}
      <Card>
        <CardContent className="flex flex-col gap-4 pt-5 sm:pt-5">
          <div className="flex flex-col gap-1">
            <SectionHeading>Intervals</SectionHeading>
            <p className="text-sm text-muted-foreground">
              An interval is the distance between two notes, measured in
              semitones (half-steps). Every chord is a specific stack of these.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {INTERVALS.map((iv) => (
              <button
                key={iv.semis}
                type="button"
                className="group flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-2.5 py-1.5 text-left transition-colors hover:border-primary/60 hover:bg-accent/50"
                onClick={() =>
                  onPlayNotes(
                    iv.semis === 0
                      ? [rootMidi]
                      : [rootMidi, rootMidi + iv.semis],
                    true,
                  )
                }
                title={`${pc(0)} → ${pc(iv.semis)} · hear it`}
              >
                <span className="w-8 shrink-0 font-semibold text-primary">
                  {iv.short}
                </span>
                <span className="min-w-0 flex-1 truncate text-xs text-foreground">
                  {iv.name}
                </span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {iv.semis} st
                </span>
                <Play className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Building triads from thirds */}
      <Card>
        <CardContent className="flex flex-col gap-4 pt-5 sm:pt-5">
          <div className="flex flex-col gap-1">
            <SectionHeading>Building a chord from intervals</SectionHeading>
            <p className="text-sm text-muted-foreground">
              A triad stacks two thirds. A <strong>major third</strong> spans 4
              semitones, a <strong>minor third</strong> spans 3. Which thirds you
              pick — and their order — decides the chord's quality.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {TRIADS.map((t) => {
              // Cumulative note offsets from the stacked intervals.
              const offsets = t.stack.reduce<number[]>(
                (acc, step) => [...acc, acc[acc.length - 1] + step.semi],
                [0],
              );
              return (
                <div
                  key={t.name}
                  className="flex flex-col gap-2 rounded-xl border border-border bg-secondary/30 p-3 sm:flex-row sm:items-center sm:gap-4"
                >
                  <div className="flex w-full items-center justify-between gap-2 sm:w-44 sm:shrink-0">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-foreground">
                        {t.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {t.degrees}
                      </span>
                    </div>
                    <PlayButton
                      onClick={() => onPlayNotes(midis(offsets))}
                      title={`Hear ${pc(0)} ${t.name.toLowerCase()}`}
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
                    {offsets.map((off, i) => (
                      <span key={i} className="flex items-center gap-1.5">
                        {i > 0 && (
                          <span className="rounded-full border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                            {t.stack[i - 1].label}
                          </span>
                        )}
                        <NoteChip label={pc(off)} root={i === 0} />
                      </span>
                    ))}
                    <span className="ml-1 hidden text-xs text-muted-foreground lg:inline">
                      {t.blurb}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Seventh chords */}
      <ChordFamily
        heading="Seventh chords"
        intro="Add one more third on top of a triad and you get a four-note seventh chord. The top interval colours the sound."
        chords={SEVENTHS}
        pc={pc}
        midis={midis}
        onPlayNotes={onPlayNotes}
        rootLabel={pc(0)}
      />

      {/* Suspended, sixths & added */}
      <ChordFamily
        heading="Suspended, sixth & added"
        intro="Replace or add a note to shift the flavour without a full seventh chord — the third is suspended, or a sixth / ninth is layered on."
        chords={COLOUR}
        pc={pc}
        midis={midis}
        onPlayNotes={onPlayNotes}
        rootLabel={pc(0)}
      />

      {/* Extended chords */}
      <ChordFamily
        heading="Extended chords"
        intro="Keep stacking thirds past the seventh to reach the 9th, 11th and 13th — the lush, jazzy extensions."
        chords={EXTENDED}
        pc={pc}
        midis={midis}
        onPlayNotes={onPlayNotes}
        rootLabel={pc(0)}
      />

      {/* Diatonic chords in the major key */}
      <Card>
        <CardContent className="flex flex-col gap-4 pt-5 sm:pt-5">
          <div className="flex flex-col gap-1">
            <SectionHeading>Chords in the key of {root} major</SectionHeading>
            <p className="text-sm text-muted-foreground">
              Stack thirds on each note of the scale and you get the seven
              diatonic chords. The pattern of qualities is the same in every
              major key: major, minor, minor, major, major, minor, diminished.
            </p>
          </div>
          {scale.ok && scale.chords.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-7">
              {scale.chords.map((c) => (
                <button
                  key={c.roman}
                  type="button"
                  className="flex flex-col items-center gap-0.5 rounded-lg border border-border bg-secondary/40 px-2 py-2.5 transition-colors hover:border-primary/60 hover:bg-accent/50"
                  onClick={() => onPlayNotes(voice(c.notes))}
                  title={`${c.symbol} — hear it`}
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
        </CardContent>
      </Card>
    </div>
  );
}

/** A titled card holding a responsive grid of chord recipes. */
function ChordFamily({
  heading,
  intro,
  chords,
  pc,
  midis,
  onPlayNotes,
  rootLabel,
}: {
  heading: string;
  intro: string;
  chords: ChordRef[];
  pc: (semi: number) => string;
  midis: (semis: number[]) => number[];
  onPlayNotes: (midis: number[], arpeggio?: boolean) => void;
  rootLabel: string;
}): ReactNode {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 pt-5 sm:pt-5">
        <div className="flex flex-col gap-1">
          <SectionHeading>{heading}</SectionHeading>
          <p className="text-sm text-muted-foreground">{intro}</p>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {chords.map((c) => (
            <div
              key={c.symbol}
              className="flex flex-col gap-2 rounded-xl border border-border bg-secondary/30 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-semibold text-foreground">
                    {c.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {rootLabel}
                    {c.symbol} · {c.degrees}
                  </span>
                </div>
                <PlayButton
                  onClick={() => onPlayNotes(midis(c.semis))}
                  title={`Hear ${rootLabel}${c.symbol}`}
                />
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {c.semis.map((s, i) => (
                  <NoteChip key={i} label={pc(s)} root={i === 0} />
                ))}
                <span className="ml-auto rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-primary">
                  {c.recipe}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
