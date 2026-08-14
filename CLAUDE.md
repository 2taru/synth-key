# CLAUDE.md

Guidance for working in this repository.

## What this is

**Synth Key** — a low-latency, browser-based MIDI synthesizer. Play a connected
MIDI keyboard (or the on-screen one) through General MIDI soundfonts, with a
sound library, chord tools, a note waterfall, recording, and song/practice mode.

Stack: **React 18 + Vite 6 + TypeScript**, [`soundfont-player`](https://github.com/danigb/soundfont-player)
for audio, the native **Web MIDI API** for input, [`tonal`](https://github.com/tonaljs/tonal)
for chord theory, and [`@tonejs/midi`](https://github.com/Tonejs/Midi) for `.mid`
import/export. Package manager is **pnpm**.

## Commands

```bash
pnpm install
pnpm dev        # Vite dev server (default http://localhost:5173)
pnpm build      # tsc -b && vite build  → dist/
pnpm preview    # serve the production build
pnpm typecheck  # NOTE: currently fails on a project-reference quirk (see below)
```

- **Type-check with `pnpm build` (or `npx tsc -b`), not `pnpm typecheck`.** The
  `typecheck` script runs `tsc -b --noEmit`, which errors with TS6310 because a
  referenced project (`tsconfig.node.json`) can't disable emit. `tsc -b` is clean.
- Web MIDI needs a Chromium-based browser (Chrome/Edge/Opera). Firefox/Safari
  show "Web MIDI not supported"; the on-screen keyboard still works.

## Architecture — the one rule that matters

**Audio lives outside React.** Zero-latency playback is the top priority, so the
sound engine (`src/audio/audioEngine.ts`) is a plain class held in a `useRef`,
never React state. MIDI messages call `engine.noteOn/noteOff` **synchronously**
inside the Web MIDI callback (`src/midi/useMidi.ts`) — no re-render between key
press and sound. Pitch bend goes straight to each note's `AudioBufferSourceNode.detune`.

React only *observes* the engine through optional callbacks (`onNote`, `onBend`,
`onMod`, `onSustain`), and `onNote` listeners are attached **only while a feature
needs them** (visualizer, chord-detect, waterfall, MIDI-follow). Emitting to an
empty listener set is effectively free, so the note-trigger hot path touches no
React state when those features are off. **Do not move note triggering into React
state or effects.**

The same "class held in a ref, React observes it" pattern is used for the studio
helpers, all constructed once in `App.tsx`: `Metronome`, `Recorder`, `NotePlayer`
(recording playback), and `SongController` (song/practice mode).

## Layout

```
src/
  audio/audioEngine.ts   # sound engine + master/reverb bus + pitch bend (outside React)
  audio/notes.ts         # MIDI <-> note-name helpers + keyboard geometry (keyGeometry)
  audio/metronome.ts     # look-ahead click track: time signature, strong/weak beats
  audio/recorder.ts      # records engine note events into a sequence
  audio/notePlayer.ts    # schedules a sequence back through the engine
  audio/songController.ts# song/practice transport (targets, wait-for-key)
  audio/sequence.ts      # note-sequence model + event pairing
  midi/useMidi.ts        # Web MIDI subscription, drives the engine directly
  music/chords.ts        # chord symbol <-> notes (tonal)
  music/gmInstruments.ts # the 128 GM instruments grouped by family
  music/midiFile.ts      # .mid import/export (@tonejs/midi)
  components/            # PianoKeyboard, NoteWaterfall, SongRoll, MixerPanel,
                         #   RecorderPanel, SongPanel, SettingsModal,
                         #   FullscreenToolbar, OctaveControl, ...
  settings.ts           # persisted Settings + Colors, applyColors(), hexToRgb()
  changelog.ts          # parses CHANGELOG.md into structured entries
  App.tsx               # all state wiring
```

## Conventions & patterns

- **Settings** are a single `Settings` object persisted to `localStorage`
  (`src/settings.ts`). To add a setting: extend the `Settings`/`Colors`
  interface, add a default to `DEFAULT_SETTINGS`/`DEFAULT_COLORS`, add state in
  `App.tsx` seeded from `loadSettings()`, and include it in the `saveSettings`
  effect's payload **and** its dependency array. `loadSettings` merges over
  defaults, so older stored blobs stay forward-compatible.
- **Theming is CSS variables.** `applyColors()` pushes colors onto
  `document.documentElement` (`--accent`, `--active`, `--bg`, `--stage-top`, …).
  Canvases (`NoteWaterfall`, `SongRoll`) `clearRect` to transparent so the CSS
  gradient shows through; note colors are passed in as props and turned into
  `rgba()` via `hexToRgb`. Non-color live values use CSS vars too (`--key-height`).
- **Keyboard window** is always C-aligned. `App.tsx` holds `low`/`high` as MIDI
  numbers derived from the low/high **octave** selectors (C0..C8). `keyGeometry`
  and `PianoKeyboard` already handle any `[low, high]` range — keep them range-agnostic.
- **Canvas animation loops** (`NoteWaterfall`, `SongRoll`) run in an effect with
  an empty dep array; live values that change (speed, colors, geometry) are read
  through refs updated in their own effects, so the RAF loop never re-subscribes.
- **CHANGELOG.md is the source of truth for the version.** `changelog.ts` parses
  it (Keep a Changelog format: `## [x.y.z] - date`, `### Section`, `- item`) and
  `APP_VERSION` is the first entry's version, shown in the footer. When shipping a
  feature, add a new top entry; keep `package.json` `version` in sync.

## Commit messages

Conventional Commits, English, imperative. Types: `feat:`, `fix:`, `style:`,
`refactor:`, `test:`, `docs:`, `chore:`. One theme per commit — don't lump
unrelated changes together.
