# Changelog

All notable changes to **Synth Key** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.12.0] - 2026-08-22

### Added
- Light theme — a new light/dark toggle in the header. Each theme carries its
  own default palette; the toggle icon is a sun in dark mode and a moon in light
  mode, and the choice is remembered (with no flash on reload).

### Changed
- The interface was rebuilt on **shadcn/ui** + **Tailwind CSS**. Every control
  (buttons, switches, sliders, selects, dialogs, cards, tabs) now shares one
  consistent design system, themed live from the color settings.
- Mobile-first layout — the workspace collapses to a single column on phones,
  the instrument list and sound library move into a slide-out panel behind the
  header, tabs and controls use larger touch targets, and the keyboard scrolls
  horizontally on narrow screens.
- The audio engine and MIDI hot path are unchanged and still live outside React,
  so playback latency is unaffected by the new UI.

## [0.11.0] - 2026-08-19

### Added
- Scales & keys — pick a tonic and one of 12 scales/modes to highlight the scale
  on the keyboard (dot markers that coexist with the played/chord/target fills,
  tonic glowing) and see its diatonic triads with roman numerals; click a chord
  or "Play scale" to hear it.
- Ear training — interval and chord quizzes: the app plays a random sound
  (intervals melodic, chords harmonic), you guess from the options, with a
  running score and correct/wrong reveal.
- Reference — a collapsible cheat-sheet of the intervals and common chord
  formulas with their interval makeup.
- Transpose — shift the sounded pitch ±12 semitones (the keys you press stay
  the same).
- Amplitude envelope — attack, decay, sustain and release controls to reshape
  each note from plucks to pads.
- Effects — delay (echo) and chorus sends, alongside the existing reverb.
- Split / Layer — stack a second instrument on every key, or map it below a
  split point (e.g. bass in the left hand).
- WAV export — bounce a recording to a .wav audio file (rendered offline).

### Changed
- The workspace is now organized into **Play**, **Learn** and **Studio** tabs
  instead of one long stack of panels; each tab shows a badge with how many of
  its features are active, and the keyboard stays visible under every tab.

## [0.10.0] - 2026-08-19

### Added
- Interval detection — a new "Learn" toggle that names the intervals between the
  notes you hold. Two notes show the interval outright (e.g. "P5 · Perfect fifth");
  three or more break down into a **Stacked** row (interval between adjacent notes)
  and a **From root** row, so you can see exactly which intervals a chord is made of.
- Enable Chord detection and Interval detection together and the "Now Playing"
  panel shows the chord name alongside its interval breakdown at once.
- Practice interval hint — in song **practice** mode the keyboard legend shows
  the intervals between the notes you need to play next.
- Collapsible panels — Controls, Mixer, Metronome and Now Playing fold to just
  their title (remembered across sessions), so on narrow screens you can tuck
  away what you're not using.

### Changed
- The controls panel is grouped into **Visualize**, **Learn** and **Perform**
  sections so the toggles are easier to scan.
- "Detected chord" is now the unified **Now Playing** panel covering both chord
  and interval analysis.
- The Mixer and Metronome are now separate panels; the metronome starts
  collapsed and carries its on/off switch in its header.

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
