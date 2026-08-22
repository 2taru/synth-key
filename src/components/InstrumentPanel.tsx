import { useState } from 'react';
import type { FormEvent } from 'react';
import { X } from 'lucide-react';
import { prettifyInstrument } from '../music/gmInstruments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type InstrumentStatus = 'loading' | 'ready' | 'error';

export interface InstrumentItem {
  name: string;
  status: InstrumentStatus;
}

interface Props {
  instruments: InstrumentItem[];
  active: string;
  defaultName: string;
  onSelect: (name: string) => void;
  onLoad: (name: string) => void;
  onDelete: (name: string) => void;
}

const STATUS_LABEL: Record<InstrumentStatus, string> = {
  loading: 'loading…',
  ready: '',
  error: 'failed',
};

function StatusDot({ status }: { status: InstrumentStatus }) {
  return (
    <span
      aria-hidden
      className={cn(
        'h-2 w-2 shrink-0 rounded-full',
        status === 'ready' && 'bg-success',
        status === 'loading' && 'animate-pulse bg-primary',
        status === 'error' && 'bg-destructive',
      )}
    />
  );
}

export function InstrumentPanel({
  instruments,
  active,
  defaultName,
  onSelect,
  onLoad,
  onDelete,
}: Props) {
  const [value, setValue] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const name = value.trim();
    if (!name) return;
    onLoad(name);
    setValue('');
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Instruments</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <form className="flex flex-col gap-2" onSubmit={submit}>
          <Input
            type="text"
            placeholder="e.g. electric_guitar_clean"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
          />
          <Button type="submit" variant="secondary" className="w-full">
            Load instrument
          </Button>
        </form>

        <ul className="flex flex-col gap-1">
          {instruments.map((inst) => {
            const isActive = inst.name === active;
            const isDefault = inst.name === defaultName;
            const selectable = inst.status === 'ready';
            return (
              <li
                key={inst.name}
                className={cn(
                  'flex items-center gap-1 rounded-lg border transition-colors',
                  isActive
                    ? 'border-primary/60 bg-primary/10'
                    : 'border-transparent hover:bg-accent/50',
                )}
              >
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2 text-left text-sm disabled:opacity-60"
                  disabled={!selectable}
                  onClick={() => onSelect(inst.name)}
                  title={selectable ? 'Set as active instrument' : undefined}
                >
                  <StatusDot status={inst.status} />
                  <span className="truncate">
                    {prettifyInstrument(inst.name)}
                  </span>
                  {STATUS_LABEL[inst.status] && (
                    <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                      {STATUS_LABEL[inst.status]}
                    </span>
                  )}
                </button>

                {!isDefault && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-muted-foreground"
                    onClick={() => onDelete(inst.name)}
                    aria-label={`Delete ${prettifyInstrument(inst.name)}`}
                    title="Delete instrument"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </li>
            );
          })}
        </ul>

        <p className="text-xs leading-relaxed text-muted-foreground">
          Names come from the General MIDI set (FluidR3_GM). Try{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-[0.7rem]">
            marimba
          </code>
          ,{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-[0.7rem]">
            synth_drum
          </code>
          .
        </p>
      </CardContent>
    </Card>
  );
}
