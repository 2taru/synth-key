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

export function ReferencePanel() {
  return (
    <Panel id="reference" title="Reference" className="reference" defaultCollapsed>
      <h3 className="ref-heading">Intervals</h3>
      <div className="ref-intervals">
        {INTERVALS.map((iv) => (
          <div key={iv.semitones} className="ref-iv">
            <span className="ref-iv-short">{iv.short}</span>
            <span className="ref-iv-name">{iv.name}</span>
            <span className="ref-iv-semi">{iv.semitones} st</span>
          </div>
        ))}
      </div>

      <h3 className="ref-heading">Chord formulas</h3>
      <div className="ref-chords">
        {CHORDS.map((c) => (
          <div key={c.name} className="ref-chord">
            <span className="ref-chord-name">{c.name}</span>
            <span className="ref-chord-formula">{c.formula}</span>
            <span className="ref-chord-iv">{c.intervals}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}
