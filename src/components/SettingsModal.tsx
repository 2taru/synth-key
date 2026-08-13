import { useEffect } from 'react';
import type { Colors } from '../settings';

interface Props {
  open: boolean;
  onClose: () => void;
  colors: Colors;
  onColorChange: (key: keyof Colors, value: string) => void;
  onReset: () => void;
}

const ROWS: { key: keyof Colors; label: string; hint: string }[] = [
  { key: 'accent', label: 'Accent', hint: 'Buttons, toggles, sliders' },
  { key: 'played', label: 'Played keys', hint: 'Keys you press' },
  { key: 'target', label: 'To-play keys', hint: 'Song / practice targets' },
  { key: 'chord', label: 'Chord keys', hint: 'Chord lookup highlight' },
  { key: 'noteWhite', label: 'Notes (white keys)', hint: 'Waterfall / song roll' },
  { key: 'noteBlack', label: 'Notes (black keys)', hint: 'Waterfall / song roll' },
];

export function SettingsModal({ open, onClose, colors, onColorChange, onReset }: Props) {
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
          <div className="color-rows">
            {ROWS.map(({ key, label, hint }) => (
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

          <button type="button" className="t-btn ghost settings-reset" onClick={onReset}>
            Reset to defaults
          </button>

          <p className="settings-note">Settings are saved to this browser (localStorage).</p>
        </div>
      </div>
    </div>
  );
}
