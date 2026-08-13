import { useState } from 'react';
import type { FormEvent } from 'react';
import type { ChordResult } from '../music/chords';

interface Props {
  result: ChordResult | null;
  error: string | null;
  onShow: (symbol: string) => void;
  onClear: () => void;
}

export function ChordPanel({ result, error, onShow, onClear }: Props) {
  const [value, setValue] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    onShow(value);
  };

  const clear = () => {
    setValue('');
    onClear();
  };

  return (
    <section className="panel chord">
      <h2>Chord visualizer</h2>

      <form className="chord-form" onSubmit={submit}>
        <input
          type="text"
          placeholder="Enter chord: Cmaj7"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
        />
        <button type="submit">Show Chord</button>
        <button type="button" className="ghost" onClick={clear}>
          Clear Chord
        </button>
      </form>

      {error && <p className="chord-error">{error}</p>}

      {result && result.ok && (
        <p className="chord-result">
          <strong>{result.name}</strong>
          <span className="chord-notes">{result.notes.join(' · ')}</span>
        </p>
      )}
    </section>
  );
}
