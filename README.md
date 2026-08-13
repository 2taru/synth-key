# Synth Key

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
pnpm typecheck  # type-check only
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
- **Octave shift** — move the 49-key window up/down an octave (C0 … C9).
- **Pitch bend** — MIDI pitch-wheel bends every sounding note (±2 semitones) with
  a live on-screen meter.
- **Sustain pedal (CC64)** — holds released notes until the pedal lifts; also an
  on-screen toggle for playing without a pedal.
- **Modulation wheel (CC1)** — adds vibrato (a shared LFO into each note's detune),
  reflected by an on-screen slider that also drives it by hand.
- **Visualizer** — toggle to highlight played keys in real time.
- **Chord detection** — a separate toggle that names the chord you're playing
  (e.g. play C-E-G-B → "Cmaj7"), using `tonal`'s chord detection.
- **Chord lookup** — type any chord (`Am`, `Cmaj7`, `G7b9`, `F#m11b5`) and see its
  notes highlighted in a distinct color; the highlight follows the octave shift.

## Project layout

```
src/
  audio/audioEngine.ts     # sound engine (soundfont-player) + pitch bend, outside React
  audio/notes.ts           # MIDI number <-> note name helpers
  midi/useMidi.ts          # Web MIDI subscription, drives the engine directly
  music/chords.ts          # chord symbol -> MIDI notes, and note-set -> chord (tonal)
  music/gmInstruments.ts   # the 128 GM instruments grouped by family
  components/               # Logo, PianoKeyboard, SoundLibrary, InstrumentPanel,
                            #   ChordPanel, DetectedChord, OctaveControl,
                            #   PitchBendMeter, ModulationSlider, Toggle
  App.tsx                  # wiring & state
```

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for the version history.

## Notes

- Web MIDI requires a Chromium-based browser (Chrome/Edge/Opera). Firefox/Safari
  will show "Web MIDI not supported"; the on-screen keyboard still works.
- Browsers start the `AudioContext` suspended — the first click/keypress resumes it.
- Pitch bend uses the GM-default ±2 semitone range.
