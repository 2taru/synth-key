# Changelog

All notable changes to **Synth Key** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[0.4.0]: #040---2026-08-13
[0.3.1]: #031---2026-08-13
[0.3.0]: #030---2026-08-13
[0.2.0]: #020---2026-08-13
[0.1.0]: #010---2026-08-13
