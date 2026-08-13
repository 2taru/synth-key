import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AudioEngine, DEFAULT_INSTRUMENT } from './audio/audioEngine';
import { midiToName } from './audio/notes';
import { useMidi, type MidiStatus } from './midi/useMidi';
import { chordToMidi, detectChord, type ChordResult } from './music/chords';
import { PianoKeyboard } from './components/PianoKeyboard';
import { InstrumentPanel, type InstrumentItem } from './components/InstrumentPanel';
import { SoundLibrary } from './components/SoundLibrary';
import { ChordPanel } from './components/ChordPanel';
import { DetectedChord } from './components/DetectedChord';
import { Toggle } from './components/Toggle';
import { OctaveControl } from './components/OctaveControl';
import { PitchBendMeter } from './components/PitchBendMeter';
import { ModulationSlider } from './components/ModulationSlider';
import { Logo } from './components/Logo';
import { Changelog } from './components/Changelog';
import { APP_VERSION } from './changelog';

// 49-key keyboard window (span of 48 semitones), always starting on a C.
const KEY_SPAN = 48;
const DEFAULT_LOW = 36; // C2 .. C6
const MIN_LOW = 12; // C0
const MAX_LOW = 72; // C5 .. C9

const NO_KEYS: Set<number> = new Set();

/**
 * Shift the visible window (octave-aligned) minimally so `midi` falls inside it —
 * used to make the on-screen octave follow what's played on a MIDI keyboard.
 */
function nextLowForNote(low: number, midi: number): number {
  let nl = low;
  while (midi < nl && nl > MIN_LOW) nl -= 12;
  while (midi > nl + KEY_SPAN && nl < MAX_LOW) nl += 12;
  return Math.max(MIN_LOW, Math.min(MAX_LOW, nl));
}

const MIDI_STATUS_TEXT: Record<MidiStatus, string> = {
  idle: 'Initializing…',
  requesting: 'Requesting MIDI access…',
  ready: 'MIDI ready',
  denied: 'MIDI access denied',
  unsupported: 'Web MIDI not supported in this browser',
};

