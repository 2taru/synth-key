import { Panel } from './Panel';
import { midiToName } from '../audio/notes';

export type LayerMode = 'off' | 'layer' | 'split';

interface Props {
  mode: LayerMode;
  onMode: (m: LayerMode) => void;
  primaryName: string;
  secondary: string;
  onSecondary: (name: string) => void;
  /** Instrument names that are loaded and ready to be a second voice. */
  readyInstruments: string[];
  splitPoint: number;
  onSplitPoint: (midi: number) => void;
  low: number;
  high: number;
}

const MODES: { key: LayerMode; label: string }[] = [
  { key: 'off', label: 'Single' },
  { key: 'layer', label: 'Layer' },
  { key: 'split', label: 'Split' },
];

const pretty = (name: string) =>
  name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export function SplitPanel({
  mode,
  onMode,
  primaryName,
  secondary,
  onSecondary,
  readyInstruments,
  splitPoint,
  onSplitPoint,
  low,
  high,
}: Props) {
  const others = readyInstruments.filter((n) => n !== primaryName);

  return (
    <Panel id="split" title="Split / Layer" className="split" defaultCollapsed>
      <div className="split-modes">
        {MODES.map((m) => (
          <button
            key={m.key}
            type="button"
            className={`preset-btn ${mode === m.key ? 'active' : ''}`}
            onClick={() => onMode(m.key)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode !== 'off' && (
        <div className="split-body">
          <label className="split-field">
            <span className="control-label">Second sound</span>
            {others.length > 0 ? (
              <select
                value={secondary}
                onChange={(e) => onSecondary(e.target.value)}
                aria-label="Second instrument"
              >
                <option value="">— none —</option>
                {others.map((n) => (
                  <option key={n} value={n}>
                    {pretty(n)}
                  </option>
                ))}
              </select>
            ) : (
              <span className="split-hint">
                Load another sound from the library to use as the second voice.
              </span>
            )}
          </label>

          {mode === 'split' && (
            <label className="split-field">
              <span className="control-label">
                Split point
                <span className="pb-value">{midiToName(splitPoint)}</span>
              </span>
              <input
                type="range"
                className="mod-slider"
                min={low}
                max={high}
                step={1}
                value={splitPoint}
                onChange={(e) => onSplitPoint(Number(e.target.value))}
                aria-label="Split point"
              />
              <span className="split-hint">
                Below plays the second sound; at and above plays{' '}
                {pretty(primaryName)}.
              </span>
            </label>
          )}
        </div>
      )}
    </Panel>
  );
}
