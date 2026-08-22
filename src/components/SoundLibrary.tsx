import { useMemo, useState } from 'react';
import { ChevronRight, Check } from 'lucide-react';
import {
  GM_FAMILIES,
  prettifyInstrument,
  familyOf,
} from '../music/gmInstruments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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
    if (!q)
      return GM_FAMILIES.map((f) => ({ family: f.name, items: f.instruments }));
    return GM_FAMILIES.map((f) => ({
      family: f.name,
      items: f.instruments.filter(
        (n) => n.includes(q) || prettifyInstrument(n).toLowerCase().includes(q),
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
    <Card className="flex min-h-0 flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Sound Library</CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-3">
        <Input
          type="text"
          placeholder="Search 128 sounds…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
        />

        <div className="-mr-1 flex max-h-[min(50vh,420px)] flex-col gap-1 overflow-y-auto pr-1">
          {filtered.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No sounds match "{query}".
            </p>
          )}

          {filtered.map(({ family, items }) => {
            const open = q ? true : expanded.has(family);
            return (
              <div key={family}>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm font-medium hover:bg-accent/50"
                  onClick={() => toggle(family)}
                  aria-expanded={open}
                >
                  <ChevronRight
                    className={cn(
                      'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
                      open && 'rotate-90',
                    )}
                    aria-hidden
                  />
                  <span className="flex-1">{family}</span>
                  <span className="text-xs text-muted-foreground">
                    {items.length}
                  </span>
                </button>

                {open && (
                  <ul className="mb-1 ml-3 flex flex-col gap-0.5 border-l border-border pl-2">
                    {items.map((name) => {
                      const status = statusOf(name);
                      return (
                        <li key={name}>
                          <button
                            type="button"
                            className={cn(
                              'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors',
                              status === 'active'
                                ? 'bg-primary/15 text-foreground'
                                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                            )}
                            onClick={() => onPick(name)}
                          >
                            <span className="truncate">
                              {prettifyInstrument(name)}
                            </span>
                            {status === 'loading' && (
                              <Badge
                                variant="secondary"
                                className="ml-auto animate-pulse"
                              >
                                loading…
                              </Badge>
                            )}
                            {status === 'loaded' && (
                              <Check className="ml-auto h-3.5 w-3.5 text-success" />
                            )}
                            {status === 'active' && (
                              <Badge className="ml-auto">active</Badge>
                            )}
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
      </CardContent>
    </Card>
  );
}
