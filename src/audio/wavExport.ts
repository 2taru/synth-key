import Soundfont from 'soundfont-player';
import { midiToName } from './notes';
import { sequenceDuration, type SeqNote } from './sequence';

const SOUNDFONT_BANK = 'FluidR3_GM';
const SAMPLE_RATE = 44100;

/**
 * Render a recorded note sequence to a WAV blob by replaying it through an
 * OfflineAudioContext. This is a dry bounce (no live reverb/effects) using the
 * given instrument, rendered faster than real time.
 */
export async function renderSequenceToWav(
  notes: SeqNote[],
  instrumentName: string,
  tailSeconds = 1.5,
): Promise<Blob> {
  if (notes.length === 0) throw new Error('Nothing to export');

  const duration = sequenceDuration(notes) + tailSeconds;
  const frames = Math.max(1, Math.ceil(duration * SAMPLE_RATE));
  const offline = new OfflineAudioContext(2, frames, SAMPLE_RATE);

  // soundfont-player accepts any BaseAudioContext; the typings only name AudioContext.
  const inst = (await Soundfont.instrument(
    offline as unknown as AudioContext,
    instrumentName as never,
    { soundfont: SOUNDFONT_BANK, destination: offline.destination },
  )) as {
    play: (
      note: string,
      when: number,
      options: { gain: number; duration: number },
    ) => void;
  };

  for (const n of notes) {
    inst.play(midiToName(n.midi), n.start, {
      gain: Math.max(0, Math.min(1, n.velocity / 127)),
      duration: n.duration,
    });
  }

  const rendered = await offline.startRendering();
  return encodeWav(rendered);
}

/** Encode an AudioBuffer as a 16-bit PCM WAV blob. */
function encodeWav(buffer: AudioBuffer): Blob {
  const numCh = buffer.numberOfChannels;
  const len = buffer.length;
  const bytesPerSample = 2;
  const blockAlign = numCh * bytesPerSample;
  const dataLen = len * blockAlign;
  const out = new ArrayBuffer(44 + dataLen);
  const view = new DataView(out);

  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataLen, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numCh, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 8 * bytesPerSample, true);
  writeStr(36, 'data');
  view.setUint32(40, dataLen, true);

  // Interleave channels and convert float [-1,1] to 16-bit PCM.
  const channels: Float32Array[] = [];
  for (let ch = 0; ch < numCh; ch++) channels.push(buffer.getChannelData(ch));

  let offset = 44;
  for (let i = 0; i < len; i++) {
    for (let ch = 0; ch < numCh; ch++) {
      const s = Math.max(-1, Math.min(1, channels[ch][i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([out], { type: 'audio/wav' });
}

/** Trigger a browser download for a rendered WAV blob. */
export function downloadWav(blob: Blob, name = 'synth-key-recording.wav'): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
