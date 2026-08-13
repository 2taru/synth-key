import type { ChangeEvent } from 'react';

interface SongInfo {
  name: string;
  noteCount: number;
}

interface Props {
  song: SongInfo | null;
  songPlaying: boolean;
  practice: boolean;
  onLoadSong: (file: File) => void;
  onPlaySong: () => void;
  onStopSong: () => void;
  onClearSong: () => void;
  onPracticeChange: (practice: boolean) => void;
}

export function SongPanel({
  song,
  songPlaying,
  practice,
  onLoadSong,
  onPlaySong,
  onStopSong,
  onClearSong,
  onPracticeChange,
}: Props) {
  const pickFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onLoadSong(file);
    e.target.value = '';
  };

  return (
    <section className="panel transport song-panel">
      <h2>Song mode</h2>
      <div className="transport-row">
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
              disabled={songPlaying}
            >
              {practice ? '🎓 Practice' : '▶ Play'}
            </button>
            <button type="button" className="t-btn" onClick={onStopSong} disabled={!songPlaying}>
              ■ Stop
            </button>
            <label className="practice-check" title="Wait for you to play each note">
              <input
                type="checkbox"
                checked={practice}
                onChange={(e) => onPracticeChange(e.target.checked)}
                disabled={songPlaying}
              />
              Practice (wait for me)
            </label>
            <button type="button" className="t-btn ghost" onClick={onClearSong} aria-label="Remove song">
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