export default function App() {
  // The engine lives outside React state so MIDI callbacks stay synchronous.
  const engineRef = useRef<AudioEngine | null>(null);
  if (!engineRef.current) engineRef.current = new AudioEngine();
  const engine = engineRef.current;

  const [instruments, setInstruments] = useState<InstrumentItem[]>([
    { name: DEFAULT_INSTRUMENT, status: 'loading' },
  ]);
  const [active, setActive] = useState(DEFAULT_INSTRUMENT);

  const [visualizer, setVisualizer] = useState(false);
  const [chordDetect, setChordDetect] = useState(false);
  const [chordLookup, setChordLookup] = useState(false);
  const [heldNotes, setHeldNotes] = useState<Set<number>>(() => new Set());

  const [low, setLow] = useState(DEFAULT_LOW);
  const high = low + KEY_SPAN;
  const [followMidi, setFollowMidi] = useState(true);

  const [chordSymbol, setChordSymbol] = useState<string | null>(null);
  const [chordError, setChordError] = useState<string | null>(null);

  const [bend, setBend] = useState(0);
  const [mod, setMod] = useState(0);
  const [sustain, setSustain] = useState(false);
  const [midiStatus, setMidiStatus] = useState<MidiStatus>('idle');
  const [devices, setDevices] = useState<string[]>([]);
  const [audioReady, setAudioReady] = useState(false);
  const [changelogOpen, setChangelogOpen] = useState(false);

  // --- Load the default, non-deletable instrument on mount ---
  useEffect(() => {
    let cancelled = false;
    const mark = (status: InstrumentItem['status']) =>
      setInstruments((prev) =>
        prev.map((i) => (i.name === DEFAULT_INSTRUMENT ? { ...i, status } : i)),
      );
    engine
      .load(DEFAULT_INSTRUMENT)
      .then(() => !cancelled && mark('ready'))
      .catch(() => !cancelled && mark('error'));
    return () => {
      cancelled = true;
    };
  }, [engine]);

  // --- Resume the AudioContext on the first user gesture ---
  useEffect(() => {
    const onGesture = () => {
      void engine.resume().then(() =>
        setAudioReady(engine.contextState === 'running'),
      );
    };
    window.addEventListener('pointerdown', onGesture);
    window.addEventListener('keydown', onGesture);
    return () => {
      window.removeEventListener('pointerdown', onGesture);
      window.removeEventListener('keydown', onGesture);
    };
  }, [engine]);

  // --- Observe notes while any feature needs them (held-note tracking for the
  //     visualizer/detection, and octave-follow for MIDI sync) ---
  useEffect(() => {
    const trackHeld = visualizer || chordDetect;
    if (!trackHeld) setHeldNotes(new Set());

    if (trackHeld || followMidi) {
      engine.onNote = (midi, on) => {
        if (trackHeld) {
          setHeldNotes((prev) => {
            const next = new Set(prev);
            if (on) next.add(midi);
            else next.delete(midi);
            return next;
          });
        }
        // Follow the played octave (no-op re-render when already in view).
        if (followMidi && on) setLow((l) => nextLowForNote(l, midi));
      };
    } else {
      engine.onNote = null;
    }
    return () => {
      engine.onNote = null;
    };
  }, [visualizer, chordDetect, followMidi, engine]);

  // --- Reflect the pitch-bend wheel, mod wheel and sustain pedal in the UI ---
  useEffect(() => {
    engine.onBend = (normalized) => setBend(normalized);
    engine.onMod = (value) => setMod(value);
    engine.onSustain = (on) => setSustain(on);
    return () => {
      engine.onBend = null;
      engine.onMod = null;
      engine.onSustain = null;
    };
  }, [engine]);

  // --- Keep the engine's active instrument in sync ---
  useEffect(() => {
    engine.setActive(active);
  }, [active, engine]);

  // --- Dev-only: expose the engine for manual testing (no MIDI hardware) ---
  useEffect(() => {
    if (import.meta.env.DEV) {
      (window as unknown as { __synth?: AudioEngine }).__synth = engine;
    }
  }, [engine]);

  // --- MIDI subscription (stable setters keep this effect from re-running) ---
  const onStatus = useCallback((s: MidiStatus) => setMidiStatus(s), []);
  const onDevices = useCallback((d: string[]) => setDevices(d), []);
  useMidi(engine, onStatus, onDevices);

  // --- Instrument management ---
  const handleLoad = useCallback(
    (raw: string) => {
      const name = raw.trim().toLowerCase().replace(/\s+/g, '_');
      if (!name) return;
      setInstruments((prev) =>
        prev.some((i) => i.name === name)
          ? prev
          : [...prev, { name, status: 'loading' }],
      );
      const mark = (status: InstrumentItem['status']) =>
        setInstruments((prev) =>
          prev.map((i) => (i.name === name ? { ...i, status } : i)),
        );
      engine
        .load(name)
        .then(() => {
          mark('ready');
          setActive(name); // auto-select the freshly loaded instrument
        })
        .catch(() => mark('error'));
    },
    [engine],
  );

  const handleDelete = useCallback(
    (name: string) => {
      if (name === DEFAULT_INSTRUMENT) return;
      engine.remove(name);
      setInstruments((prev) => prev.filter((i) => i.name !== name));
      setActive((cur) => (cur === name ? DEFAULT_INSTRUMENT : cur));
    },
    [engine],
  );

  const handleSelect = useCallback(
    (name: string) => {
      if (engine.has(name)) setActive(name);
    },
    [engine],
  );

  // --- Octave shift ---
  const shiftOctave = useCallback((dir: 1 | -1) => {
    setLow((l) => Math.max(MIN_LOW, Math.min(MAX_LOW, l + dir * 12)));
  }, []);

  // --- Chord lookup (re-maps into the visible window when the octave changes) ---
  const chord: ChordResult | null = useMemo(() => {
    if (!chordSymbol) return null;
    const baseOctave = Math.floor((low + high) / 2 / 12) - 1;
    return chordToMidi(chordSymbol, baseOctave, low, high);
  }, [chordSymbol, low, high]);

  const handleShowChord = useCallback(
    (symbol: string) => {
      const baseOctave = Math.floor((low + high) / 2 / 12) - 1;
      const res = chordToMidi(symbol, baseOctave, low, high);
      if (!res.ok) {
        setChordSymbol(null);
        setChordError(`Unknown chord: "${symbol.trim()}"`);
        return;
      }
      setChordError(null);
      setChordSymbol(symbol.trim());
    },
    [low, high],
  );

  const handleClearChord = useCallback(() => {
    setChordSymbol(null);
    setChordError(null);
  }, []);

  const handleChordLookup = useCallback((on: boolean) => {
    setChordLookup(on);
    if (!on) {
      // Hiding the panel also clears its highlighted notes.
      setChordSymbol(null);
      setChordError(null);
    }
  }, []);

  const chordKeys = useMemo(() => new Set(chord?.midi ?? []), [chord]);

  // --- Chord detection from currently held notes ---
  const detected = useMemo(
    () => (chordDetect ? detectChord(heldNotes) : null),
    [chordDetect, heldNotes],
  );

  // --- Sound library state ---
  const loadedSet = useMemo(
    () =>
      new Set(instruments.filter((i) => i.status === 'ready').map((i) => i.name)),
    [instruments],
  );
  const loadingSet = useMemo(
    () =>
      new Set(instruments.filter((i) => i.status === 'loading').map((i) => i.name)),
    [instruments],
  );

  // --- Playing from the on-screen keyboard (mouse / touch) ---
  const handlePress = useCallback(
    (midi: number) => {
      void engine.resume();
      engine.noteOn(midi, 100);
    },
    [engine],
  );
  const handleRelease = useCallback(
    (midi: number) => engine.noteOff(midi),
    [engine],
  );

  // --- Sustain pedal & mod wheel (routed through the engine, which echoes back
  //     via onSustain/onMod so MIDI and on-screen controls stay in sync) ---
  const handleSustain = useCallback(
    (on: boolean) => engine.setSustain(on),
    [engine],
  );
  const handleMod = useCallback(
    (value: number) => engine.setModulation(value),
    [engine],
  );

  const activeKeys = visualizer ? heldNotes : NO_KEYS;

  return (
    <div className="app">
      <header className="app-header">
        <Logo />
        <div
          className={[
            'midi-status',
            midiStatus === 'ready' && 'ok',
            (midiStatus === 'denied' || midiStatus === 'unsupported') && 'bad',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <span className="dot" aria-hidden />
          {MIDI_STATUS_TEXT[midiStatus]}
          {midiStatus === 'ready' && (
            <span className="device-count">
              {devices.length > 0
                ? ` · ${devices.length} device${devices.length > 1 ? 's' : ''}`
                : ' · no devices'}
            </span>
          )}
        </div>
      </header>

      {!audioReady && (
        <div className="audio-banner">
          🔊 Click anywhere or press a key to enable audio.
        </div>
      )}

      <div className="layout">
        <div className="sidebar">
          <InstrumentPanel
            instruments={instruments}
            active={active}
            defaultName={DEFAULT_INSTRUMENT}
            onSelect={handleSelect}
            onLoad={handleLoad}
            onDelete={handleDelete}
          />
          <SoundLibrary
            loaded={loadedSet}
            loading={loadingSet}
            active={active}
            onPick={handleLoad}
          />
        </div>

        <main className="main">
          <section className="panel controls">
            <Toggle
              checked={visualizer}
              onChange={setVisualizer}
              label="Visualizer"
              hint="Highlight played keys"
            />
            <Toggle
              checked={chordDetect}
              onChange={setChordDetect}
              label="Chord detection"
              hint="Name the chord you play"
            />
            <Toggle
              checked={chordLookup}
              onChange={handleChordLookup}
              label="Chord lookup"
              hint="Show a chord by name"
            />
            <Toggle
              checked={sustain}
              onChange={handleSustain}
              label="Sustain"
              hint="Hold notes · pedal CC64"
            />
            <OctaveControl
              rangeLabel={`${midiToName(low)}–${midiToName(high)}`}
              onDown={() => shiftOctave(-1)}
              onUp={() => shiftOctave(1)}
              canDown={low > MIN_LOW}
              canUp={low < MAX_LOW}
              follow={followMidi}
              onFollowChange={setFollowMidi}
            />
            <PitchBendMeter value={bend} />
            <ModulationSlider value={mod} onChange={handleMod} />
          </section>

          {chordDetect && (
            <DetectedChord detected={detected} heldCount={heldNotes.size} />
          )}

          {chordLookup && (
            <ChordPanel
              result={chord}
              error={chordError}
              onShow={handleShowChord}
              onClear={handleClearChord}
            />
          )}

          <section className="panel keyboard-panel">
            <div className="legend">
              <span className="legend-item">
                <span className="swatch active" /> Played
              </span>
              <span className="legend-item">
                <span className="swatch chord" /> Chord
              </span>
            </div>
            <PianoKeyboard
              low={low}
              high={high}
              activeKeys={activeKeys}
              chordKeys={chordKeys}
              onPress={handlePress}
              onRelease={handleRelease}
            />
          </section>
        </main>
      </div>

      <footer className="app-footer">
        <span className="footer-brand">Synth Key</span>
        <button
          type="button"
          className="version-button"
          onClick={() => setChangelogOpen(true)}
        >
          v{APP_VERSION} · Changelog
        </button>
      </footer>

      <Changelog open={changelogOpen} onClose={() => setChangelogOpen(false)} />
    </div>
  );
}
