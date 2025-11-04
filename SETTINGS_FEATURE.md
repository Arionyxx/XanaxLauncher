# Settings Feature Documentation

## Overview

This document describes the Settings UI feature that provides a comprehensive interface for managing application preferences with IndexedDB persistence.

## Structure

### Pages

- `/app/settings/page.tsx` - Main Settings page with tab navigation

### Components

Located in `/components/settings/`:

- `GeneralPanel.tsx` - Language and directory settings
- `BehaviorPanel.tsx` - Auto-start, minimize to tray, and bandwidth limits
- `ThemePanel.tsx` - Catppuccin theme customization
- `IntegrationsPanel.tsx` - Service integration placeholders (TorBox, Real-Debrid)
- `AccountPanel.tsx` - Account management placeholder (Supabase auth)

### Hooks

- `useSettings.ts` - Main hook for settings state management and IndexedDB persistence

### Types

- `types/settings.ts` - TypeScript types and Zod validation schemas for all settings

## Features

### General Settings

- Language selection (English, Spanish)
- Download directory selection (with IPC dialog)
- Temp directory selection (with IPC dialog)
- Real-time validation with error messages

### Behavior Settings

- Auto-start on system boot toggle (UI only - not implemented)
- Minimize to tray on close toggle
- Bandwidth limit with units (KB/s, MB/s)
- Settings persist automatically on change

### Theme Settings

- Catppuccin flavor selector (Latte, Frappé, Macchiato, Mocha)
- Accent color picker (14 Catppuccin accent colors)
- Compact mode toggle
- Live preview of theme changes
- Visual color swatches for easy selection

### Integrations Panel

- Placeholder for TorBox integration
- Placeholder for Real-Debrid integration
- Status badges and configure buttons (disabled)

### Account Panel

- Placeholder for Supabase authentication
- Sign-in options (email, Google)
- Features list (Cloud Sync, Backup & Restore, Secure Authentication)

## Data Persistence

All settings are stored in IndexedDB using the `settings` table with key `app_settings`.

### Storage Schema

```typescript
{
  general: {
    language: 'en' | 'es',
    downloadDirectory: string,
    tempDirectory: string
  },
  behavior: {
    autoStartEnabled: boolean,
    minimizeToTray: boolean,
    bandwidthLimit: number,
    bandwidthUnit: 'KB/s' | 'MB/s'
  },
  theme: {
    flavor: 'latte' | 'frappe' | 'macchiato' | 'mocha',
    accentColor: CatppuccinAccent,
    compactMode: boolean
  }
}
```

### Default Settings

- Language: English
- Auto-start: Disabled
- Minimize to tray: Enabled
- Bandwidth limit: 0 (unlimited)
- Theme flavor: Macchiato
- Accent color: Blue
- Compact mode: Disabled

## Navigation

The Settings page is accessible from the main sidebar by clicking the "Settings" button, which navigates to `/settings`. A back button in the settings page returns to the home page.

## Form Handling

- Uses `react-hook-form` for form state management
- Zod schemas for validation
- Real-time validation with inline error messages
- Auto-save on change (no explicit save button needed)

## UI Components

All components use NextUI with Catppuccin Macchiato theming:

- `Tabs` for panel navigation
- `Card` for section grouping
- `Input` for text fields
- `Select` for dropdowns
- `Switch` for toggles
- `Button` for actions
- `Chip` for status badges

## IPC Integration

The General panel uses IPC to communicate with the Electron main process for folder selection:

- `window.api.selectFolder()` - Opens native folder picker dialog

## Future Enhancements

The following features are placeholders for future implementation:

- [ ] Actual auto-start on system boot (OS integration)
- [ ] TorBox API integration and authentication
- [ ] Real-Debrid API integration and authentication
- [ ] Supabase authentication and user accounts
- [ ] Cloud sync for settings
- [ ] Backup & restore functionality
- [ ] Apply theme changes to CSS variables in real-time
