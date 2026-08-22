interface Props {
  /** Normalized bend, -1 (down) .. 0 (center) .. +1 (up). */
  value: number;
}

export function PitchBendMeter({ value }: Props) {
  const clamped = Math.max(-1, Math.min(1, value));
  const percent = 50 + clamped * 50;
  const semis = (clamped * 2).toFixed(1).replace(/\.0$/, '');

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">Pitch bend</span>
        {clamped !== 0 && (
          <span className="tabular-nums text-muted-foreground">
            {clamped > 0 ? '+' : ''}
            {semis}
          </span>
        )}
      </div>
      <div className="relative h-2 w-full rounded-full bg-secondary">
        <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-border" />
        <span
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-background transition-[left] duration-75"
          style={{ left: `${percent}%` }}
          aria-hidden
        />
      </div>
    </div>
  );
}
