import { useCallback, useEffect, useState } from 'react';
import { Panel } from './Panel';

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

  // Start a fresh question whenever the mode changes.
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
      className="ear"
      defaultCollapsed
      headerExtra={
        score.total > 0 ? (
          <span className="ear-score">
            {score.correct}/{score.total} · {pct}%
          </span>
        ) : null
      }
    >
      <div className="ear-modes">
        <button
          type="button"
          className={`preset-btn ${mode === 'interval' ? 'active' : ''}`}
          onClick={() => setMode('interval')}
        >
          Intervals
        </button>
        <button
          type="button"
          className={`preset-btn ${mode === 'chord' ? 'active' : ''}`}
          onClick={() => setMode('chord')}
        >
          Chords
        </button>
      </div>

      {!question ? (
        <button type="button" className="ear-start" onClick={next}>
          ▶ Start — play &amp; guess
        </button>
      ) : (
        <>
          <div className="ear-transport">
            <button type="button" className="ghost" onClick={replay}>
              ♪ Replay
            </button>
            <button type="button" className="ghost" onClick={next}>
              Next ▶
            </button>
          </div>

          <div className="ear-choices">
            {choices.map((c) => {
              const state =
                guess == null
                  ? ''
                  : c.key === question.answer
                    ? 'correct'
                    : c.key === guess
                      ? 'wrong'
                      : '';
              return (
                <button
                  key={c.key}
                  type="button"
                  className={`ear-choice ${state}`}
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
    </Panel>
  );
}
