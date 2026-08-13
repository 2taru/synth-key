import type { DetectedChord as Detected } from '../music/chords';

interface Props {
  detected: Detected | null;
  /** How many notes are currently held (drives the empty/interval states). */
  heldCount: number;
}

export function DetectedChord({ detected, heldCount }: Props) {
  return (
    <section className="panel detected">
      <h2>Now Playing</h2>

      {/* Fixed-height container so the keyboard below never jumps as the content
          changes between the empty state and detected chords. */}
      <div className="detected-content">
        {detected ? (
          <div className="detected-body">
            <span className="detected-symbol">{detected.symbol}</span>
            <span className="detected-name">{detected.name}</span>
            <span className="detected-notes">
              {detected.playedNotes.join(' · ')}
            </span>
            <span className="detected-alts">
              {detected.alternatives.length > 0
                ? `also: ${detected.alternatives.slice(0, 3).join(', ')}`
                : ' '}
            </span>
          </div>
        ) : (
          <p className="detected-empty">
            {heldCount === 0
              ? 'Play a chord to identify it…'
              : `Holding ${heldCount} note${heldCount > 1 ? 's' : ''} — add more for a chord`}
          </p>
        )}
      </div>
    </section>
  );
}
