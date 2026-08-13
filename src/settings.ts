export interface Colors {
  accent: string; // primary UI accent
  played: string; // played-key highlight (--active)
  chord: string; // chord-lookup highlight (--chord)
  target: string; // song "to play" highlight (--target)
  noteWhite: string; // waterfall/song note color for white keys
  noteBlack: string; // waterfall/song note color for black keys
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
  chordLookup: boolean;
  recorderMode: boolean;
  songMode: boolean;
}

export const DEFAULT_COLORS: Colors = {
  accent: '#6c8cff',
  played: '#ff9d4d',
  chord: '#3ecf8e',
  target: '#6c8cff',
  noteWhite: '#6c8cff',
  noteBlack: '#8b5cf6',
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
  chordLookup: false,
  recorderMode: false,
  songMode: false,
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
