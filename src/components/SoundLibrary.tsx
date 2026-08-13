import { useMemo, useState } from 'react';
import {
  GM_FAMILIES,
  prettifyInstrument,
  familyOf,
} from '../music/gmInstruments';

interface Props {
  /** Names currently loaded in the engine. */
  loaded: Set<string>;
  /** Names currently being fetched. */
  loading: Set<string>;
  /** The active instrument. */
  active: string;
  /** Load (if needed) and activate the picked instrument. */
  onPick: (name: string) => void;
}

export function SoundLibrary({ loaded, loading, active, onPick }: Props) {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set([familyOf(active) ?? GM_FAMILIES[0].name]),
  );

  const q = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!q) return GM_FAMILIES.map((f) => ({ family: f.name, items: f.instruments }));
    return GM_FAMILIES.map((f) => ({
      family: f.name,
      items: f.instruments.filter(
        (n) =>
          n.includes(q) || prettifyInstrument(n).toLowerCase().includes(q),
      ),
    })).filter((f) => f.items.length > 0);
  }, [q]);

  const toggle = (family: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(family)) next.delete(family);
      else next.add(family);
      return next;
    });

  const statusOf = (name: string): 'active' | 'loading' | 'loaded' | 'idle' => {
    if (name === active) return 'active';
    if (loading.has(name)) return 'loading';
    if (loaded.has(name)) return 'loaded';
    return 'idle';
  };

  return (
    <aside className="panel library">
      <h2>Sound Library</h2>

      <input
        type="text"
        className="library-search"
        placeholder="Search 128 sounds…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
      />

      <div className="library-scroll">
        {filtered.length === 0 && <p className="hint">No sounds match "{query}".</p>}

        {filtered.map(({ family, items }) => {
          const open = q ? true : expanded.has(family);
          return (
            <div className="library-group" key={family}>
              <button
                type="button"
                className="library-group-header"
                onClick={() => toggle(family)}
                aria-expanded={open}
              >
                <span className={`chevron ${open ? 'open' : ''}`} aria-hidden>
                  ▸
                </span>
                <span className="group-name">{family}</span>
                <span className="group-count">{items.length}</span>
              </button>

              {open && (
                <ul className="library-items">
                  {items.map((name) => {
                    const status = statusOf(name);
                    return (
                      <li key={name}>
                        <button
                          type="button"
                          className={`library-item ${status}`}
                          onClick={() => onPick(name)}
                        >
                          <span className="dot" aria-hidden />
                          <span className="label">{prettifyInstrument(name)}</span>
                          {status === 'loading' && (
                            <span className="tag">loading…</span>
                          )}
                          {status === 'loaded' && <span className="tag">✓</span>}
                          {status === 'active' && <span className="tag">active</span>}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
