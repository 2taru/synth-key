import { Panel } from './Panel';

interface IntervalRef {
  semitones: number;
  short: string;
  name: string;
}

const INTERVALS: IntervalRef[] = [
  { semitones: 0, short: 'P1', name: 'Unison' },
  { semitones: 1, short: 'm2', name: 'Minor second' },
  { semitones: 2, short: 'M2', name: 'Major second' },
  { semitones: 3, short: 'm3', name: 'Minor third' },
  { semitones: 4, short: 'M3', name: 'Major third' },
  { semitones: 5, short: 'P4', name: 'Perfect fourth' },
  { semitones: 6, short: 'TT', name: 'Tritone' },
  { semitones: 7, short: 'P5', name: 'Perfect fifth' },
  { semitones: 8, short: 'm6', name: 'Minor sixth' },
  { semitones: 9, short: 'M6', name: 'Major sixth' },
  { semitones: 10, short: 'm7', name: 'Minor seventh' },
  { semitones: 11, short: 'M7', name: 'Major seventh' },
  { semitones: 12, short: 'P8', name: 'Octave' },
];

interface ChordRef {
  name: string;
  formula: string;
  intervals: string;
}

const CHORDS: ChordRef[] = [
  { name: 'Major', formula: '1 · 3 · 5', intervals: 'M3 + m3' },
  { name: 'Minor', formula: '1 · ♭3 · 5', intervals: 'm3 + M3' },
  { name: 'Diminished', formula: '1 · ♭3 · ♭5', intervals: 'm3 + m3' },
  { name: 'Augmented', formula: '1 · 3 · ♯5', intervals: 'M3 + M3' },
  { name: 'Major 7th', formula: '1 · 3 · 5 · 7', intervals: 'M3 + m3 + M3' },
  { name: 'Dominant 7th', formula: '1 · 3 · 5 · ♭7', intervals: 'M3 + m3 + m3' },
  { name: 'Minor 7th', formula: '1 · ♭3 · 5 · ♭7', intervals: 'm3 + M3 + m3' },
  { name: 'Sus4', formula: '1 · 4 · 5', intervals: 'P4 + M2' },
];

function Heading({ children }: { children: string }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </h3>
  );
}

export function ReferencePanel() {
  return (
    <Panel id="reference" title="Reference" defaultCollapsed>
      <div className="flex flex-col gap-4">
        <Heading>Intervals</Heading>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {INTERVALS.map((iv) => (
            <div
              key={iv.semitones}
              className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-2.5 py-1.5"
            >
              <span className="font-semibold text-primary">{iv.short}</span>
              <span className="flex-1 truncate text-xs text-foreground">
                {iv.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {iv.semitones} st
              </span>
            </div>
          ))}
        </div>

        <Heading>Chord formulas</Heading>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {CHORDS.map((c) => (
            <div
              key={c.name}
              className="flex flex-col gap-0.5 rounded-lg border border-border bg-secondary/40 px-3 py-2"
            >
              <span className="text-sm font-medium text-foreground">
                {c.name}
              </span>
              <span className="text-xs text-muted-foreground">{c.formula}</span>
              <span className="text-xs text-primary">{c.intervals}</span>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
