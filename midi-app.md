# Project: Low-Latency Web MIDI Synthesizer

## Role & Tech Stack
You are an expert Audio Software Engineer and Frontend Developer. 
Create a React + Vite application (JavaScript/TypeScript). Use `soundfont-player` for audio generation and the native Web MIDI API for input. The UI should be styled minimally with CSS or Tailwind.

## Architecture Rule: The Latency Constraint
The absolute highest priority is zero-latency audio playback. Audio triggering must happen synchronously inside the MIDI event listener callbacks. Do NOT use React state (`useState` or `useReducer`) to track playing notes unless the Visualization mode (Step 3) is explicitly enabled, as React re-renders will introduce unacceptable audio latency.

Please implement the application in the following distinct, sequential steps:

### Step 1: Core Audio Engine & Web MIDI
- Initialize the Web Audio `AudioContext` with `{ latencyHint: 'interactive' }`.
- Request Web MIDI access and listen for `noteon` and `noteoff` messages from any connected MIDI keyboard.
- Set up a default, non-deletable instrument: `acoustic_grand_piano`. Load this automatically on mount using the open `gleitz/midi-js-soundfonts` repository.
- Ensure that pressing a key on the physical MIDI keyboard triggers the sound instantly. 

### Step 2: Soundfont Manager
- Create a UI sidebar or panel to manage instruments. 
- The `acoustic_grand_piano` must always be present and cannot be deleted.
- Provide a text input and a "Load Instrument" button. The user should be able to type a standard MIDI instrument name (e.g., `electric_guitar_clean`, `marimba`, `synth_drum`) to fetch it from the Gleitz Soundfont URL.
- Maintain a list of loaded custom instruments. Allow the user to switch the active instrument by clicking on it.
- Add a "Delete" button next to custom instruments to remove them from memory and the UI list.

### Step 3: Optional Keyboard Visualization
- Build a visual Piano Keyboard component UI (49 keys).
- Add a global UI toggle switch: "Enable Visualizer (May increase latency)".
- **When OFF:** MIDI events trigger audio directly. The UI keyboard does not react.
- **When ON:** MIDI events trigger audio AND update a React state (e.g., `activeKeys`) to highlight the corresponding keys on the visual keyboard component.

### Step 4: Advanced Chord Visualizer
- Implement a feature to visualize any piano chord by entering its text name.
- Add a UI section with a text input field (e.g., "Enter Chord: Cmaj7") and a "Show Chord" button.
- You MUST use a robust music theory library like `tonal` (specifically `@tonaljs/chord` and `@tonaljs/core`) to parse the user's input. The app must support absolutely any level of chord complexity (e.g., Am, Cmaj7, G7b9, F#m11b5).
- When a valid chord name is entered, use the library to extract the component notes.
- Map these extracted notes to a logical starting octave (e.g., starting around C3 or C4) so they fit nicely onto the 49-key visual keyboard.
- Highlight these specific keys on the Piano Keyboard component (from Step 3). Use a distinct highlight color (e.g., blue or green) to visually differentiate chord-lookup highlights from active MIDI key presses.
- Add a "Clear Chord" button to remove the highlight.