import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { AudioEngine, DEFAULT_INSTRUMENT } from './audio/audioEngine';
import { midiToName } from './audio/notes';
import { useMidi, type MidiStatus } from './midi/useMidi';
import { chordToMidi, detectChord, type ChordResult } from './music/chords';
import { detectIntervals } from './music/intervals';
import { getScale } from './music/scales';
import { PianoKeyboard } from './components/PianoKeyboard';
import { NoteWaterfall } from './components/NoteWaterfall';
import { SongRoll } from './components/SongRoll';
import { MixerPanel } from './components/MixerPanel';
import { MetronomePanel } from './components/MetronomePanel';
import { RecorderPanel } from './components/RecorderPanel';
import { SongPanel } from './components/SongPanel';
import { SoundPanel } from './components/SoundPanel';
import { SplitPanel, type LayerMode } from './components/SplitPanel';
import { renderSequenceToWav, downloadWav } from './audio/wavExport';
import { Metronome } from './audio/metronome';
import { Recorder } from './audio/recorder';
import { NotePlayer } from './audio/notePlayer';
import { SongController } from './audio/songController';
import { parseMidiFile, downloadMidi, type ParsedSong } from './music/midiFile';
import { InstrumentPanel, type InstrumentItem } from './components/InstrumentPanel';
import { SoundLibrary } from './components/SoundLibrary';
import { ChordPanel } from './components/ChordPanel';
import { NowPlaying } from './components/NowPlaying';
import { TheoryPanel } from './components/TheoryPanel';
import { ReferencePanel } from './components/ReferencePanel';
import { EarTrainer } from './components/EarTrainer';
import { Toggle } from './components/Toggle';
import { Tabs } from './components/Tabs';
import { OctaveControl } from './components/OctaveControl';
import { PitchBendMeter } from './components/PitchBendMeter';
import { ModulationSlider } from './components/ModulationSlider';
import { Logo } from './components/Logo';
import { Changelog } from './components/Changelog';
import { SettingsModal } from './components/SettingsModal';
import { FullscreenToolbar } from './components/FullscreenToolbar';
import { APP_VERSION } from './changelog';
import {
  loadSettings,
  saveSettings,
  applyColors,
  DEFAULT_COLORS,
  DEFAULT_SETTINGS,
  type Colors,
} from './settings';

// The visible keyboard window is always C-aligned; the user picks the low & high
// octave (e.g. C2–C6). C0..C8 is the overall allowed span.
const MIN_OCTAVE = 0;
const MAX_OCTAVE = 8;
const MIN_MIDI = (MIN_OCTAVE + 1) * 12; // C0 = 12
const MAX_MIDI = (MAX_OCTAVE + 1) * 12; // C8 = 108
const octaveToMidi = (o: number): number => (o + 1) * 12;
const midiToOctave = (m: number): number => Math.floor(m / 12) - 1;

