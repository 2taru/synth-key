import { Switch } from '@/components/ui/switch';

interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  hint?: string;
}

/** A labelled switch row — the whole row is tappable (comfortable on mobile). */
export function Toggle({ checked, onChange, label, hint }: Props) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-1 py-2 transition-colors hover:bg-accent/40">
      <span className="flex flex-col">
        <span className="text-sm font-medium leading-tight text-foreground">
          {label}
        </span>
        {hint && (
          <span className="text-xs leading-tight text-muted-foreground">
            {hint}
          </span>
        )}
      </span>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
    </label>
  );
}
