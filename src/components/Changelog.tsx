import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { CHANGELOG_ENTRIES } from '../changelog';

interface Props {
  open: boolean;
  onClose: () => void;
}

/** Render inline `**bold**` and `` `code` `` from a changelog line. */
function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const token = m[0];
    if (token.startsWith('**')) {
      nodes.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    } else {
      nodes.push(<code key={key++}>{token.slice(1, -1)}</code>);
    }
    last = m.index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

/** Color-code the common Keep-a-Changelog section titles. */
function sectionClass(title: string): string {
  const key = title.toLowerCase();
  if (key.startsWith('add')) return 'added';
  if (key.startsWith('fix')) return 'fixed';
  if (key.startsWith('chang')) return 'changed';
  if (key.startsWith('remov') || key.startsWith('deprecat')) return 'removed';
  return '';
}

export function Changelog({ open, onClose }: Props) {
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
        className="modal changelog-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Changelog"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <h2>Changelog</h2>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close changelog"
          >
            ✕
          </button>
        </header>

        <div className="modal-body">
          {CHANGELOG_ENTRIES.map((entry) => (
            <article className="changelog-entry" key={entry.version}>
              <div className="changelog-version">
                <span className="version-tag">v{entry.version}</span>
                <span className="version-date">{entry.date}</span>
              </div>
              {entry.sections.map((section) => (
                <div className="changelog-section" key={section.title}>
                  <h3 className={`changelog-section-title ${sectionClass(section.title)}`}>
                    {section.title}
                  </h3>
                  <ul>
                    {section.items.map((item, i) => (
                      <li key={i}>{renderInline(item)}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
