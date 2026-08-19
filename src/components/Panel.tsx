import { useCallback, useEffect, useState, type ReactNode } from 'react';

interface Props {
  /** Stable id used to remember the collapsed state across sessions. */
  id: string;
  title: string;
  /** Extra class(es) for the <section> (e.g. layout modifiers). */
  className?: string;
  /** Collapsed state used the first time this panel is ever seen. */
  defaultCollapsed?: boolean;
  /** Optional node rendered on the right of the header (e.g. a live badge). */
  headerExtra?: ReactNode;
  children: ReactNode;
}

const STORAGE_PREFIX = 'synthkey:panel:';

function readCollapsed(id: string, fallback: boolean): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + id);
    return raw == null ? fallback : raw === '1';
  } catch {
    return fallback;
  }
}

/**
 * A panel with a collapsible body. The header is a button that folds the panel
 * to just its title — handy on narrow screens where every panel competes for
 * vertical space. The collapsed state is remembered per `id` in localStorage.
 */
export function Panel({
  id,
  title,
  className = '',
  defaultCollapsed = false,
  headerExtra,
  children,
}: Props) {
  const [collapsed, setCollapsed] = useState(() =>
    readCollapsed(id, defaultCollapsed),
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PREFIX + id, collapsed ? '1' : '0');
    } catch {
      /* ignore storage errors (private mode, quota) */
    }
  }, [id, collapsed]);

  const toggle = useCallback(() => setCollapsed((c) => !c), []);

  return (
    <section className={`panel collapsible ${collapsed ? 'is-collapsed' : ''} ${className}`}>
      <div className="panel-head">
        <button
          type="button"
          className="panel-head-btn"
          onClick={toggle}
          aria-expanded={!collapsed}
        >
          <span className="panel-chevron" aria-hidden>
            ▾
          </span>
          <h2>{title}</h2>
        </button>
        {headerExtra && <div className="panel-head-extra">{headerExtra}</div>}
      </div>
      {!collapsed && <div className="panel-body">{children}</div>}
    </section>
  );
}
