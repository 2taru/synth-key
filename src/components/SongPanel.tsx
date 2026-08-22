import type { ChangeEvent } from 'react';
import { Upload, Play, Square, GraduationCap, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Song mode</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="secondary" className="cursor-pointer">
            <label>
              <Upload /> Load .mid
              <input
                type="file"
                accept=".mid,.midi,audio/midi"
                onChange={pickFile}
                hidden
              />
            </label>
          </Button>

          {song && (
            <>
              <Button
                type="button"
                onClick={onPlaySong}
                disabled={songPlaying}
              >
                {practice ? <GraduationCap /> : <Play />}
                {practice ? 'Practice' : 'Play'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={onStopSong}
                disabled={!songPlaying}
              >
                <Square /> Stop
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onClearSong}
                aria-label="Remove song"
              >
                <X />
              </Button>
            </>
          )}
        </div>

        {song ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label
              className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground"
              title="Wait for you to play each note"
            >
              <Switch
                checked={practice}
                onCheckedChange={onPracticeChange}
                disabled={songPlaying}
                aria-label="Practice mode"
              />
              Practice (wait for me)
            </label>
            <span
              className="truncate text-xs text-muted-foreground"
              title={song.name}
            >
              {song.name} · {song.noteCount} notes
            </span>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Load a MIDI file to see it fall (Synthesia style).
          </p>
        )}
      </CardContent>
    </Card>
  );
}
