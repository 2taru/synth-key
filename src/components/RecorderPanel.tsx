interface Props {
  recording: boolean;
  recPlaying: boolean;
  recNoteCount: number;
  onRecord: () => void;
  onPlayRec: () => void;
  onStop: () => void;
  onExport: () => void;
}

export function RecorderPanel({
  recording,
  recPlaying,
  recNoteCount,
  onRecord,
  onPlayRec,
  onStop,
  onExport,
}: Props) {
  const hasRec = recNoteCount > 0;
  return (
    <section className="panel transport">
      <h2>Recorder</h2>
      <div className="transport-row">
        <button
          type="button"
          className={`t-btn record ${recording ? 'armed' : ''}`}
          onClick={onRecord}
          disabled={recPlaying}
        >
          <span className="rec-dot" aria-hidden />
          {recording ? 'Stop rec' : 'Record'}
        </button>
        <button
          type="button"
          className="t-btn"
          onClick={onPlayRec}
          disabled={!hasRec || recording || recPlaying}
        >
          ▶ Play
        </button>
        <button type="button" className="t-btn" onClick={onStop} disabled={!recPlaying}>
          ■ Stop
        </button>
        <button
          type="button"
          className="t-btn"
          onClick={onExport}
          disabled={!hasRec || recording}
          title="Export recording as a .mid file"
        >
          ⭳ .mid
        </button>
        <span className="transport-info">
          {recording ? 'recording…' : hasRec ? `${recNoteCount} notes` : 'no recording'}
        </span>
      </div>
    </section>
  );
}
