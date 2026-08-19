import { Note } from 'tonal';
import { Panel } from './Panel';
import { TONICS, SCALE_TYPES, type ScaleInfo } from '../music/scales';

interface Props {
  tonic: string;
  scaleType: string;
  onTonic: (t: string) => void;
  onScaleType: (s: string) => void;
  info: ScaleInfo;
  /** Play a set of concrete MIDI notes (chord: together; scale: arpeggiated). */
  onPlayNotes: (midis: number[], arpeggio?: boolean) => void;
}

/** Voice pitch classes into ascending MIDI numbers from a base octave. */
function voice(pcs: string[], baseOctave = 4): number[] {
  const midis: number[] = [];
  let octave = baseOctave;
  let prev = -1;
  for (const pc of pcs) {
    const chroma = Note.chroma(pc);
    if (chroma == null) continue;
    if (chroma <= prev) octave += 1;
    prev = chroma;
    const m = Note.midi(`${pc}${octave}`);
    if (m != null) midis.push(m);
  }
  return midis;
}

export function TheoryPanel({
  tonic,
  scaleType,
  onTonic,
  onScaleType,
  info,
  onPlayNotes,
}: Props) {
  const playScale = () => {
    const asc = voice(info.notes);
    // add the octave tonic on top for a complete run
    const top = asc.length ? asc[0] + 12 : null;
    onPlayNotes(top != null ? [...asc, top] : asc, true);
  };

  return (
    <Panel id="theory" title="Scales & keys" className="theory">
      <div className="theory-selectors">
        <label className="theory-field">
          <span className="control-label">Key</span>
          <select value={tonic} onChange={(e) => onTonic(e.target.value)} aria-label="Key / tonic">
            {TONICS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="theory-field">
          <span className="control-label">Scale</span>
          <select
            value={scaleType}
            onChange={(e) => onScaleType(e.target.value)}
            aria-label="Scale / mode"
          >
            {SCALE_TYPES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="ghost theory-play"
          onClick={playScale}
          disabled={!info.ok}
          title="Play the scale ascending"
        >
          ▶ Scale
        </button>
      </div>

      {info.ok && (
        <>
          <div className="theory-notes">
            {info.notes.map((n) => (
              <span
                key={n}
                className={`theory-note ${Note.chroma(n) === info.tonicChroma ? 'root' : ''}`}
              >
                {n}
              </span>
            ))}
          </div>

          {info.chords.length > 0 && (
            <div className="theory-chords">
              {info.chords.map((c) => (
                <button
                  key={c.roman}
                  type="button"
                  className="theory-chord"
                  onClick={() => onPlayNotes(voice(c.notes))}
                  title={`${c.symbol} — click to hear`}
                >
                  <span className="theory-roman">{c.roman}</span>
                  <span className="theory-sym">{c.symbol}</span>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </Panel>
  );
}
