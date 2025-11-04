# Secure IPC Bridge Implementation

This document describes the secure IPC communication layer implemented between the renderer and main process.

## Overview

A fully typed and validated IPC bridge has been implemented using:
- **Zod** for runtime schema validation
- **TypeScript** for compile-time type safety
- **Electron's contextBridge** for secure API exposure

## Architecture

### 1. Channel Definitions (`packages/main/src/ipc/channels.ts`)
Defines all allowed IPC channel names as constants:
- `dialog:selectFolder` - Opens a folder selection dialog
- `settings:get` - Retrieves a setting value
- `settings:set` - Stores a setting value
- `app:version` - Gets application version information

### 2. Validation Schemas (`packages/main/src/ipc/schemas.ts`)
Uses Zod to define request/response schemas for each channel:
- Type-safe validation at runtime
- Automatic TypeScript type inference
- Clear error messages for invalid data

### 3. IPC Handlers (`packages/main/src/ipc/handlers.ts`)
Implements the actual handler functions:
- `handleDialogSelectFolder()` - Uses Electron's dialog API
- `handleSettingsGet()` - Retrieves from in-memory store
- `handleSettingsSet()` - Stores in in-memory map
- `handleAppVersion()` - Returns version information

All handlers validate inputs and outputs using Zod schemas.

### 4. Preload Script (`packages/main/src/preload.ts`)
Exposes a typed API to the renderer:
```typescript
window.api = {
  selectFolder: () => Promise<DialogSelectFolderResponse>
  getSettings: (key: string) => Promise<SettingsGetResponse>
  setSettings: (key: string, value: unknown) => Promise<SettingsSetResponse>
  getVersion: () => Promise<AppVersionResponse>
}
```

### 5. Main Process (`packages/main/src/index.ts`)
Registers all IPC handlers with error handling and logging.

### 6. Renderer Types (`packages/renderer/src/types/api.d.ts`)
TypeScript declarations for `window.api` interface.

### 7. Example Usage (`packages/renderer/src/app/page.tsx`)
The Settings section demonstrates all IPC functionality:
- Select folder button
- Get app version button
- Save/load test settings buttons

## Security Features

1. **Context Isolation**: Enabled in BrowserWindow
2. **No Node Integration**: Disabled for security
3. **Validated Communication**: All data validated with Zod
4. **Typed API**: Full TypeScript type safety
5. **Controlled API Surface**: Only exposed methods via contextBridge

## Testing the Implementation

1. Start the application: `pnpm dev`
2. Navigate to the Settings section
3. Click each button to test:
   - "Select Folder" - Opens native folder picker
   - "Get App Version" - Displays version information
   - "Save Test Setting" - Saves data to memory
   - "Load Test Setting" - Retrieves saved data
4. Check browser console for detailed logs

## Console Output

All IPC calls log their results to the browser console for debugging and verification.

## Future Enhancements

The current implementation provides a foundation for:
- Persistent settings storage (e.g., electron-store)
- Additional dialog types (file picker, save dialog)
- More complex data validation
- Error boundaries and retry logic
- CSP policies and URL whitelisting (as mentioned in ticket)
