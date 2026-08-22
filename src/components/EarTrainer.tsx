import { useCallback, useEffect, useState } from 'react';
import { Play, Music2, ChevronRight } from 'lucide-react';
import { Panel } from './Panel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Props {
  /** Play MIDI notes; `arpeggio` staggers them melodically. */
  onPlayNotes: (midis: number[], arpeggio?: boolean) => void;
}

interface Choice {
  key: string;
  label: string;
  /** Semitone offsets from the root that make up the sound. */
  semis: number[];
}

const INTERVAL_CHOICES: Choice[] = [
  { key: 'm2', label: 'Minor 2nd', semis: [0, 1] },
  { key: 'M2', label: 'Major 2nd', semis: [0, 2] },
  { key: 'm3', label: 'Minor 3rd', semis: [0, 3] },
  { key: 'M3', label: 'Major 3rd', semis: [0, 4] },
  { key: 'P4', label: 'Perfect 4th', semis: [0, 5] },
  { key: 'TT', label: 'Tritone', semis: [0, 6] },
  { key: 'P5', label: 'Perfect 5th', semis: [0, 7] },
  { key: 'm6', label: 'Minor 6th', semis: [0, 8] },
  { key: 'M6', label: 'Major 6th', semis: [0, 9] },
  { key: 'm7', label: 'Minor 7th', semis: [0, 10] },
  { key: 'M7', label: 'Major 7th', semis: [0, 11] },
  { key: 'P8', label: 'Octave', semis: [0, 12] },
];

const CHORD_CHOICES: Choice[] = [
  { key: 'maj', label: 'Major', semis: [0, 4, 7] },
  { key: 'min', label: 'Minor', semis: [0, 3, 7] },
  { key: 'dim', label: 'Diminished', semis: [0, 3, 6] },
  { key: 'aug', label: 'Augmented', semis: [0, 4, 8] },
  { key: 'maj7', label: 'Major 7th', semis: [0, 4, 7, 11] },
  { key: 'dom7', label: 'Dominant 7th', semis: [0, 4, 7, 10] },
  { key: 'min7', label: 'Minor 7th', semis: [0, 3, 7, 10] },
  { key: 'sus4', label: 'Sus4', semis: [0, 5, 7] },
];

type Mode = 'interval' | 'chord';

interface Question {
  root: number;
  answer: string;
  midis: number[];
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function EarTrainer({ onPlayNotes }: Props) {
  const [mode, setMode] = useState<Mode>('interval');
  const [question, setQuestion] = useState<Question | null>(null);
  const [guess, setGuess] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const choices = mode === 'interval' ? INTERVAL_CHOICES : CHORD_CHOICES;
  const arpeggio = mode === 'interval';

  const next = useCallback(() => {
    const choice = pick(mode === 'interval' ? INTERVAL_CHOICES : CHORD_CHOICES);
    const root = 55 + Math.floor(Math.random() * 13); // G3..G4
    const midis = choice.semis.map((s) => root + s);
    setQuestion({ root, answer: choice.key, midis });
    setGuess(null);
    onPlayNotes(midis, mode === 'interval');
  }, [mode, onPlayNotes]);

  useEffect(() => {
    setQuestion(null);
    setGuess(null);
  }, [mode]);

  const replay = () => {
    if (question) onPlayNotes(question.midis, arpeggio);
  };

  const answer = (key: string) => {
    if (!question || guess) return; // already answered
    setGuess(key);
    setScore((s) => ({
      correct: s.correct + (key === question.answer ? 1 : 0),
      total: s.total + 1,
    }));
  };

  const pct = score.total ? Math.round((score.correct / score.total) * 100) : 0;

  return (
    <Panel
      id="ear-trainer"
      title="Ear training"
      defaultCollapsed
      headerExtra={
        score.total > 0 ? (
          <Badge variant="secondary">
            {score.correct}/{score.total} · {pct}%
          </Badge>
        ) : null
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            size="sm"
            variant={mode === 'interval' ? 'default' : 'outline'}
            onClick={() => setMode('interval')}
          >
            Intervals
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === 'chord' ? 'default' : 'outline'}
            onClick={() => setMode('chord')}
          >
            Chords
          </Button>
        </div>

        {!question ? (
          <Button type="button" className="w-full" onClick={next}>
            <Play /> Start — play &amp; guess
          </Button>
        ) : (
          <>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={replay}
              >
                <Music2 /> Replay
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={next}
              >
                Next <ChevronRight />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {choices.map((c) => {
                const state =
                  guess == null
                    ? 'idle'
                    : c.key === question.answer
                      ? 'correct'
                      : c.key === guess
                        ? 'wrong'
                        : 'idle';
                return (
                  <button
                    key={c.key}
                    type="button"
                    className={cn(
                      'rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors disabled:cursor-default',
                      state === 'idle' &&
                        'border-border bg-card hover:border-primary/60 hover:bg-accent/50 disabled:opacity-60',
                      state === 'correct' &&
                        'border-success bg-success/20 text-foreground',
                      state === 'wrong' &&
                        'border-destructive bg-destructive/20 text-foreground',
                    )}
                    onClick={() => answer(c.key)}
                    disabled={guess != null}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </Panel>
  );
}
