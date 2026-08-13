import { Midi } from '@tonejs/midi';
import type { SeqNote } from '../audio/sequence';

/** Build a Standard MIDI File blob from a recorded sequence. */
export function notesToMidiBlob(notes: SeqNote[], bpm: number): Blob {
  const midi = new Midi();
  midi.header.setTempo(bpm);
  const track = midi.addTrack();
  for (const n of notes) {
    track.addNote({
      midi: n.midi,
      time: n.start,
      duration: n.duration,
      velocity: Math.max(0, Math.min(1, n.velocity / 127)),
    });
  }
  return new Blob([new Uint8Array(midi.toArray())], { type: 'audio/midi' });
}

/** Trigger a download of the sequence as a .mid file. */
export function downloadMidi(
  notes: SeqNote[],
  bpm: number,
  filename = 'synth-key-recording.mid',
): void {
  const url = URL.createObjectURL(notesToMidiBlob(notes, bpm));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export interface ParsedSong {
  notes: SeqNote[];
  name: string;
  bpm: number;
}

/** Parse a .mid file into a flat, time-sorted note sequence. */
export async function parseMidiFile(file: File): Promise<ParsedSong> {
  const buf = await file.arrayBuffer();
  const midi = new Midi(buf);
  const notes: SeqNote[] = [];
  for (const track of midi.tracks) {
    for (const n of track.notes) {
      notes.push({
        midi: n.midi,
        start: n.time,
        duration: n.duration,
        velocity: Math.round(n.velocity * 127),
      });
    }
  }
  notes.sort((a, b) => a.start - b.start);
  const bpm = midi.header.tempos[0]?.bpm ?? 120;
  return { notes, name: file.name, bpm: Math.round(bpm) };
}
