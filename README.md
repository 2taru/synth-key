<div align="center">

<img src="public/favicon.svg" width="72" alt="Synth Key logo" />

# Synth Key

**Play your MIDI keyboard in the browser — zero-latency, 128 sounds, chords, songs**

![version](https://img.shields.io/badge/version-0.13.0-a855f7?style=flat-square)
![React](https://img.shields.io/badge/React-20232a?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Web MIDI](https://img.shields.io/badge/Web%20MIDI-API-111111?style=flat-square&logo=midi&logoColor=white)

</div>

A low-latency, browser-based MIDI synthesizer. Play a connected MIDI keyboard (or
the on-screen one) through General MIDI soundfonts, browse 128 sounds, bend pitch,
shift octaves, and both look up and detect chords on a 49-key keyboard.

Built with **React + Vite + TypeScript**, [`soundfont-player`](https://github.com/danigb/soundfont-player)
for audio, the native **Web MIDI API** for input, and [`tonal`](https://github.com/tonaljs/tonal)
for chord theory.

## Getting started

```bash
pnpm install
pnpm dev
```

Then open the printed URL (default http://localhost:5173) in a Web MIDI–capable
browser (Chrome/Edge). Click anywhere once to enable audio, connect a MIDI
keyboard, and play.

Other scripts:

```bash
pnpm build      # type-check + production build
pnpm preview    # serve the production build
npx tsc -b      # type-check only (`pnpm typecheck` currently trips on TS6310)
```

## How it works

### Latency: audio lives outside React

The absolute priority is zero-latency playback, so the sound engine
([`src/audio/audioEngine.ts`](src/audio/audioEngine.ts)) is a plain class held in
a `useRef` — **not** React state. MIDI messages call `engine.noteOn/noteOff`
**synchronously** inside the Web MIDI callback
([`src/midi/useMidi.ts`](src/midi/useMidi.ts)), with no re-render between key press
and sound. Pitch bend is applied the same way, straight to each note's
`AudioBufferSourceNode.detune`.

React only observes the engine through optional callbacks (`onNote`, `onBend`,
`onMod`, `onSustain`), and `onNote` is wired up **only while the Visualizer or
Chord-detection feature is ON**. With both OFF, no React state is touched on the
note-trigger hot path at all.

## Features

- **Core audio engine & Web MIDI** — `AudioContext` created with
  `{ latencyHint: 'interactive' }`; `acoustic_grand_piano` loads on mount and is
  non-deletable. Listens to `noteon` / `noteoff` / pitch-bend from any device.
- **Sound Library** — all 128 General MIDI instruments, grouped into the 16 GM
  families and searchable. Click any sound to load it (from the
  [gleitz/midi-js-soundfonts](https://github.com/gleitz/midi-js-soundfonts)
  FluidR3_GM bank) and make it active.
- **Instrument manager** — load by name too, switch the active instrument, and
  delete loaded custom ones (the default piano stays).
- **Keyboard range & octave shift** — pick the lowest and highest octave shown
  (C0 … C8, e.g. C1–C7), shift the whole window up/down an octave, or let it
  Follow the octave you play on a MIDI keyboard.
- **Resizable keys** — drag the handle above the keyboard (or the Settings slider)
  to set the on-screen key height.
- **Pitch bend** — MIDI pitch-wheel bends every sounding note (±2 semitones) with
  a live on-screen meter.
- **Sustain pedal (CC64)** — holds released notes until the pedal lifts; also an
  on-screen toggle for playing without a pedal.
- **Modulation wheel (CC1)** — adds vibrato (a shared LFO into each note's detune),
  reflected by an on-screen slider that also drives it by hand.
- **Visualizer** — toggle to highlight played keys in real time.
- **Note waterfall** — a live piano-roll: played notes rise from the keyboard,
  their length tracking hold time and brightness tracking velocity.
- **Velocity** — MIDI note velocity drives loudness; on-screen, clicking lower on
  a key (or pen/touch pressure) plays louder.
- **Chord detection** — a separate toggle that names the chord you're playing
  (e.g. play C-E-G-B → "Cmaj7"), using `tonal`'s chord detection.
- **Chord lookup** — type any chord (`Am`, `Cmaj7`, `G7b9`, `F#m11b5`) and see its
  notes highlighted in a distinct color; the highlight follows the octave shift.
- **Mixer** — master volume and a reverb send.
- **Metronome & tempo** — click track with adjustable BPM, a time signature
  (4/4, 3/4, 2/4, 6/8 or custom), independent strong- and weak-beat playback, and
  a live beat indicator.
- **Recording** — record what you play and export it as a `.mid` file, or play it back.
- **Song mode** — load a `.mid` file and watch its notes fall to the keyboard
  (Synthesia-style) as it plays, with the keys to play highlighted. **Practice
  mode** waits for you to play each note before advancing.
- **Fullscreen** — expand the waterfall / song roll to fill the screen (⛶), with a
  collapsible top toolbar exposing every runtime control (including recording).
- **Settings** — a ⚙ menu to customize the app's colors and backgrounds, key
  height and note speed; all settings persist to `localStorage`.

## Project layout

```
src/
  audio/audioEngine.ts     # sound engine + master/reverb bus + pitch bend, outside React
  audio/notes.ts           # MIDI <-> note name helpers, keyboard geometry
  audio/metronome.ts       # look-ahead click track
  audio/recorder.ts        # records engine note events into a sequence
  audio/notePlayer.ts      # schedules a sequence back through the engine
  audio/sequence.ts        # note-sequence model + event pairing
  midi/useMidi.ts          # Web MIDI subscription, drives the engine directly
  music/chords.ts          # chord symbol <-> notes (tonal)
  music/gmInstruments.ts   # the 128 GM instruments grouped by family
  music/midiFile.ts        # .mid import/export (@tonejs/midi)
  components/               # Logo, PianoKeyboard, NoteWaterfall, SongRoll,
                            #   SoundLibrary, InstrumentPanel, ChordPanel,
                            #   DetectedChord, MixerPanel, TransportPanel, Changelog, …
  App.tsx                  # wiring & state
```

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for the version history.

## Notes

- Web MIDI requires a Chromium-based browser (Chrome/Edge/Opera). Firefox/Safari
  will show "Web MIDI not supported"; the on-screen keyboard still works.
- Browsers start the `AudioContext` suspended — the first click/keypress resumes it.
- Pitch bend uses the GM-default ±2 semitone range.
