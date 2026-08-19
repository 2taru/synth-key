import { Toggle } from './Toggle';
import { Panel } from './Panel';

interface Props {
  metronomeOn: boolean;
  onMetronome: (on: boolean) => void;
  timeSigNum: number;
  timeSigDen: number;
  onTimeSig: (num: number, den: number) => void;
  accentStrong: boolean;
  onAccentStrong: (on: boolean) => void;
  playWeak: boolean;
  onPlayWeak: (on: boolean) => void;
  /** Current beat within the bar (-1 when idle) for the visual indicator. */
  beat: number;
}

const PRESETS: [number, number][] = [
  [4, 4],
  [3, 4],
  [2, 4],
  [6, 8],
];
const DENOMINATORS = [1, 2, 4, 8, 16];

export function MetronomePanel({
  metronomeOn,
  onMetronome,
  timeSigNum,
  timeSigDen,
  onTimeSig,
  accentStrong,
  onAccentStrong,
  playWeak,
  onPlayWeak,
  beat,
}: Props) {
  const beats = Array.from({ length: Math.max(1, timeSigNum) }, (_, i) => i);

  return (
    <Panel
      id="metronome"
      title="Metronome"
      className="metronome"
      defaultCollapsed
      headerExtra={
        <Toggle checked={metronomeOn} onChange={onMetronome} label="On" />
      }
    >
      <div className="metro-settings">
        <div className="metro-row">
          <span className="control-label">Time signature</span>
          <div className="timesig">
            <input
              type="number"
              min={1}
              max={32}
              value={timeSigNum}
              onChange={(e) => onTimeSig(Number(e.target.value) || 1, timeSigDen)}
              aria-label="Beats per bar"
            />
            <span className="timesig-slash">/</span>
            <select
              value={timeSigDen}
              onChange={(e) => onTimeSig(timeSigNum, Number(e.target.value))}
              aria-label="Beat note value"
            >
              {DENOMINATORS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="timesig-presets">
            {PRESETS.map(([n, d]) => (
              <button
                key={`${n}/${d}`}
                type="button"
                className={`preset-btn ${n === timeSigNum && d === timeSigDen ? 'active' : ''}`}
                onClick={() => onTimeSig(n, d)}
              >
                {n}/{d}
              </button>
            ))}
          </div>
        </div>

        <div className="metro-row">
          <div className="beat-dots" aria-hidden>
            {beats.map((i) => (
              <span
                key={i}
                className={[
                  'beat-dot',
                  i === 0 && 'strong',
                  metronomeOn && i === beat && 'on',
                ]
                  .filter(Boolean)
                  .join(' ')}
              />
            ))}
          </div>
          <label className="metro-check">
            <input
              type="checkbox"
              checked={accentStrong}
              onChange={(e) => onAccentStrong(e.target.checked)}
            />
            Strong beat
          </label>
          <label className="metro-check">
            <input
              type="checkbox"
              checked={playWeak}
              onChange={(e) => onPlayWeak(e.target.checked)}
            />
            Weak beats
          </label>
        </div>
      </div>
    </Panel>
  );
}
