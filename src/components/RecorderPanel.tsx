import { Circle, Play, Square, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
  recording: boolean;
  recPlaying: boolean;
  recNoteCount: number;
  onRecord: () => void;
  onPlayRec: () => void;
  onStop: () => void;
  onExport: () => void;
  onExportWav: () => void;
  /** True while a WAV bounce is rendering. */
  exportingWav?: boolean;
}

export function RecorderPanel({
  recording,
  recPlaying,
  recNoteCount,
  onRecord,
  onPlayRec,
  onStop,
  onExport,
  onExportWav,
  exportingWav = false,
}: Props) {
  const hasRec = recNoteCount > 0;
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          Recorder
          <span className="text-xs font-normal text-muted-foreground">
            {recording
              ? 'recording…'
              : hasRec
                ? `${recNoteCount} notes`
                : 'no recording'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={recording ? 'destructive' : 'secondary'}
            onClick={onRecord}
            disabled={recPlaying}
          >
            <Circle
              className={cn('fill-current', recording && 'animate-pulse')}
            />
            {recording ? 'Stop' : 'Record'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onPlayRec}
            disabled={!hasRec || recording || recPlaying}
          >
            <Play /> Play
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onStop}
            disabled={!recPlaying}
          >
            <Square /> Stop
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onExport}
            disabled={!hasRec || recording}
            title="Export recording as a .mid file"
          >
            <Download /> .mid
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onExportWav}
            disabled={!hasRec || recording || exportingWav}
            title="Bounce recording to a .wav audio file"
          >
            <Download /> {exportingWav ? '…' : '.wav'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
