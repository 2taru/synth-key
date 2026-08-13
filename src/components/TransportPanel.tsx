import type { ChangeEvent } from 'react';

interface SongInfo {
  name: string;
  noteCount: number;
}

interface Props {
  recording: boolean;
  recPlaying: boolean;
  recNoteCount: number;
  onRecord: () => void;
  onPlayRec: () => void;
  onStop: () => void;
  onExport: () => void;

  song: SongInfo | null;
  songPlaying: boolean;
  onLoadSong: (file: File) => void;
  onPlaySong: () => void;
  onStopSong: () => void;
  onClearSong: () => void;
}

export function TransportPanel({
  recording,
  recPlaying,
  recNoteCount,
  onRecord,
  onPlayRec,
  onStop,
  onExport,
  song,
  songPlaying,
  onLoadSong,
  onPlaySong,
  onStopSong,
  onClearSong,
}: Props) {
  const pickFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onLoadSong(file);
    e.target.value = ''; // allow re-picking the same file
  };

  const hasRec = recNoteCount > 0;

  return (
    <section className="panel transport">
      <h2>Record &amp; Play</h2>

      <div className="transport-row">
        <button
          type="button"
          className={`t-btn record ${recording ? 'armed' : ''}`}
          onClick={onRecord}
          disabled={recPlaying || songPlaying}
        >
          <span className="rec-dot" aria-hidden />
          {recording ? 'Stop rec' : 'Record'}
        </button>
        <button
          type="button"
          className="t-btn"
          onClick={onPlayRec}
          disabled={!hasRec || recording || recPlaying || songPlaying}
        >
          ▶ Play
        </button>
        <button
          type="button"
          className="t-btn"
          onClick={onStop}
          disabled={!recPlaying}
        >
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
          {recording
            ? 'recording…'
            : hasRec
              ? `${recNoteCount} notes`
              : 'no recording'}
        </span>
      </div>

      <div className="transport-row song-row">
        <label className="t-btn file-btn">
          Load .mid
          <input type="file" accept=".mid,.midi,audio/midi" onChange={pickFile} hidden />
        </label>
        {song ? (
          <>
            <button
              type="button"
              className="t-btn"
              onClick={onPlaySong}
              disabled={songPlaying || recording || recPlaying}
            >
              ▶ Play song
            </button>
            <button
              type="button"
              className="t-btn"
              onClick={onStopSong}
              disabled={!songPlaying}
            >
              ■ Stop
            </button>
            <button type="button" className="t-btn ghost" onClick={onClearSong}>
              ✕
            </button>
            <span className="transport-info song-name" title={song.name}>
              {song.name} · {song.noteCount} notes
            </span>
          </>
        ) : (
          <span className="transport-info">
            Load a MIDI file to see it fall (Synthesia style)
          </span>
        )}
      </div>
    </section>
  );
}
