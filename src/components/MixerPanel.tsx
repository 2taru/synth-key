import { Slider } from './Slider';
import { Panel } from './Panel';

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
    <Panel id="mixer" title="Mixer" className="mixer">
      <div className="mixer-grid">
        <Slider label="Master" value={master} onChange={onMaster} />
        <Slider label="Reverb" value={reverb} onChange={onReverb} />
        <div className="control tempo-control">
          <span className="control-label">Tempo</span>
          <div className="tempo-input">
            <input
              type="number"
              min={20}
              max={300}
              value={bpm}
              onChange={(e) => onBpm(Number(e.target.value))}
              aria-label="Tempo in BPM"
            />
            <span className="bpm-unit">BPM</span>
          </div>
        </div>
      </div>
    </Panel>
  );
}
