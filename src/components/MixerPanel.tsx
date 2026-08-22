import { Slider } from './Slider';
import { Panel } from './Panel';
import { Input } from '@/components/ui/input';

interface Props {
  master: number;
  onMaster: (v: number) => void;
  reverb: number;
  onReverb: (v: number) => void;
  bpm: number;
  onBpm: (v: number) => void;
}

export function MixerPanel({
  master,
  onMaster,
  reverb,
  onReverb,
  bpm,
  onBpm,
}: Props) {
  return (
    <Panel id="mixer" title="Mixer">
      <div className="flex flex-col gap-5">
        <Slider label="Master" value={master} onChange={onMaster} />
        <Slider label="Reverb" value={reverb} onChange={onReverb} />
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-foreground">Tempo</span>
          <div className="relative w-28">
            <Input
              type="number"
              min={20}
              max={300}
              value={bpm}
              onChange={(e) => onBpm(Number(e.target.value))}
              aria-label="Tempo in BPM"
              className="pr-12 text-right tabular-nums"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              BPM
            </span>
          </div>
        </div>
      </div>
    </Panel>
  );
}
