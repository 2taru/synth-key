import type { ReactNode } from 'react';
import { CHANGELOG_ENTRIES } from '../changelog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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
      nodes.push(
        <code
          key={key++}
          className="rounded bg-muted px-1 py-0.5 text-[0.8em]"
        >
          {token.slice(1, -1)}
        </code>,
      );
    }
    last = m.index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

/** Color-code the common Keep-a-Changelog section titles. */
function sectionColor(title: string): string {
  const key = title.toLowerCase();
  if (key.startsWith('add')) return 'text-success';
  if (key.startsWith('fix')) return 'text-primary';
  if (key.startsWith('chang')) return 'text-[color:hsl(38_92%_60%)]';
  if (key.startsWith('remov') || key.startsWith('deprecat'))
    return 'text-destructive';
  return 'text-muted-foreground';
}

export function Changelog({ open, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent aria-label="Changelog">
        <DialogHeader>
          <DialogTitle>Changelog</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          {CHANGELOG_ENTRIES.map((entry) => (
            <article key={entry.version} className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Badge>v{entry.version}</Badge>
                <span className="text-xs text-muted-foreground">
                  {entry.date}
                </span>
              </div>
              {entry.sections.map((section) => (
                <div key={section.title} className="flex flex-col gap-1.5">
                  <h3
                    className={cn(
                      'text-xs font-semibold uppercase tracking-wide',
                      sectionColor(section.title),
                    )}
                  >
                    {section.title}
                  </h3>
                  <ul className="ml-4 list-disc space-y-1 text-sm text-foreground/90 marker:text-muted-foreground">
                    {section.items.map((item, i) => (
                      <li key={i}>{renderInline(item)}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </article>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
