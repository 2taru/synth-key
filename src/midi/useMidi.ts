import { useEffect } from 'react';
import type { AudioEngine } from '../audio/audioEngine';

export type MidiStatus = 'idle' | 'unsupported' | 'requesting' | 'ready' | 'denied';

// Web MIDI is not part of the standard TS DOM lib, so we describe the tiny slice
// we touch with local, collision-free types instead of a global augmentation.
interface MidiMessageEvt {
  data: Uint8Array | null;
}
interface MidiInputLike {
  name?: string | null;
  onmidimessage: ((e: MidiMessageEvt) => void) | null;
}
interface MidiAccessLike {
  inputs: { forEach: (cb: (input: MidiInputLike) => void) => void };
  onstatechange: ((e: unknown) => void) | null;
}
type RequestMIDIAccess = (opts?: { sysex?: boolean }) => Promise<MidiAccessLike>;

const NOTE_ON = 0x90;
const NOTE_OFF = 0x80;
const PITCH_BEND = 0xe0;
const CONTROL_CHANGE = 0xb0;
const CC_MODULATION = 1; // mod wheel
const CC_SUSTAIN = 64; // sustain pedal

/**
 * Subscribes to every connected MIDI input and drives the audio engine directly
 * from the message callback. No React state is touched here — the callback path
 * from key press to sound stays synchronous and re-render free.
 */
export function useMidi(
  engine: AudioEngine,
  onStatus: (s: MidiStatus) => void,
  onDevices: (names: string[]) => void,
): void {
  useEffect(() => {
    const requestMIDIAccess = (
      navigator as Navigator & { requestMIDIAccess?: RequestMIDIAccess }
    ).requestMIDIAccess;

    if (typeof requestMIDIAccess !== 'function') {
      onStatus('unsupported');
      return;
    }

    let access: MidiAccessLike | null = null;

    const handle = (e: MidiMessageEvt): void => {
      const data = e.data;
      if (!data || data.length < 2) return;
      const command = data[0] & 0xf0;
      const note = data[1];
      const velocity = data.length > 2 ? data[2] : 0;

      if (command === NOTE_ON && velocity > 0) {
        // A MIDI message is a valid user gesture in most browsers; make sure the
        // context is running, then trigger immediately.
        void engine.resume();
        engine.noteOn(note, velocity);
      } else if (command === NOTE_OFF || (command === NOTE_ON && velocity === 0)) {
        engine.noteOff(note);
      } else if (command === PITCH_BEND) {
        // 14-bit value: LSB (data1) + MSB (data2), centered at 8192.
        engine.setBend(note | (velocity << 7));
      } else if (command === CONTROL_CHANGE) {
        // data1 = controller number, data2 = value.
        if (note === CC_SUSTAIN) engine.setSustain(velocity >= 64);
        else if (note === CC_MODULATION) engine.setModulation(velocity);
      }
    };

    const bind = (a: MidiAccessLike): void => {
      const names: string[] = [];
      a.inputs.forEach((input) => {
        input.onmidimessage = handle;
        names.push(input.name || 'MIDI device');
      });
      onDevices(names);
    };

    onStatus('requesting');
    requestMIDIAccess
      .call(navigator, { sysex: false })
      .then((a) => {
        access = a;
        bind(a);
        onStatus('ready');
        // Re-bind whenever devices are plugged in or removed.
        a.onstatechange = () => bind(a);
      })
      .catch(() => onStatus('denied'));

    return () => {
      access?.inputs.forEach((input) => {
        input.onmidimessage = null;
      });
    };
  }, [engine, onStatus, onDevices]);
}
