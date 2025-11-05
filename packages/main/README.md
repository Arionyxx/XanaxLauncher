# Main Process Package

This package contains the Electron main process code.

## Structure

- `src/index.ts` - Main entry point that creates the BrowserWindow and loads the Next.js renderer
- `src/preload.ts` - Preload script that exposes a minimal API to the renderer using contextBridge
- `electron-builder.yml` - Configuration for electron-builder packaging

## Development

The main process is automatically compiled and started when you run `npm run dev` from the root.

## Scripts

- `npm run typecheck` - Type check the TypeScript code
- `npm run build` - Compile TypeScript to JavaScript (output to `dist/`)
