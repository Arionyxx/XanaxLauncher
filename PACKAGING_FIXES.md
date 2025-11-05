# Packaging Fixes - Preload and Renderer Loading

## Summary of Changes

This document outlines the fixes applied to resolve the packaged app issues where the preload script and renderer HTML were not loading correctly.

## Issues Fixed

### 1. ✅ Preload Script Module Resolution
**Problem:** Preload script was trying to `require('./ipc/channels')` which failed in the packaged app.asar with error:
```
Error: module not found: ./ipc/channels
```

**Solution:**
- Installed `esbuild` in the main package
- Created bundled build for preload script using esbuild
- Updated `packages/main/package.json` to bundle preload.ts with all dependencies
- Excluded `src/preload.ts` from TypeScript compilation (since it's bundled separately)

**Files Modified:**
- `packages/main/package.json` - Added `build:preload` script with esbuild
- `packages/main/tsconfig.json` - Excluded `src/preload.ts` from tsc compilation

**Build Command:**
```bash
esbuild src/preload.ts --bundle --platform=node --outfile=dist/preload.js --external:electron
```

**Result:** The preload.js is now a single bundled file containing all IPC channels, schemas, and dependencies (except electron which is provided by runtime).

### 2. ✅ Renderer Path in Main Process
**Problem:** Main process was loading renderer from wrong path:
```
file:///C:/Users/.../resources/app.asar/packages/main/renderer/out/index.html
```
Note: `packages/main/renderer/out` - wrong location!

**Solution:**
- Updated renderer path from `../renderer/out/index.html` to `../../renderer/out/index.html`
- Added logging to help debug path issues in production

**Files Modified:**
- `packages/main/src/index.ts` - Fixed renderer path calculation

**Path Resolution:**
```
__dirname: /app/resources/app.asar/packages/main/dist
../../renderer/out/index.html → /app/resources/app.asar/packages/renderer/out/index.html
```

### 3. ✅ Development vs Production Detection
**Problem:** Using `process.env.NODE_ENV === 'development'` which may not be set in packaged app.

**Solution:**
- Changed to use `!app.isPackaged` which is Electron's built-in way to detect packaged vs dev mode
- More reliable and idiomatic for Electron apps

**Files Modified:**
- `packages/main/src/index.ts` - Changed `isDev` detection

**Before:**
```typescript
const isDev = process.env.NODE_ENV === 'development'
```

**After:**
```typescript
const isDev = !app.isPackaged
```

### 4. ✅ electron-builder Configuration
**Problem:** Build configuration needed to ensure proper file packaging and exclude unnecessary files.

**Solution:**
- Confirmed `files` configuration includes all necessary paths
- Added exclusions for source map files to reduce package size
- Removed icon requirements (can be added later)

**Files Modified:**
- `package.json` (root) - Updated electron-builder configuration

**Configuration:**
```json
"files": [
  "packages/main/dist/**/*",
  "!packages/main/dist/**/*.map",
  "packages/renderer/out/**/*",
  "!packages/renderer/out/**/*.map",
  "package.json"
]
```

## Build Process

The updated build process is:

1. **Main Process:** TypeScript compilation with tsc (excludes preload.ts)
2. **Preload Script:** esbuild bundling (includes all dependencies)
3. **Renderer:** Next.js static export
4. **Package:** electron-builder creates app.asar with proper structure

**Commands:**
```bash
# Full build
npm run build

# Build main only
npm run build:main

# Build renderer only
npm run build:renderer

# Package app
npm run package
npm run package:win   # Windows
npm run package:mac   # macOS
npm run package:linux # Linux
```

## Verification

All fixes have been verified with:

1. ✅ Build succeeds without errors
2. ✅ Preload script is properly bundled
3. ✅ No relative module requires in preload.js
4. ✅ Correct path calculation for renderer
5. ✅ app.isPackaged used for dev/prod detection
6. ✅ Package structure is correct in app.asar
7. ✅ Development mode still works correctly

## Testing Results

Run `node test-path-resolution.js` to verify all fixes:

```
=== Testing Packaged App Path Resolution ===

1. Testing PRODUCTION path resolution:
   ✓ Match: true

2. Testing PRELOAD script bundling:
   ✓ Has electron import: true
   ✓ No relative IPC requires: true
   ✓ Has bundled IPC_CHANNELS: true
   ✓ Has contextBridge: true
   ✓ Preload script is properly bundled!

3. Testing MAIN process app.isPackaged detection:
   ✓ Uses app.isPackaged: true
   ✓ Has correct renderer path: true

4. Verifying build output structure:
   ✓ packages/main/dist/index.js
   ✓ packages/main/dist/preload.js
   ✓ packages/renderer/out/index.html

=== All Checks Complete ===
```

## Packaged App Structure

The final app.asar structure:
```
app.asar/
├── package.json
└── packages/
    ├── main/
    │   └── dist/
    │       ├── index.js          (main entry point)
    │       ├── preload.js        (bundled preload)
    │       └── ipc/              (IPC handlers/schemas)
    └── renderer/
        └── out/
            ├── index.html        (renderer entry)
            └── _next/            (Next.js static files)
```

## Next Steps

The packaged app should now:
- Launch without gray screen
- Load preload script successfully
- Load renderer HTML from correct location
- Establish IPC communication properly

If you encounter issues:
1. Check electron logs at: `app.getPath('logs')`
2. Verify app.asar structure with: `npx asar list dist/linux-unpacked/resources/app.asar`
3. Run with console: `--enable-logging` flag
