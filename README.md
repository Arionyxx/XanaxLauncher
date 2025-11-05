# XanaxLauncher - Media Manager

A modern media management application built with Electron, Next.js 14, and DaisyUI.

## 🎉 Complete Rewrite - v2.0

This is a complete ground-up rewrite of XanaxLauncher with a simplified, reliable tech stack:

### Tech Stack

- **Desktop Framework**: Electron 28 (simple setup, no Electron Forge)
- **Web Framework**: Next.js 14 with App Router
- **UI Library**: DaisyUI (Tailwind CSS component library)
- **Language**: TypeScript 5
- **Database**: Dexie (IndexedDB wrapper)
- **Forms**: react-hook-form + Zod validation
- **Icons**: react-icons (Feather Icons)
- **Animations**: Framer Motion
- **Package Manager**: npm with workspaces

### Key Features

✅ **Clean, Simple Setup** - No complex build configurations
✅ **DaisyUI Components** - Beautiful, accessible UI out of the box
✅ **Catalog System** - Browse and search media
✅ **Download Management** - Track downloads with progress bars
✅ **Provider Framework** - Support for TorBox and other download services
✅ **Settings System** - Comprehensive settings with IndexedDB persistence
✅ **Onboarding Flow** - Welcome wizard for first-time users
✅ **Keyboard Shortcuts** - Navigate efficiently with hotkeys
✅ **Dark Theme** - Business theme from DaisyUI (dark, professional)
✅ **Responsive Design** - Works on all screen sizes

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- npm 7+ (workspaces support)

### Installation

```bash
# Install all dependencies
npm install

# Build the main process
npm run build:main
```

### Development

```bash
# Start development mode (Next.js + Electron)
npm run dev
```

This will:

1. Start Next.js dev server on port 3000
2. Wait for Next.js to be ready
3. Launch Electron window loading the Next.js app

### Production Build

```bash
# Build everything
npm run build

# Package for distribution
npm run package

# Platform-specific packaging
npm run package:win
npm run package:mac
npm run package:linux
```

## 📁 Project Structure

```
xanax-launcher/
├── packages/
│   ├── main/                    # Electron main process
│   │   ├── src/
│   │   │   ├── index.ts        # Main entry point
│   │   │   ├── preload.ts      # Preload script
│   │   │   └── ipc/            # IPC handlers and schemas
│   │   ├── dist/               # Compiled output
│   │   └── tsconfig.json
│   │
│   └── renderer/                # Next.js app
│       ├── src/
│       │   ├── app/            # Next.js App Router pages
│       │   │   ├── page.tsx            # Home/Catalog page
│       │   │   ├── downloads/page.tsx  # Downloads page
│       │   │   ├── settings/page.tsx   # Settings page
│       │   │   ├── help/page.tsx       # Help page
│       │   │   ├── layout.tsx          # Root layout
│       │   │   ├── providers.tsx       # React providers
│       │   │   └── globals.css         # Global styles
│       │   ├── components/     # React components
│       │   │   ├── AppLayout.tsx       # Main app layout with drawer
│       │   │   ├── ErrorBoundary.tsx
│       │   │   ├── catalog/            # Catalog components
│       │   │   ├── downloads/          # Download components
│       │   │   ├── onboarding/         # Onboarding wizard
│       │   │   └── settings/           # Settings panels
│       │   ├── hooks/          # Custom React hooks
│       │   │   ├── useSettings.ts
│       │   │   ├── useOnboarding.ts
│       │   │   ├── useGames.ts
│       │   │   ├── useKeyboardShortcuts.ts
│       │   │   └── useDebounce.ts
│       │   ├── services/       # Business logic
│       │   │   ├── providers/          # Provider framework
│       │   │   ├── job-orchestrator.ts
│       │   │   └── source-sync.ts
│       │   ├── db/             # Dexie database
│       │   ├── types/          # TypeScript types
│       │   └── utils/          # Utility functions
│       ├── out/                # Static export output
│       ├── next.config.js
│       ├── tailwind.config.ts
│       └── tsconfig.json
│
├── package.json                 # Root package.json
└── README.md                    # This file
```

## 🎨 UI Components

This app uses DaisyUI, a Tailwind CSS component library. Key components used:

- **Layout**: `drawer`, `navbar`, `sidebar`, `menu`
- **Forms**: `input`, `select`, `checkbox`, `toggle`, `form-control`
- **Feedback**: `alert`, `progress`, `loading`, `badge`, `toast`
- **Data Display**: `card`, `stats`, `table`, `kbd`
- **Actions**: `btn`, `modal`, `dropdown`
- **Navigation**: `tabs`, `steps`, `breadcrumbs`

Current theme: `business` (dark theme)

Available themes: dark, business, forest, luxury, dracula, night, coffee

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file in `packages/renderer/`:

