export interface Colors {
  accent: string; // primary UI accent
  played: string; // played-key highlight (--active)
  chord: string; // chord-lookup highlight (--chord)
  target: string; // song "to play" highlight (--target)
  noteWhite: string; // waterfall/song note color for white keys
  noteBlack: string; // waterfall/song note color for black keys
  bgBase: string; // app background (--bg)
  bgPanel: string; // panel background (--bg-panel)
  stageTop: string; // waterfall / song-roll gradient top (--stage-top)
  stageBottom: string; // waterfall / song-roll gradient bottom (--stage-bottom)
}

export interface Settings {
  colors: Colors;
  master: number;
  reverb: number;
  bpm: number;
  followMidi: boolean;
  visualizer: boolean;
  noteWaterfall: boolean;
  chordDetect: boolean;
  /** Analyze the intervals between held notes. */
  intervalDetect: boolean;
  chordLookup: boolean;
  /** Show the scale/key highlighting panel. */
  theory: boolean;
  /** Selected tonic for scale highlighting, e.g. "C". */
  theoryTonic: string;
  /** Selected scale/mode, e.g. "major". */
  theoryScale: string;
  /** Show the interval/chord reference cheat-sheet. */
  reference: boolean;
  /** Show the ear-training quiz. */
  earTraining: boolean;
  /** Keyboard transpose in semitones. */
  transpose: number;
  /** Amplitude envelope (seconds; sustain is a 0..1 level). */
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  /** Delay (echo) send amount, 0..1. */
  delay: number;
  /** Chorus send amount, 0..1. */
  chorus: number;
  recorderMode: boolean;
  songMode: boolean;
  /** Lowest visible octave (C of this octave is the bottom key). */
  lowOctave: number;
  /** Highest visible octave (C of this octave is the top key). */
  highOctave: number;
  /** On-screen key height in pixels (resizable by dragging). */
  keyHeight: number;
  /** Waterfall / song-roll scroll speed in px per second. */
  noteSpeed: number;
  /** Metronome time-signature numerator (beats per bar). */
  timeSigNum: number;
  /** Metronome time-signature denominator (note value: 1,2,4,8,16). */
  timeSigDen: number;
  /** Play (and accent) the downbeat. */
  accentStrong: boolean;
  /** Play the weak beats (everything but the downbeat). */
  playWeak: boolean;
}

export const DEFAULT_COLORS: Colors = {
  accent: '#6c8cff',
  played: '#ff9d4d',
  chord: '#3ecf8e',
  target: '#6c8cff',
  noteWhite: '#6c8cff',
  noteBlack: '#8b5cf6',
  bgBase: '#0e0f13',
  bgPanel: '#171922',
  stageTop: '#1a1f3d',
  stageBottom: '#10132a',
};

export const DEFAULT_SETTINGS: Settings = {
  colors: DEFAULT_COLORS,
  master: 0.9,
  reverb: 0,
  bpm: 120,
  followMidi: true,
  visualizer: false,
  noteWaterfall: false,
  chordDetect: false,
  intervalDetect: false,
  chordLookup: false,
  theory: false,
  theoryTonic: 'C',
  theoryScale: 'major',
  reference: false,
  earTraining: false,
  transpose: 0,
  attack: 0.01,
  decay: 0.1,
  sustain: 0.9,
  release: 0.3,
  delay: 0,
  chorus: 0,
  recorderMode: false,
  songMode: false,
  lowOctave: 2, // C2 .. C6 → the classic 49-key window
  highOctave: 6,
  keyHeight: 190,
  noteSpeed: 130,
  timeSigNum: 4,
  timeSigDen: 4,
  accentStrong: true,
  playWeak: true,
};

const KEY = 'synth-key:settings';

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      colors: { ...DEFAULT_COLORS, ...(parsed.colors ?? {}) },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(s: Settings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}

/** Push the CSS-variable colors onto :root so the whole UI recolors live. */
export function applyColors(c: Colors): void {
  const root = document.documentElement.style;
  root.setProperty('--accent', c.accent);
  root.setProperty('--active', c.played);
  root.setProperty('--chord', c.chord);
  root.setProperty('--target', c.target);
  root.setProperty('--note-white', c.noteWhite);
  root.setProperty('--note-black', c.noteBlack);
  root.setProperty('--bg', c.bgBase);
  root.setProperty('--bg-panel', c.bgPanel);
  root.setProperty('--stage-top', c.stageTop);
  root.setProperty('--stage-bottom', c.stageBottom);
}

/** Convert "#rrggbb" (or "#rgb") to an "r,g,b" string for canvas rgba(). */
export function hexToRgb(hex: string): string {
  const h = hex.replace('#', '').trim();
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `${r || 0},${g || 0},${b || 0}`;
}
