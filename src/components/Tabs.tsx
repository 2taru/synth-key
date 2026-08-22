import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface TabDef {
  key: string;
  label: string;
  /** Optional leading icon. */
  icon?: ReactNode;
  /** How many features are currently active in this tab (shown as a badge). */
  badge?: number;
}

interface Props {
  tabs: TabDef[];
  active: string;
  onChange: (key: string) => void;
}

/** Full-width segmented tab bar for the main workspace (mobile-friendly). */
export function Tabs({ tabs, active, onChange }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Workspace"
      className="grid w-full auto-cols-fr grid-flow-col gap-1 rounded-xl border border-border bg-muted p-1"
    >
      {tabs.map((t) => {
        const selected = active === t.key;
        return (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(t.key)}
            className={cn(
              'relative flex h-11 items-center justify-center gap-2 rounded-lg px-2 text-sm font-medium transition-colors',
              selected
                ? 'bg-card text-foreground shadow'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t.icon}
            <span>{t.label}</span>
            {t.badge ? (
              <span
                className={cn(
                  'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold',
                  selected
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground',
                )}
              >
                {t.badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
