import { useState } from 'react';
import type { FormEvent } from 'react';
import { prettifyInstrument } from '../music/gmInstruments';

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
    <aside className="panel instruments">
      <h2>Instruments</h2>

      <form className="load-form" onSubmit={submit}>
        <input
          type="text"
          placeholder="e.g. electric_guitar_clean"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
        />
        <button type="submit">Load Instrument</button>
      </form>

      <ul className="instrument-list">
        {instruments.map((inst) => {
          const isActive = inst.name === active;
          const isDefault = inst.name === defaultName;
          const selectable = inst.status === 'ready';
          return (
            <li
              key={inst.name}
              className={[
                'instrument-item',
                isActive && 'selected',
                inst.status === 'error' && 'errored',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <button
                type="button"
                className="instrument-name"
                disabled={!selectable}
                onClick={() => onSelect(inst.name)}
                title={selectable ? 'Set as active instrument' : undefined}
              >
                <span className="dot" aria-hidden />
                <span className="label">{prettifyInstrument(inst.name)}</span>
                {STATUS_LABEL[inst.status] && (
                  <span className="status">{STATUS_LABEL[inst.status]}</span>
                )}
              </button>

              {!isDefault && (
                <button
                  type="button"
                  className="delete"
                  onClick={() => onDelete(inst.name)}
                  aria-label={`Delete ${prettifyInstrument(inst.name)}`}
                  title="Delete instrument"
                >
                  ✕
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <p className="hint">
        Names come from the General MIDI set (FluidR3_GM). Try{' '}
        <code>marimba</code>, <code>synth_drum</code>, <code>vibraphone</code>.
      </p>
    </aside>
  );
}
