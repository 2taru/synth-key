export interface TabDef {
  key: string;
  label: string;
  /** How many features are currently active in this tab (shown as a badge). */
  badge?: number;
}

interface Props {
  tabs: TabDef[];
  active: string;
  onChange: (key: string) => void;
}

/** Segmented tab bar for the main workspace. */
export function Tabs({ tabs, active, onChange }: Props) {
  return (
    <div className="tabbar" role="tablist" aria-label="Workspace">
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          role="tab"
          aria-selected={active === t.key}
          className={`tab ${active === t.key ? 'active' : ''}`}
          onClick={() => onChange(t.key)}
        >
          {t.label}
          {t.badge ? <span className="tab-badge">{t.badge}</span> : null}
        </button>
      ))}
    </div>
  );
}
