import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Props {
  /** Stable id used to remember the collapsed state across sessions. */
  id: string;
  title: string;
  /** Extra class(es) for the card. */
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
 * A card with a collapsible body. The header is a button that folds the panel
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
    <Card className={cn('overflow-hidden', className)}>
      <div className="flex items-center justify-between gap-2 pr-3">
        <button
          type="button"
          className="flex flex-1 items-center gap-2 p-4 text-left"
          onClick={toggle}
          aria-expanded={!collapsed}
        >
          <ChevronDown
            className={cn(
              'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
              collapsed && '-rotate-90',
            )}
            aria-hidden
          />
          <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        </button>
        {headerExtra && <div className="shrink-0">{headerExtra}</div>}
      </div>
      {!collapsed && <div className="border-t border-border p-4">{children}</div>}
    </Card>
  );
}
