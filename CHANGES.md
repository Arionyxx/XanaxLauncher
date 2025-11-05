# Changes Made to Fix Packaged App Issues

## Summary
Fixed the packaged app failing to launch with gray screen and console errors related to preload script module resolution and incorrect renderer path.

## Files Modified

### 1. `packages/main/package.json`
**Changes:**
- Added esbuild as devDependency
- Split build script into `build:main` (tsc) and `build:preload` (esbuild)
- Preload script is now bundled with all dependencies

**Reason:** The preload script needs to be bundled to include all IPC channel definitions and schemas. Without bundling, the `require('./ipc/channels')` fails in the packaged app.asar.

### 2. `packages/main/tsconfig.json`
**Changes:**
- Excluded `src/preload.ts` from TypeScript compilation

**Reason:** The preload script is now built separately with esbuild, so we don't want TypeScript to compile it.

### 3. `packages/main/src/index.ts`
**Changes:**
- Changed `isDev` detection from `process.env.NODE_ENV === 'development'` to `!app.isPackaged`
- Fixed renderer path from `../renderer/out/index.html` to `../../renderer/out/index.html`
- Added logging for `isPackaged` and `__dirname` for debugging

**Reason:** 
- `app.isPackaged` is the correct way to detect packaged vs development mode in Electron
- The renderer path was incorrect - needed to go up two levels from `packages/main/dist/` to reach `packages/renderer/out/`

### 4. `package.json` (root)
**Changes:**
- Updated electron-builder `files` configuration to exclude source maps
- Removed icon requirements (can be added later)

**Reason:** Reduce package size and avoid build errors for missing icons during development.

## Technical Details

### Preload Script Bundling
Before:
```
packages/main/dist/
├── preload.js (tries to require('./ipc/channels') - FAILS in asar)
└── ipc/
    ├── channels.js
    └── schemas.js
```

After:
```
packages/main/dist/
├── preload.js (self-contained bundle with all dependencies)
└── ipc/
    ├── channels.js
    └── schemas.js
```

The preload.js now contains all IPC channels and schemas inline, with only `electron` as external dependency.

### Path Resolution
Before:
```
__dirname: /app/resources/app.asar/packages/main/dist
../renderer/out/index.html → /app/resources/app.asar/packages/main/renderer/out/index.html (WRONG)
```

After:
```
__dirname: /app/resources/app.asar/packages/main/dist
../../renderer/out/index.html → /app/resources/app.asar/packages/renderer/out/index.html (CORRECT)
```

### Dev Mode Detection
Before: `process.env.NODE_ENV === 'development'` (unreliable)
After: `!app.isPackaged` (official Electron API)

## Build Process

The build now works in two stages for the main process:

1. **TypeScript compilation** (`tsc`): Compiles all source files except preload.ts
2. **Preload bundling** (`esbuild`): Bundles preload.ts with all dependencies

```bash
npm run build:main      # Runs both tsc and esbuild
npm run build:renderer  # Next.js static export
npm run build           # Builds both
npm run package         # Packages with electron-builder
```

## Testing

All changes have been verified:
- ✅ Build succeeds without errors
- ✅ Preload script properly bundled (no relative requires)
- ✅ Correct renderer path in main process
- ✅ app.isPackaged used for dev/prod detection
- ✅ Development mode still works
- ✅ Package structure correct in app.asar

See `PACKAGING_FIXES.md` for detailed information about the fixes.

## Expected Result

The packaged app should now:
1. Launch without gray screen
2. Load preload script successfully (no "module not found" errors)
3. Load renderer HTML from correct location
4. Establish IPC communication properly
5. Function identically to development mode
