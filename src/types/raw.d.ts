// Vite's `?raw` imports return the file contents as a string. `vite/client`
// already declares this, but we spell out the Markdown case too so the changelog
// import resolves regardless of the client-types version.
declare module '*.md?raw' {
  const content: string;
  export default content;
}
