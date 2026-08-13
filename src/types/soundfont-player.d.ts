// Minimal ambient declaration for `soundfont-player`.
// The package ships no bundled types; we only use `instrument()`, so we keep the
// surface small and cast the returned player to our own `SfPlayer` interface in
// the audio engine.
declare module 'soundfont-player' {
  interface SoundfontPlayer {
    instrument(
      ac: BaseAudioContext,
      name: string,
      options?: Record<string, unknown>,
    ): Promise<unknown>;
  }
  const Soundfont: SoundfontPlayer;
  export default Soundfont;
}
