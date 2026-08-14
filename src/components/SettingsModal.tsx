import { useEffect } from 'react';
import type { Colors } from '../settings';

interface Props {
  open: boolean;
  onClose: () => void;
  colors: Colors;
  onColorChange: (key: keyof Colors, value: string) => void;
  onReset: () => void;
  keyHeight: number;
  onKeyHeight: (v: number) => void;
  noteSpeed: number;
  onNoteSpeed: (v: number) => void;
}

type ColorRow = { key: keyof Colors; label: string; hint: string };

const PALETTE_ROWS: ColorRow[] = [
  { key: 'accent', label: 'Accent', hint: 'Buttons, toggles, sliders' },
  { key: 'played', label: 'Played keys', hint: 'Keys you press' },
  { key: 'target', label: 'To-play keys', hint: 'Song / practice targets' },
  { key: 'chord', label: 'Chord keys', hint: 'Chord lookup highlight' },
  { key: 'noteWhite', label: 'Notes (white keys)', hint: 'Waterfall / song roll' },
  { key: 'noteBlack', label: 'Notes (black keys)', hint: 'Waterfall / song roll' },
];

const BACKGROUND_ROWS: ColorRow[] = [
  { key: 'bgBase', label: 'App background', hint: 'Page backdrop' },
  { key: 'bgPanel', label: 'Panel background', hint: 'Cards & panels' },
  { key: 'stageTop', label: 'Stage top', hint: 'Waterfall gradient (top)' },
  { key: 'stageBottom', label: 'Stage bottom', hint: 'Waterfall gradient (bottom)' },
];

function ColorRows({
  rows,
  colors,
  onColorChange,
}: {
  rows: ColorRow[];
  colors: Colors;
  onColorChange: (key: keyof Colors, value: string) => void;
}) {
  return (
    <div className="color-rows">
      {rows.map(({ key, label, hint }) => (
        <label className="color-row" key={key}>
          <input
            type="color"
            value={colors[key]}
            onChange={(e) => onColorChange(key, e.target.value)}
            aria-label={label}
          />
          <span className="color-text">
            <span className="color-label">{label}</span>
            <span className="color-hint">{hint}</span>
          </span>
          <span className="color-value">{colors[key]}</span>
        </label>
      ))}
    </div>
  );
}

export function SettingsModal({
  open,
  onClose,
  colors,
  onColorChange,
  onReset,
  keyHeight,
  onKeyHeight,
  noteSpeed,
  onNoteSpeed,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal settings-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <h2>Settings</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close settings">
            ✕
          </button>
        </header>

        <div className="modal-body">
          <h3 className="settings-section-title">Colors</h3>
          <ColorRows rows={PALETTE_ROWS} colors={colors} onColorChange={onColorChange} />

          <h3 className="settings-section-title">Background</h3>
          <ColorRows rows={BACKGROUND_ROWS} colors={colors} onColorChange={onColorChange} />

          <h3 className="settings-section-title">Keyboard &amp; motion</h3>
          <div className="range-rows">
            <label className="range-row">
              <span className="range-text">
                <span className="color-label">Key height</span>
                <span className="color-hint">On-screen key size (also drag the handle)</span>
              </span>
              <input
                type="range"
                min={90}
                max={420}
                step={2}
                value={keyHeight}
                onChange={(e) => onKeyHeight(Number(e.target.value))}
                aria-label="Key height"
              />
              <span className="color-value">{keyHeight}px</span>
            </label>
            <label className="range-row">
              <span className="range-text">
                <span className="color-label">Note speed</span>
                <span className="color-hint">Waterfall / song-roll scroll speed</span>
              </span>
              <input
                type="range"
                min={40}
                max={320}
                step={5}
                value={noteSpeed}
                onChange={(e) => onNoteSpeed(Number(e.target.value))}
                aria-label="Note speed"
              />
              <span className="color-value">{noteSpeed}px/s</span>
            </label>
          </div>

          <button type="button" className="t-btn ghost settings-reset" onClick={onReset}>
            Reset to defaults
          </button>

          <p className="settings-note">Settings are saved to this browser (localStorage).</p>
        </div>
      </div>
    </div>
  );
}
