interface Props {
  visualizer: boolean;
  onVisualizer: (v: boolean) => void;
  noteWaterfall: boolean;
  onNoteWaterfall: (v: boolean) => void;
  chordDetect: boolean;
  onChordDetect: (v: boolean) => void;
  intervalDetect: boolean;
  onIntervalDetect: (v: boolean) => void;
  chordLookup: boolean;
  onChordLookup: (v: boolean) => void;
  sustain: boolean;
  onSustain: (v: boolean) => void;
  metronomeOn: boolean;
  onMetronome: (v: boolean) => void;
  recording: boolean;
  recPlaying: boolean;
  onRecord: () => void;
  rangeLabel: string;
  onDown: () => void;
  onUp: () => void;
  canDown: boolean;
  canUp: boolean;
  minimized: boolean;
  onToggleMin: () => void;
  onExit: () => void;
}

function Pill({
  active,
  onClick,
  label,
  title,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  title?: string;
}) {
  return (
    <button
      type="button"
      className={`fs-pill ${active ? 'active' : ''}`}
      onClick={onClick}
      title={title ?? label}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

/**
 * The top toolbar shown while the stage is fullscreen. Because only the stage
 * element is fullscreen, every runtime control the player might want lives here.
 * Collapses to a slim handle so it stays out of the way.
 */
export function FullscreenToolbar({
  visualizer,
  onVisualizer,
  noteWaterfall,
  onNoteWaterfall,
  chordDetect,
  onChordDetect,
  intervalDetect,
  onIntervalDetect,
  chordLookup,
  onChordLookup,
  sustain,
  onSustain,
  metronomeOn,
  onMetronome,
  recording,
  recPlaying,
  onRecord,
  rangeLabel,
  onDown,
  onUp,
  canDown,
  canUp,
  minimized,
  onToggleMin,
  onExit,
}: Props) {
  if (minimized) {
    return (
      <div className="fs-toolbar minimized">
        {recording && <span className="fs-rec-badge" title="Recording" />}
        <button
          type="button"
          className="fs-icon"
          onClick={onToggleMin}
          aria-label="Show toolbar"
          title="Show toolbar"
        >
          ▾
        </button>
        <button
          type="button"
          className="fs-icon"
          onClick={onExit}
          aria-label="Exit fullscreen"
          title="Exit fullscreen"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className="fs-toolbar">
      <div className="fs-group">
        <Pill active={visualizer} onClick={() => onVisualizer(!visualizer)} label="Visualizer" />
        <Pill
          active={noteWaterfall}
          onClick={() => onNoteWaterfall(!noteWaterfall)}
          label="Waterfall"
        />
        <Pill
          active={chordDetect}
          onClick={() => onChordDetect(!chordDetect)}
          label="Chords"
          title="Chord detection"
        />
        <Pill
          active={intervalDetect}
          onClick={() => onIntervalDetect(!intervalDetect)}
          label="Intervals"
          title="Interval detection"
        />
        <Pill
          active={chordLookup}
          onClick={() => onChordLookup(!chordLookup)}
          label="Lookup"
          title="Chord lookup"
        />
        <Pill active={sustain} onClick={() => onSustain(!sustain)} label="Sustain" />
        <Pill active={metronomeOn} onClick={() => onMetronome(!metronomeOn)} label="Metronome" />
      </div>

      <button
        type="button"
        className={`fs-pill record ${recording ? 'armed' : ''}`}
        onClick={onRecord}
        disabled={recPlaying}
        title={recording ? 'Stop recording' : 'Record'}
      >
        <span className="rec-dot" aria-hidden />
        {recording ? 'Stop' : 'Rec'}
      </button>

      <div className="fs-group octave">
        <button type="button" className="fs-icon" onClick={onDown} disabled={!canDown} aria-label="Octave down">
          −
        </button>
        <span className="fs-range">{rangeLabel}</span>
        <button type="button" className="fs-icon" onClick={onUp} disabled={!canUp} aria-label="Octave up">
          +
        </button>
      </div>

      <div className="fs-spacer" />

      <button
        type="button"
        className="fs-icon"
        onClick={onToggleMin}
        aria-label="Minimize toolbar"
        title="Minimize toolbar"
      >
        ▴
      </button>
      <button
        type="button"
        className="fs-icon"
        onClick={onExit}
        aria-label="Exit fullscreen"
        title="Exit fullscreen"
      >
        ✕
      </button>
    </div>
  );
}
