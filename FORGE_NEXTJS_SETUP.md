# Electron Forge + Next.js Setup

This project uses Electron Forge with Next.js as the renderer. The configuration is set up to avoid port conflicts between Forge's webpack dev server and Next.js.

## Configuration

### Development Mode

- **Next.js Dev Server**: Runs on port 3000
- **Forge Renderer Dev Server**: Runs on port 3001 (only for preload script bundling)
- **Forge Logger**: Runs on port 9001

The Forge webpack plugin is configured with:
- `port: 3001` - Prevents conflict with Next.js on port 3000
- `loggerPort: 9001` - Separate port for webpack logs
- Renderer entryPoints with only `preload` (no html) - Bundles the preload script without creating a full renderer page

### How It Works

1. **Development Workflow**:
   ```bash
   npm run dev
   ```
   This command uses `concurrently` to:
   - Start Next.js dev server on port 3000
   - Wait for Next.js to be ready (`wait-on http://localhost:3000`)
   - Start Electron Forge (bundles main process and preload, launches Electron)

2. **Main Process**:
   - Bundled by Forge's webpack plugin
   - Loads Next.js from `http://localhost:3000` in dev mode
   - Uses `MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY` for the preload script path

3. **Preload Script**:
   - Bundled by Forge's webpack plugin via renderer entryPoints
   - Output: `.webpack/renderer/main_window/preload.js`

4. **Renderer (Next.js)**:
   - Runs independently as a Next.js dev server
   - Not bundled by Forge during development
   - Provides hot reload and Next.js features

### Production Build

For production builds:

```bash
# Build Next.js
npm run build

# Package Electron app
npm run package

# Or create installers
npm run make
```

The packaged app will:
- Include the webpack-bundled main process and preload script in `.webpack/`
- Still load from `http://localhost:3000` (Next.js must be running separately)
- For a fully standalone app, you'd need to bundle Next.js build output and serve it locally

### Key Configuration Files

- **forge.config.js**: Electron Forge configuration with webpack plugin
  - Main config: Bundles main process (`packages/main/src/index.ts`)
  - Renderer config: Only bundles preload script (no HTML/renderer page)
  - Ports: 3001 (renderer), 9001 (logger)

- **packages/main/src/index.ts**: Main process entry point
  - Loads `http://localhost:3000` in both dev and production
  - Uses `MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY` for preload path

### Port Reference

| Service | Port | Purpose |
|---------|------|---------|
| Next.js Dev Server | 3000 | Renderer application |
| Forge Renderer Dev Server | 3001 | Preload script bundling only |
| Forge Logger | 9001 | Webpack build logs |

## Troubleshooting

### Port Conflicts

If you see `EADDRINUSE` errors:
- Ensure no other process is using port 3000, 3001, or 9001
- Kill any running Next.js or Electron processes
- Restart the dev command

### Preload Script Not Loading

If the preload script doesn't load:
- Check the Forge webpack build output for errors
- Verify `MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY` is correctly defined
- Check the logs: the main process logs the preload path on startup

### Hot Reload

- **Next.js hot reload**: Works automatically (port 3000)
- **Main process hot reload**: Type `rs` in the terminal where Forge is running
- **Preload script changes**: Requires restarting Electron (type `rs`)
