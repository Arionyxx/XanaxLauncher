# Main Process Package

This package contains the Electron main process code.

## Structure

- `src/index.ts` - Main entry point that creates the BrowserWindow and loads the Next.js renderer
- `src/preload.ts` - Preload script that exposes a secure API to the renderer using contextBridge
- `src/ipc/` - IPC channel definitions, schemas, and handlers
- `build/` - Build resources (icons, installer assets)

## Build System

The main process is bundled using **Electron Forge** with the Webpack plugin:

- TypeScript compilation via ts-loader
- Type checking via fork-ts-checker-webpack-plugin
- Output to `.webpack/` in development
- Packaged to `out/` for production

Configuration is in `forge.config.js` at the project root.

## Development

The main process is automatically bundled and started when you run `npm run dev` or `npm start` from the root.

## Scripts

- `npm run typecheck` - Type check the TypeScript code (from this directory)
