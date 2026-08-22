import { useState } from 'react';
import type { FormEvent } from 'react';
import type { ChordResult } from '../music/chords';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Chord visualizer</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <form className="flex flex-col gap-2 sm:flex-row" onSubmit={submit}>
          <Input
            type="text"
            placeholder="Enter chord: Cmaj7"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            className="sm:flex-1"
          />
          <div className="flex gap-2">
            <Button type="submit" className="flex-1 sm:flex-none">
              Show
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 sm:flex-none"
              onClick={clear}
            >
              Clear
            </Button>
          </div>
        </form>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {result && result.ok && (
          <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <strong className="text-lg text-primary">{result.name}</strong>
            <span className="text-sm text-muted-foreground">
              {result.notes.join(' · ')}
            </span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