```env
NEXT_PUBLIC_TORBOX_API_URL=https://api.torbox.app/v1/api
```

### Settings

Settings are stored in IndexedDB and include:

- **General**: Download directory, temp directory, language
- **Integrations**: TorBox API token, Real-Debrid API key
- **Behavior**: Auto-start, minimize to tray, bandwidth limits
- **Privacy**: Telemetry, crash reports (all opt-in by default)

## 🎹 Keyboard Shortcuts

- `Ctrl/Cmd + H` - Navigate to Home
- `Ctrl/Cmd + J` - Navigate to Downloads
- `Ctrl/Cmd + ,` - Navigate to Settings
- `Ctrl/Cmd + F` or `/` - Focus search bar
- `Ctrl/Cmd + R` - Refresh application
- `Escape` - Close modals/drawers

## 📦 Build System

### Main Process

The Electron main process is built with TypeScript compiler:

```bash
cd packages/main
npm run build     # Build once
npm run dev       # Watch mode
```

Output: `packages/main/dist/`

### Renderer Process

The Next.js app is built for static export:

```bash
cd packages/renderer
npm run dev       # Development server
npm run build     # Production build (exports to ./out)
```

Output: `packages/renderer/out/`

### Electron Packaging

Uses electron-builder for creating installers:

```json
{
  "build": {
    "appId": "com.xanaxlauncher.app",
    "productName": "XanaxLauncher",
    "files": [
      "packages/main/dist/**/*",
      "packages/renderer/out/**/*",
      "package.json"
    ],
    "win": {
      "target": ["nsis"]
    },
    "mac": {
      "target": ["dmg"]
    },
    "linux": {
      "target": ["AppImage"]
    }
  }
}
```

## 🔌 Provider Framework

The app supports multiple download providers through a unified interface:

```typescript
interface Provider {
  startJob(payload: JobPayload): Promise<JobStartResponse>
  getStatus(jobId: string): Promise<JobStatusResponse>
  cancel(jobId: string): Promise<CancelResponse>
  getFileLinks(jobId: string): Promise<FileLinksResponse>
  testConnection(): Promise<TestConnectionResponse>
}
```

Currently implemented:

- **TorBoxProvider** - TorBox API integration
- **MockProvider** - Testing/development

## 🗄️ Database Schema

Uses Dexie (IndexedDB) with the following tables:

- **settings** - App settings (key-value store)
- **onboarding** - Onboarding state
- **sources** - Media sources configuration
- **sourceEntries** - Cached source feed entries
- **jobs** - Download jobs and their status

## 🐛 Troubleshooting

### Port Already in Use

If port 3000 is already in use:

```bash
# Change the Next.js port
cd packages/renderer
PORT=3001 npm run dev
```

Then update `packages/main/src/index.ts` to load from port 3001.

### Electron Not Launching

Make sure the main process is compiled:

```bash
npm run build:main
```

### Hot Reload Not Working

Next.js hot reload works automatically. For Electron main process changes:

1. Stop the dev server
2. Rebuild the main process: `npm run build:main`
3. Restart: `npm run dev`

## 📝 Scripts Reference

### Root Scripts

- `npm run dev` - Start development mode (Next.js + Electron)
- `npm run build` - Build both main and renderer
- `npm run build:main` - Build main process only
- `npm run build:renderer` - Build renderer only
- `npm run package` - Package app with electron-builder
- `npm run package:win` - Package for Windows
- `npm run package:mac` - Package for macOS
- `npm run package:linux` - Package for Linux
- `npm run lint` - Lint all code
- `npm run lint:fix` - Fix linting issues
- `npm run typecheck` - Type check all packages
- `npm run format` - Format with Prettier
- `npm run format:check` - Check formatting

## 🎯 Development Workflow

1. **Start Development**

   ```bash
   npm run dev
   ```

2. **Make Changes**
   - Edit renderer (Next.js) code - hot reloads automatically
   - Edit main process code - requires restart

3. **Test Your Changes**
   - Use the app in Electron
   - Check console for errors
   - Test keyboard shortcuts

4. **Build for Production**

   ```bash
   npm run build
   npm run package
   ```

5. **Distribute**
   - Find installer in `dist/` folder
   - Test on target platform
   - Upload to GitHub Releases or distribute directly

## 🚢 Deployment

For production deployment:

1. Update version in `package.json`
2. Build everything: `npm run build`
3. Package for your platform: `npm run package:win` (or :mac, :linux)
4. Find the installer in `dist/` folder
5. (Optional) Upload to GitHub Releases for auto-updates

## 🙏 Credits

Built with:

- [Electron](https://www.electronjs.org/)
- [Next.js](https://nextjs.org/)
- [DaisyUI](https://daisyui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Dexie.js](https://dexie.org/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [Framer Motion](https://www.framer.com/motion/)

## 📄 License

MIT License - See LICENSE file for details