const NO_KEYS: Set<number> = new Set();
const SONG_LEAD_IN = 2; // seconds of fall-in before the first note plays

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

  // Studio helpers (constructed once; they don't create audio nodes until used).
  const metronomeRef = useRef<Metronome | null>(null);
  if (!metronomeRef.current) metronomeRef.current = new Metronome(engine.ctx, engine.masterBus);
  const recorderRef = useRef<Recorder | null>(null);
  if (!recorderRef.current) recorderRef.current = new Recorder(engine);
  const recPlayerRef = useRef<NotePlayer | null>(null);
  if (!recPlayerRef.current) recPlayerRef.current = new NotePlayer(engine);
  const songRef = useRef<SongController | null>(null);
  if (!songRef.current) songRef.current = new SongController(engine);

  // Persisted settings (loaded once from localStorage).
  const s0 = useMemo(loadSettings, []);
  const [colors, setColors] = useState<Colors>(s0.colors);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [toolbarMin, setToolbarMin] = useState(false);
  const [keyHeight, setKeyHeight] = useState(s0.keyHeight);
  const [noteSpeed, setNoteSpeed] = useState(s0.noteSpeed);
  const stageWrapRef = useRef<HTMLDivElement | null>(null);

  const [instruments, setInstruments] = useState<InstrumentItem[]>([
    { name: DEFAULT_INSTRUMENT, status: 'loading' },
  ]);
  const [active, setActive] = useState(DEFAULT_INSTRUMENT);

  const [visualizer, setVisualizer] = useState(s0.visualizer);
  const [noteWaterfall, setNoteWaterfall] = useState(s0.noteWaterfall);
  const [chordDetect, setChordDetect] = useState(s0.chordDetect);
  const [intervalDetect, setIntervalDetect] = useState(s0.intervalDetect);
  const [chordLookup, setChordLookup] = useState(s0.chordLookup);
  const [theory, setTheory] = useState(s0.theory);
  const [theoryTonic, setTheoryTonic] = useState(s0.theoryTonic);
  const [theoryScale, setTheoryScale] = useState(s0.theoryScale);
  const [reference, setReference] = useState(s0.reference);
  const [earTraining, setEarTraining] = useState(s0.earTraining);
  const [heldNotes, setHeldNotes] = useState<Set<number>>(() => new Set());

  const [activeTab, setActiveTab] = useState(s0.activeTab);

  // Sound shaping (persisted scalars) + split/layer (session-only)
  const [transpose, setTranspose] = useState(s0.transpose);
  const [attack, setAttack] = useState(s0.attack);
  const [decay, setDecay] = useState(s0.decay);
  const [sustainLevel, setSustainLevel] = useState(s0.sustain);
  const [release, setRelease] = useState(s0.release);
  const [delay, setDelay] = useState(s0.delay);
  const [chorus, setChorus] = useState(s0.chorus);
  const [layerMode, setLayerMode] = useState<LayerMode>('off');
  const [secondary, setSecondary] = useState('');
  const [splitPoint, setSplitPoint] = useState(60);
  const [exportingWav, setExportingWav] = useState(false);

  const [low, setLow] = useState(() => octaveToMidi(s0.lowOctave));
  const [high, setHigh] = useState(() => octaveToMidi(s0.highOctave));
  const [followMidi, setFollowMidi] = useState(s0.followMidi);
  // Latest window for the (stable) MIDI-follow listener to read without re-subscribing.
  const viewRef = useRef({ low, high });
  viewRef.current = { low, high };

  const [chordSymbol, setChordSymbol] = useState<string | null>(null);
  const [chordError, setChordError] = useState<string | null>(null);

  const [bend, setBend] = useState(0);
  const [mod, setMod] = useState(0);
  const [sustain, setSustain] = useState(false);

  // Mixer / transport
  const [master, setMaster] = useState(s0.master);
  const [reverb, setReverb] = useState(s0.reverb);
  const [bpm, setBpm] = useState(s0.bpm);
  const [metronomeOn, setMetronomeOn] = useState(false);
  const [timeSigNum, setTimeSigNum] = useState(s0.timeSigNum);
  const [timeSigDen, setTimeSigDen] = useState(s0.timeSigDen);
  const [accentStrong, setAccentStrong] = useState(s0.accentStrong);
  const [playWeak, setPlayWeak] = useState(s0.playWeak);
  const [beat, setBeat] = useState(-1);
  const [recording, setRecording] = useState(false);
  const [recPlaying, setRecPlaying] = useState(false);
  const [recNoteCount, setRecNoteCount] = useState(0);
  const [song, setSong] = useState<ParsedSong | null>(null);
  const [songPlaying, setSongPlaying] = useState(false);
  const [practice, setPractice] = useState(false);
  const [targetKeys, setTargetKeys] = useState<Set<number>>(() => new Set());

  // Feature panels (recording & song mode are separate, toggle-revealed features)
  const [recorderMode, setRecorderMode] = useState(s0.recorderMode);
  const [songMode, setSongMode] = useState(s0.songMode);
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

  // --- Apply persisted audio settings to the engine once on mount ---
  useEffect(() => {
    engine.setMasterVolume(s0.master);
    engine.setReverb(s0.reverb);
    const m = metronomeRef.current;
    m?.setBpm(s0.bpm);
    m?.setTimeSignature(s0.timeSigNum, s0.timeSigDen);
    m?.setAccentStrong(s0.accentStrong);
    m?.setPlayWeak(s0.playWeak);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine]);

  // --- Apply editable colors to CSS variables ---
  useEffect(() => {
    applyColors(colors);
  }, [colors]);

  // --- Reflect the key height as a CSS variable ---
  useEffect(() => {
    document.documentElement.style.setProperty('--key-height', `${keyHeight}px`);
  }, [keyHeight]);

  // --- Flash the beat indicator on each metronome beat ---
  useEffect(() => {
    const m = metronomeRef.current;
    if (!m) return;
    m.onBeat = (b) => setBeat(b);
    return () => {
      m.onBeat = null;
    };
  }, []);

  // --- Persist settings to localStorage whenever they change ---
  useEffect(() => {
    saveSettings({
      colors,
      master,
      reverb,
      bpm,
      followMidi,
      visualizer,
      noteWaterfall,
      chordDetect,
      intervalDetect,
      chordLookup,
      theory,
      theoryTonic,
      theoryScale,
      reference,
      earTraining,
      transpose,
      attack,
      decay,
      sustain: sustainLevel,
      release,
      delay,
      chorus,
      recorderMode,
      songMode,
      activeTab,
      lowOctave: midiToOctave(low),
      highOctave: midiToOctave(high),
      keyHeight,
      noteSpeed,
      timeSigNum,
      timeSigDen,
      accentStrong,
      playWeak,
    });
  }, [
    colors,
    master,
    reverb,
    bpm,
    followMidi,
    visualizer,
    noteWaterfall,
    chordDetect,
    intervalDetect,
    chordLookup,
    theory,
    theoryTonic,
    theoryScale,
    reference,
    earTraining,
    transpose,
    attack,
    decay,
    sustainLevel,
    release,
    delay,
    chorus,
    recorderMode,
    songMode,
    activeTab,
    low,
    high,
    keyHeight,
    noteSpeed,
    timeSigNum,
    timeSigDen,
    accentStrong,
    playWeak,
  ]);

  // --- Track fullscreen state of the stage ---
  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === stageWrapRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

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
    const trackHeld = visualizer || chordDetect || intervalDetect;
    if (!trackHeld) setHeldNotes(new Set());
    if (!trackHeld && !followMidi) return;

    return engine.addNoteListener((midi, on) => {
      if (trackHeld) {
        setHeldNotes((prev) => {
          const next = new Set(prev);
          if (on) next.add(midi);
          else next.delete(midi);
          return next;
        });
      }
      // Follow the played octave: slide the whole window (keeping its span) so
      // the note falls inside it. No-op re-render when already in view.
      if (followMidi && on) {
        const { low: lo, high: hi } = viewRef.current;
        const span = hi - lo;
        let nl = lo;
        while (midi < nl && nl - 12 >= MIN_MIDI) nl -= 12;
        while (midi > nl + span && nl + span + 12 <= MAX_MIDI) nl += 12;
        if (nl !== lo) {
          setLow(nl);
          setHigh(nl + span);
        }
      }
    });
  }, [visualizer, chordDetect, intervalDetect, followMidi, engine]);

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

  // --- Song controller: highlight target keys and reset on end ---
  useEffect(() => {
    const song = songRef.current;
    if (!song) return;
    song.onTargets = (midis) => setTargetKeys(new Set(midis));
    song.onEnd = () => {
      setSongPlaying(false);
      setTargetKeys(new Set());
    };
    return () => {
      song.onTargets = null;
      song.onEnd = null;
    };
  }, []);

  // --- Dev-only: expose the engine + studio helpers for manual testing ---
  useEffect(() => {
    if (import.meta.env.DEV) {
      Object.assign(window as unknown as Record<string, unknown>, {
        __synth: engine,
        __metronome: metronomeRef.current,
        __recorder: recorderRef.current,
        __recPlayer: recPlayerRef.current,
        __song: songRef.current,
      });
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

  // --- Octave shift (slides the window, keeping its span) ---
  const shiftOctave = useCallback(
    (dir: 1 | -1) => {
      const delta = dir * 12;
      if (low + delta < MIN_MIDI || high + delta > MAX_MIDI) return;
      setLow(low + delta);
      setHigh(high + delta);
    },
    [low, high],
  );

  // --- Keyboard range (low / high octave selectors) ---
  const handleLowOctave = useCallback((o: number) => {
    const nl = octaveToMidi(o);
    setLow(nl);
    setHigh((hi) => Math.max(nl + 12, hi)); // always show at least one octave
  }, []);
  const handleHighOctave = useCallback((o: number) => {
    const nh = octaveToMidi(o);
    setHigh(nh);
    setLow((lo) => Math.min(nh - 12, lo));
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

  // --- Interval analysis from currently held notes ---
  const intervals = useMemo(
    () => (intervalDetect ? detectIntervals(heldNotes) : null),
    [intervalDetect, heldNotes],
  );

  // --- Intervals of the notes to play next, shown as a practice hint ---
  const targetIntervals = useMemo(
    () => (songMode && practice ? detectIntervals(targetKeys) : null),
    [songMode, practice, targetKeys],
  );

  // --- Scale / key theory: powers keyboard highlighting and the theory panel ---
  const scaleInfo = useMemo(
    () => getScale(theoryTonic, theoryScale),
    [theoryTonic, theoryScale],
  );
  const scaleChromas = theory && scaleInfo.ok ? scaleInfo.chromas : undefined;
  const rootChroma = theory && scaleInfo.ok ? scaleInfo.tonicChroma : null;

  // --- Audition notes from theory tools / ear trainer (outside the hot path) ---
  const playMidis = useCallback(
    (midis: number[], arpeggio = false) => {
      void engine.resume();
      if (arpeggio) {
        const step = 280;
        midis.forEach((m, i) => {
          window.setTimeout(() => engine.noteOn(m, 96), i * step);
          window.setTimeout(() => engine.noteOff(m), i * step + 460);
        });
      } else {
        midis.forEach((m) => engine.noteOn(m, 96));
        window.setTimeout(() => midis.forEach((m) => engine.noteOff(m)), 750);
      }
    },
    [engine],
  );

  // --- Push sound-shaping settings into the engine ---
  useEffect(() => engine.setTranspose(transpose), [engine, transpose]);
  useEffect(
    () => engine.setEnvelope({ attack, decay, sustain: sustainLevel, release }),
    [engine, attack, decay, sustainLevel, release],
  );
  useEffect(() => engine.setDelay(delay), [engine, delay]);
  useEffect(() => engine.setChorus(chorus), [engine, chorus]);
  useEffect(() => engine.setLayerMode(layerMode), [engine, layerMode]);
  useEffect(() => engine.setSplitPoint(splitPoint), [engine, splitPoint]);
  useEffect(() => engine.setSecondary(secondary || null), [engine, secondary]);

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
    (midi: number, velocity: number) => {
      void engine.resume();
      engine.noteOn(midi, velocity);
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

  // --- Mixer ---
  const handleMaster = useCallback(
    (v: number) => {
      setMaster(v);
      engine.setMasterVolume(v);
    },
    [engine],
  );
  const handleReverb = useCallback(
    (v: number) => {
      setReverb(v);
      engine.setReverb(v);
    },
    [engine],
  );
  const handleBpm = useCallback((v: number) => {
    const clamped = Math.max(20, Math.min(300, v || 120));
    setBpm(clamped);
    metronomeRef.current?.setBpm(clamped);
  }, []);
  const handleMetronome = useCallback(
    (on: boolean) => {
      void engine.resume();
      if (on) {
        metronomeRef.current?.start();
      } else {
        metronomeRef.current?.stop();
        setBeat(-1);
      }
      setMetronomeOn(on);
    },
    [engine],
  );
  const handleTimeSig = useCallback((num: number, den: number) => {
    const n = Math.max(1, Math.min(32, Math.round(num) || 4));
    setTimeSigNum(n);
    setTimeSigDen(den);
    metronomeRef.current?.setTimeSignature(n, den);
  }, []);
  const handleAccentStrong = useCallback((on: boolean) => {
    setAccentStrong(on);
    metronomeRef.current?.setAccentStrong(on);
  }, []);
  const handlePlayWeak = useCallback((on: boolean) => {
    setPlayWeak(on);
    metronomeRef.current?.setPlayWeak(on);
  }, []);

  // --- Drag-to-resize the on-screen keys (grab the handle above the keyboard) ---
  const keyHeightRef = useRef(keyHeight);
  keyHeightRef.current = keyHeight;
  const startKeyResize = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const startY = e.clientY;
    const startH = keyHeightRef.current;
    const onMove = (ev: PointerEvent) => {
      // Drag up ⇒ taller keys.
      const nh = Math.max(90, Math.min(420, Math.round(startH - (ev.clientY - startY))));
      setKeyHeight(nh);
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, []);

  // --- Recording & playback ---
  const stopAllPlayback = useCallback(() => {
    recPlayerRef.current?.stop();
    songRef.current?.stop();
    setRecPlaying(false);
    setSongPlaying(false);
  }, []);

  const handleRecord = useCallback(() => {
    const rec = recorderRef.current;
    if (!rec) return;
    if (rec.isRecording) {
      rec.stop();
      setRecording(false);
      setRecNoteCount(rec.noteCount);
    } else {
      void engine.resume();
      stopAllPlayback();
      rec.start();
      setRecording(true);
      setRecNoteCount(0);
    }
  }, [engine, stopAllPlayback]);

  const handlePlayRec = useCallback(() => {
    const rec = recorderRef.current;
    const player = recPlayerRef.current;
    if (!rec || !player || rec.noteCount === 0) return;
    void engine.resume();
    stopAllPlayback();
    player.onEnd = () => setRecPlaying(false);
    player.play(rec.getNotes());
    setRecPlaying(true);
  }, [engine, stopAllPlayback]);

  const handleExport = useCallback(() => {
    const rec = recorderRef.current;
    if (rec && rec.noteCount > 0) downloadMidi(rec.getNotes(), bpm);
  }, [bpm]);

  const handleExportWav = useCallback(() => {
    const rec = recorderRef.current;
    if (!rec || rec.noteCount === 0 || exportingWav) return;
    setExportingWav(true);
    renderSequenceToWav(rec.getNotes(), engine.activeName)
      .then((blob) => downloadWav(blob))
      .catch((err) => console.error('WAV export failed', err))
      .finally(() => setExportingWav(false));
  }, [engine, exportingWav]);

  // --- Song mode ---
  const handleLoadSong = useCallback(
    (file: File) => {
      parseMidiFile(file)
        .then((parsed) => {
          setSong(parsed);
          songRef.current?.load(parsed.notes);
          if (parsed.bpm) handleBpm(parsed.bpm);
          // Center the current window (keeping its span) on the song's range.
          if (parsed.notes.length) {
            const span = high - low;
            const mids = parsed.notes.map((n) => n.midi);
            const center = (Math.min(...mids) + Math.max(...mids)) / 2;
            const raw = Math.round((center - span / 2) / 12) * 12;
            const target = Math.max(MIN_MIDI, Math.min(MAX_MIDI - span, raw));
            setLow(target);
            setHigh(target + span);
          }
        })
        .catch(() => setSong(null));
    },
    [handleBpm, low, high],
  );

  const handlePlaySong = useCallback(() => {
    if (!song || song.notes.length === 0) return;
    void engine.resume();
    stopAllPlayback();
    songRef.current?.play(practice ? 'practice' : 'auto', SONG_LEAD_IN);
    setSongPlaying(true);
  }, [engine, song, practice, stopAllPlayback]);

  const handleStopSong = useCallback(() => {
    songRef.current?.stop();
    setSongPlaying(false);
    setTargetKeys(new Set());
  }, []);

  const handleClearSong = useCallback(() => {
    songRef.current?.stop();
    setSongPlaying(false);
    setTargetKeys(new Set());
    setSong(null);
  }, []);

  const songTime = useCallback(() => songRef.current?.songTime() ?? 0, []);

  // --- Settings & fullscreen ---
  const handleColorChange = useCallback((key: keyof Colors, value: string) => {
    setColors((prev) => ({ ...prev, [key]: value }));
  }, []);
  const handleResetColors = useCallback(() => {
    setColors(DEFAULT_COLORS);
    setKeyHeight(DEFAULT_SETTINGS.keyHeight);
    setNoteSpeed(DEFAULT_SETTINGS.noteSpeed);
  }, []);
  const toggleFullscreen = useCallback(() => {
    const el = stageWrapRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      el.requestFullscreen?.().catch(() => {});
    }
  }, []);

  const activeKeys = visualizer ? heldNotes : NO_KEYS;
  const rangeLabel = `${midiToName(low)}–${midiToName(high)}`;

  return (
    <div className="app">
      <header className="app-header">
        <Logo />
        <div className="header-right">
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
          <button
            type="button"
            className="icon-btn"
            onClick={() => setSettingsOpen(true)}
            aria-label="Settings"
            title="Settings"
          >
            ⚙
          </button>
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
          <Tabs
            tabs={[
              {
                key: 'play',
                label: 'Play',
                badge:
                  (visualizer ? 1 : 0) + (noteWaterfall ? 1 : 0) + (sustain ? 1 : 0),
              },
              {
                key: 'learn',
                label: 'Learn',
                badge:
                  (chordDetect ? 1 : 0) +
                  (intervalDetect ? 1 : 0) +
                  (chordLookup ? 1 : 0) +
                  (theory ? 1 : 0) +
                  (earTraining ? 1 : 0) +
                  (reference ? 1 : 0),
              },
              {
                key: 'studio',
                label: 'Studio',
                badge: (recorderMode ? 1 : 0) + (songMode ? 1 : 0),
              },
            ]}
            active={activeTab}
            onChange={setActiveTab}
          />

          {activeTab === 'play' && (
            <>
              <section className="panel controls">
                <div className="control-group">
                  <span className="control-group-label">Visualize</span>
                  <Toggle
                    checked={visualizer}
                    onChange={setVisualizer}
                    label="Visualizer"
                    hint="Highlight played keys"
                  />
                  <Toggle
                    checked={noteWaterfall}
                    onChange={setNoteWaterfall}
                    label="Note waterfall"
                    hint="Live rising piano roll"
                  />
                </div>

                <div className="control-group">
                  <span className="control-group-label">Perform</span>
                  <Toggle
                    checked={sustain}
                    onChange={handleSustain}
                    label="Sustain"
                    hint="Hold notes · pedal CC64"
                  />
                </div>

                <OctaveControl
                  lowOctave={midiToOctave(low)}
                  highOctave={midiToOctave(high)}
                  minOctave={MIN_OCTAVE}
                  maxOctave={MAX_OCTAVE}
                  onLowOctave={handleLowOctave}
                  onHighOctave={handleHighOctave}
                  onDown={() => shiftOctave(-1)}
                  onUp={() => shiftOctave(1)}
                  canDown={low > MIN_MIDI}
                  canUp={high < MAX_MIDI}
                  follow={followMidi}
                  onFollowChange={setFollowMidi}
                />
                <PitchBendMeter value={bend} />
                <ModulationSlider value={mod} onChange={handleMod} />
              </section>

              <MixerPanel
            master={master}
            onMaster={handleMaster}
            reverb={reverb}
            onReverb={handleReverb}
            bpm={bpm}
            onBpm={handleBpm}
          />

          <MetronomePanel
            metronomeOn={metronomeOn}
            onMetronome={handleMetronome}
            timeSigNum={timeSigNum}
            timeSigDen={timeSigDen}
            onTimeSig={handleTimeSig}
            accentStrong={accentStrong}
            onAccentStrong={handleAccentStrong}
            playWeak={playWeak}
            onPlayWeak={handlePlayWeak}
            beat={beat}
              />
            </>
          )}

          {activeTab === 'studio' && (
            <>
              <section className="panel controls">
                <div className="control-group">
                  <span className="control-group-label">Record</span>
                  <Toggle
                    checked={recorderMode}
                    onChange={setRecorderMode}
                    label="Recorder"
                    hint="Record & export .mid"
                  />
                  <Toggle
                    checked={songMode}
                    onChange={setSongMode}
                    label="Song mode"
                    hint="Play/practice a .mid"
                  />
                </div>
              </section>

              <SoundPanel
            transpose={transpose}
            onTranspose={setTranspose}
            attack={attack}
            decay={decay}
            sustain={sustainLevel}
            release={release}
            onAttack={setAttack}
            onDecay={setDecay}
            onSustain={setSustainLevel}
            onRelease={setRelease}
            delay={delay}
            onDelay={setDelay}
            chorus={chorus}
            onChorus={setChorus}
          />

          <SplitPanel
            mode={layerMode}
            onMode={setLayerMode}
            primaryName={active}
            secondary={secondary}
            onSecondary={setSecondary}
            readyInstruments={[...loadedSet]}
            splitPoint={splitPoint}
            onSplitPoint={setSplitPoint}
            low={low}
            high={high}
          />

          {recorderMode && (
            <RecorderPanel
              recording={recording}
              recPlaying={recPlaying}
              recNoteCount={recNoteCount}
              onRecord={handleRecord}
              onPlayRec={handlePlayRec}
              onStop={stopAllPlayback}
              onExport={handleExport}
              onExportWav={handleExportWav}
              exportingWav={exportingWav}
            />
          )}

          {songMode && (
            <SongPanel
              song={song ? { name: song.name, noteCount: song.notes.length } : null}
              songPlaying={songPlaying}
              practice={practice}
              onLoadSong={handleLoadSong}
              onPlaySong={handlePlaySong}
              onStopSong={handleStopSong}
              onClearSong={handleClearSong}
              onPracticeChange={setPractice}
            />
              )}
            </>
          )}

          {activeTab === 'learn' && (
            <>
              <section className="panel controls">
                <div className="control-group">
                  <span className="control-group-label">Detect</span>
                  <Toggle
                    checked={chordDetect}
                    onChange={setChordDetect}
                    label="Chord detection"
                    hint="Name the chord you play"
                  />
                  <Toggle
                    checked={intervalDetect}
                    onChange={setIntervalDetect}
                    label="Interval detection"
                    hint="Name & break down intervals"
                  />
                  <Toggle
                    checked={chordLookup}
                    onChange={handleChordLookup}
                    label="Chord lookup"
                    hint="Show a chord by name"
                  />
                </div>
                <div className="control-group">
                  <span className="control-group-label">Study</span>
                  <Toggle
                    checked={theory}
                    onChange={setTheory}
                    label="Scales & keys"
                    hint="Highlight a scale, see its chords"
                  />
                  <Toggle
                    checked={earTraining}
                    onChange={setEarTraining}
                    label="Ear training"
                    hint="Guess intervals & chords"
                  />
                  <Toggle
                    checked={reference}
                    onChange={setReference}
                    label="Reference"
                    hint="Interval & chord cheat-sheet"
                  />
                </div>
              </section>

              {(chordDetect || intervalDetect) && (
                <NowPlaying
              chordDetect={chordDetect}
              intervalDetect={intervalDetect}
              detected={detected}
              intervals={intervals}
              heldCount={heldNotes.size}
            />
          )}

          {theory && (
            <TheoryPanel
              tonic={theoryTonic}
              scaleType={theoryScale}
              onTonic={setTheoryTonic}
              onScaleType={setTheoryScale}
              info={scaleInfo}
              onPlayNotes={playMidis}
            />
          )}

          {earTraining && <EarTrainer onPlayNotes={playMidis} />}

          {reference && <ReferencePanel />}

          {chordLookup && (
            <ChordPanel
              result={chord}
              error={chordError}
              onShow={handleShowChord}
              onClear={handleClearChord}
            />
              )}
            </>
          )}

          <section className="panel keyboard-panel">
            <div className="legend">
              <span className="legend-item">
                <span className="swatch active" /> Played
              </span>
              <span className="legend-item">
                <span className="swatch chord" /> Chord
              </span>
              {songMode && (
                <span className="legend-item">
                  <span className="swatch target" /> To play
                </span>
              )}
              {theory && scaleInfo.ok && (
                <span className="legend-item">
                  <span className="swatch scale" /> {theoryTonic} {theoryScale}
                </span>
              )}
              {targetIntervals && targetIntervals.stacked.length > 0 && (
                <span className="legend-intervals" title="Intervals between the notes to play next">
                  Next intervals:{' '}
                  {targetIntervals.stacked.map((iv, i) => (
                    <span key={i} className="legend-iv" title={iv.label}>
                      {iv.short}
                    </span>
                  ))}
                </span>
              )}
            </div>
            <div
              className={`stage-wrap ${fullscreen ? 'is-fullscreen' : ''}`}
              ref={stageWrapRef}
            >
              {fullscreen ? (
                <FullscreenToolbar
                  visualizer={visualizer}
                  onVisualizer={setVisualizer}
                  noteWaterfall={noteWaterfall}
                  onNoteWaterfall={setNoteWaterfall}
                  chordDetect={chordDetect}
                  onChordDetect={setChordDetect}
                  intervalDetect={intervalDetect}
                  onIntervalDetect={setIntervalDetect}
                  chordLookup={chordLookup}
                  onChordLookup={handleChordLookup}
                  sustain={sustain}
                  onSustain={handleSustain}
                  metronomeOn={metronomeOn}
                  onMetronome={handleMetronome}
                  recording={recording}
                  recPlaying={recPlaying}
                  onRecord={handleRecord}
                  rangeLabel={rangeLabel}
                  onDown={() => shiftOctave(-1)}
                  onUp={() => shiftOctave(1)}
                  canDown={low > MIN_MIDI && !followMidi}
                  canUp={high < MAX_MIDI && !followMidi}
                  minimized={toolbarMin}
                  onToggleMin={() => setToolbarMin((m) => !m)}
                  onExit={toggleFullscreen}
                />
              ) : (
                <button
                  type="button"
                  className="icon-btn fs-btn"
                  onClick={toggleFullscreen}
                  aria-label="Fullscreen"
                  title="Fullscreen"
                >
                  ⛶
                </button>
              )}
              <div className="stage">
                <div className="stage-inner">
                  {songPlaying && song ? (
                    <SongRoll
                      notes={song.notes}
                      getTime={songTime}
                      low={low}
                      high={high}
                      whiteColor={colors.noteWhite}
                      blackColor={colors.noteBlack}
                      speed={noteSpeed}
                    />
                  ) : (
                    noteWaterfall && (
                      <NoteWaterfall
                        engine={engine}
                        low={low}
                        high={high}
                        whiteColor={colors.noteWhite}
                        blackColor={colors.noteBlack}
                        speed={noteSpeed}
                      />
                    )
                  )}
                  <div
                    className="key-resizer"
                    onPointerDown={startKeyResize}
                    title="Drag to resize the keys"
                    role="separator"
                    aria-label="Resize keys"
                  >
                    <span className="key-resizer-grip" aria-hidden />
                  </div>
                  <PianoKeyboard
                    low={low}
                    high={high}
                    activeKeys={activeKeys}
                    chordKeys={chordKeys}
                    targetKeys={targetKeys}
                    scaleChromas={scaleChromas}
                    rootChroma={rootChroma}
                    onPress={handlePress}
                    onRelease={handleRelease}
                  />
                </div>
              </div>
            </div>
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
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        colors={colors}
        onColorChange={handleColorChange}
        onReset={handleResetColors}
        keyHeight={keyHeight}
        onKeyHeight={setKeyHeight}
        noteSpeed={noteSpeed}
        onNoteSpeed={setNoteSpeed}
      />
    </div>
  );
}
