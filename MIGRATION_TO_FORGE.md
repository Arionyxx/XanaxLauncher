# Migration to Electron Forge

This document outlines the migration from manual Electron setup with electron-builder to Electron Forge.

## Summary of Changes

### What Changed

1. **Build System**: Migrated from manual TypeScript compilation to Electron Forge with Webpack plugin
2. **Packaging**: Migrated from electron-builder to Electron Forge makers
3. **Development Workflow**: Simplified dev workflow using Forge's built-in dev server
4. **Configuration**: Replaced `electron-builder.yml` with `forge.config.js`
5. **Scripts**: Updated npm scripts to use Forge commands
6. **CI/CD**: Updated GitHub Actions workflows to use npm and Forge

### Why We Migrated

**Problems Solved:**

- ✅ Fixed TypeScript workspace resolution issues
- ✅ Eliminated complex manual script orchestration (concurrently, wait-on)
- ✅ Simplified build and packaging process
- ✅ Better monorepo support out of the box
- ✅ Integrated Webpack bundling for main and preload processes
- ✅ Improved development experience with hot reload

## New Architecture

### Configuration File: `forge.config.js`

Located at project root, this file configures:

- **packagerConfig**: App metadata, icons, ignore patterns
- **makers**: Squirrel for Windows, ZIP for cross-platform
- **publishers**: GitHub releases integration
- **plugins**: Webpack plugin for main and preload bundling

### Main Process Changes

The main process (`packages/main/src/index.ts`) now uses Webpack-provided globals:

```typescript
declare const MAIN_WINDOW_WEBPACK_ENTRY: string
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string

// Use these in BrowserWindow config
webPreferences: {
  preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
  // ...
}
```

### Webpack Bundling

Both main and preload processes are bundled with Webpack:

- **Loader**: ts-loader with transpileOnly mode
- **Type Checking**: fork-ts-checker-webpack-plugin runs in parallel
- **Output**: `.webpack/` directory in development
- **Production**: Bundled into `out/` directory

## New Commands

### Development

```bash
npm run dev        # or npm start
```

Starts Next.js dev server and Electron with Forge

### Building

```bash
npm run build      # Build Next.js renderer
npm run package    # Package app with Forge
npm run make       # Create installers
```

### Publishing

```bash
npm run publish    # Publish to GitHub releases
```

## Output Structure

### Development

- `.webpack/main/` - Bundled main process
- `.webpack/renderer/main_window/` - Preload bundle
- `packages/renderer/.next/` - Next.js build

### Production

- `out/Media Manager-win32-x64/` - Unpacked application
- `out/make/squirrel.windows/x64/` - Windows installer
  - `Media-Manager-Setup-1.0.0.exe` - Installer
  - `RELEASES` - Update metadata
  - `*.nupkg` - Update packages

## Migration Checklist

- [x] Install Electron Forge packages
- [x] Create forge.config.js
- [x] Configure Webpack plugin with TypeScript support
- [x] Update main process to use Webpack globals
- [x] Update package.json scripts
- [x] Add .webpack/ and out/ to .gitignore
- [x] Update README.md
- [x] Update DEPLOYMENT.md
- [x] Update CI/CD workflows (.github/workflows/)
- [x] Create build directory with placeholder icons
- [x] Test dev workflow
- [x] Test build workflow (if possible in environment)

## Breaking Changes

None for end users. The application functionality remains identical.

### For Developers

- Must use `npm run dev` instead of the old `npm run electron:dev`
- Build output is now in `out/` instead of `dist/`
- Installer format changed from NSIS to Squirrel.Windows
- Update metadata file changed from `latest.yml` to `RELEASES`

## Dependencies Added

```json
{
  "@electron-forge/cli": "^7.10.2",
  "@electron-forge/maker-squirrel": "^7.10.2",
  "@electron-forge/maker-zip": "^7.10.2",
  "@electron-forge/plugin-webpack": "^7.10.2",
  "@electron-forge/publisher-github": "^7.10.2",
  "ts-loader": "^9.5.4",
  "fork-ts-checker-webpack-plugin": "^9.1.0"
}
```

### Moved to Root

The following were moved from `packages/main/package.json` to root:

- electron
- electron-builder (kept for compatibility)
- electron-log
- electron-updater
- zod

## Testing

### What to Test

1. **Development Mode**

   ```bash
   npm run dev
   ```

   - [ ] Electron window opens
   - [ ] Next.js dev server loads
   - [ ] Hot reload works
   - [ ] IPC communication works
   - [ ] TypeScript compilation works

2. **Production Build**

   ```bash
   npm run make
   ```

   - [ ] Build completes without errors
   - [ ] Installer is created
   - [ ] Installer runs
   - [ ] App launches from installed location
   - [ ] All features work

3. **Auto-Updates**
   - [ ] Update check works
   - [ ] Update download works
   - [ ] Update installation works

## Troubleshooting

### TypeScript Errors During Build

**Issue**: Webpack fails to compile TypeScript

**Solution**:

- Check `forge.config.js` has correct paths to `tsconfig.json`
- Ensure `ts-loader` is configured correctly
- Run `npm run typecheck` to see TypeScript errors directly

### Icons Missing

**Issue**: Build fails due to missing icons

**Solution**:

- Create `packages/main/build/icon.ico`
- Create `packages/main/build/installerHeader.bmp`
- Or update `forge.config.js` to point to correct icon paths

### Webpack Bundle Too Large

**Issue**: Bundle size is too large

**Solution**:

- Check `ignore` patterns in `forge.config.js`
- Ensure `node_modules` and build artifacts are excluded
- Use `asar: true` for better compression
- Analyze bundle with webpack-bundle-analyzer

### Dev Server Not Starting

**Issue**: `npm run dev` fails

**Solution**:

- Check if port 3000 is available
- Ensure Next.js dev server starts first
- Check `wait-on` is working correctly
- Look for errors in terminal output

## Resources

- [Electron Forge Documentation](https://www.electronforge.io/)
- [Electron Forge Webpack Plugin](https://www.electronforge.io/config/plugins/webpack)
- [Electron Forge Makers](https://www.electronforge.io/config/makers)
- [Squirrel.Windows](https://github.com/Squirrel/Squirrel.Windows)

## Rollback Plan

If issues arise, you can rollback to the previous setup:

1. Check out the previous commit before migration
2. Or manually revert changes:
   - Remove forge.config.js
   - Restore old package.json scripts
   - Remove Forge dependencies
   - Restore electron-builder workflow

## Support

For issues or questions about this migration:

- Check this document first
- Review Electron Forge documentation
- Check GitHub Issues for similar problems
- Create a new issue with "Electron Forge" label
