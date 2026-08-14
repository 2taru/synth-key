# Changelog

All notable changes to **Synth Key** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.9.0] - 2026-08-14

### Added
- Fullscreen toolbar — a top bar in fullscreen to toggle every runtime control
  (visualizer, waterfall, chord detect/lookup, sustain, metronome, recording) and
  shift octaves, without leaving fullscreen. Collapses to a slim handle.
- Keyboard range — pick the lowest and highest octave (C0..C8, e.g. C1–C7) instead
  of a fixed 49-key window; the octave shift and Follow-MIDI now slide that range.
- Drag-to-resize keys — a handle above the keyboard resizes the on-screen key
  height by dragging (also a slider in Settings); persisted.
- Metronome time signature — numerator/denominator with 4/4, 3/4, 2/4, 6/8 presets
  and custom values, independent Strong-beat and Weak-beats playback toggles, and a
  live beat indicator.
- Background customization — App, Panel, and waterfall/song-roll gradient (top &
  bottom) colors in Settings, applied live.
- Note speed — adjustable waterfall / song-roll scroll speed in Settings.

### Changed
- Settings "Reset to defaults" now also restores key height and note speed.
- The Mixer panel is now "Mixer & metronome" and hosts the expanded metronome
  controls.

## [0.8.0] - 2026-08-13

### Added
- Settings menu (⚙ in the header) to customize the app's colors — accent, played
  keys, to-play keys, chord keys, and the waterfall/song note colors — applied
  live across the UI and canvases.
- Fullscreen mode for the stage (⛶): the note waterfall / song roll grows to fill
  the screen with the keyboard anchored at the bottom.
- Settings persistence — colors, mixer levels, tempo and display toggles are saved
  to `localStorage` and restored on next visit.

## [0.7.0] - 2026-08-13

### Added
- Practice mode — in Song mode, falling notes now wait at the keyboard line until
  you play the right key(s), then advance (Synthesia "wait" mode).
- Key highlighting — the keys you need to play light up in a distinct color during
  Song mode (the notes currently sounding in auto-play, or the next step to hit in
  practice).

### Changed
- Recording is now its own toggle-revealed feature ("Recorder"), separate from
  Song mode; each has its own panel.

## [0.6.0] - 2026-08-13

### Added
- Recording & playback — capture what you play (notes, timing, velocity), play it
  back through the engine, and export it as a Standard MIDI (`.mid`) file.
- Song mode — load a `.mid` file and watch its notes fall toward the keyboard
  (Synthesia-style) while it plays; the octave window auto-centers on the song.
- Mixer — master volume and a reverb send (procedural impulse response).
- Metronome & tempo — a click track with adjustable BPM.

## [0.5.0] - 2026-08-13

### Added
- Note waterfall — a live "piano roll" visualizer: every note played rises from
  the keyboard line, its length tracking how long it's held and its brightness
  its velocity. Toggle it on with "Note waterfall".
- Velocity sensitivity for the on-screen keyboard: clicking lower on a key plays
  louder (and pen/touch use real pressure), matching how MIDI velocity already
  worked.

### Changed
- Note events now support multiple subscribers internally, so the visualizer,
  chord detection, octave-follow and waterfall can all react independently.

## [0.4.0] - 2026-08-13

### Added
- "Chord lookup" toggle — the Chord Visualizer panel now shows only when enabled.
- "Follow MIDI" option — the on-screen octave window automatically tracks the
  notes played on a MIDI keyboard, shifting to keep them in view. Turn it off to
  shift octaves by hand.
- The changelog is now viewable in-app from the footer version button.

### Changed
- The Chord Visualizer panel is hidden by default; enable it with "Chord lookup".

## [0.3.1] - 2026-08-13

### Added
- This changelog.

### Fixed
- The "Now Playing" chord-detection panel now keeps a fixed height, so the chord
  visualizer and keyboard below no longer jump up and down while you play.

## [0.3.0] - 2026-08-13

### Added
- Sustain pedal support (MIDI CC64): held keys keep sounding until the pedal
  lifts. Includes an on-screen "Sustain" toggle for playing without a pedal.
- Modulation wheel support (MIDI CC1): adds vibrato via a shared LFO routed into
  each note's detune, with an on-screen "Modulation" slider.

## [0.2.0] - 2026-08-13

### Added
- Rebranded to **Synth Key** with a new minimalist logo and favicon.
- Sound Library: all 128 General MIDI instruments grouped into the 16 GM families,
  searchable, click-to-load-and-activate.
- Octave shift for the 49-key keyboard window (C0 … C9).
- Pitch bend (MIDI pitch wheel, ±2 semitones) applied to every sounding note,
  with a live on-screen meter.
- Chord detection: names the chord currently being played, behind its own toggle.

### Changed
- Chord lookup now re-maps its highlighted notes into the visible window when the
  octave is shifted.

## [0.1.0] - 2026-08-13

### Added
- Low-latency audio engine built on `soundfont-player`, kept outside React so MIDI
  callbacks trigger sound synchronously.
- Web MIDI input (note on/off) driving the engine directly.
- Soundfont manager: load instruments by name, switch the active instrument, and
  delete custom ones; the default `acoustic_grand_piano` loads on mount and cannot
  be deleted.
- Optional 49-key keyboard visualizer that highlights played keys.
- Chord visualizer: type any chord (parsed with `tonal`) and highlight its notes.

[0.8.0]: #080---2026-08-13
[0.7.0]: #070---2026-08-13
[0.6.0]: #060---2026-08-13
[0.5.0]: #050---2026-08-13
[0.4.0]: #040---2026-08-13
[0.3.1]: #031---2026-08-13
[0.3.0]: #030---2026-08-13
[0.2.0]: #020---2026-08-13
[0.1.0]: #010---2026-08-13
