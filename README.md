# npm Workspace with Next.js and Electron

A modern monorepo setup using npm workspaces, Next.js with App Router, Electron, TypeScript, and Tailwind CSS.

## 📁 Workspace Structure

```
.
├── packages/
│   ├── renderer/          # Next.js application (React 18 + TypeScript)
│   │   ├── src/
│   │   │   └── app/       # Next.js App Router
│   │   ├── next.config.js
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   └── main/              # Electron main process
│       ├── src/
│       │   ├── index.ts   # Main entry point
│       │   ├── preload.ts # Preload script
│       │   └── ipc/       # IPC handlers and schemas
│       ├── build/         # Build resources (icons, etc.)
│       └── package.json
├── forge.config.js        # Electron Forge configuration
├── package.json           # Root workspace configuration
└── tsconfig.json          # Base TypeScript configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
npm install
```

This should complete in under 2 minutes.

## 📜 Available Scripts

### Development

```bash
npm run dev
# or
npm start
```

Starts the Electron application with:

1. Next.js development server on http://localhost:3000
2. Electron Forge bundles and launches the main process
3. Electron window loads the Next.js app

The script uses `concurrently` to run both processes and `wait-on` to ensure Next.js is ready before launching Electron.

### Build

```bash
npm run build          # Build Next.js for production
npm run package        # Package Electron app with Forge
npm run make           # Create installers (Windows Squirrel, ZIP)
```

### Publishing

```bash
npm run publish        # Publish to GitHub releases (requires configuration)
```

### Linting

```bash
npm run lint        # Run ESLint
npm run lint:fix    # Run ESLint and auto-fix issues
```

### Type Checking

```bash
npm run typecheck
```

Runs TypeScript compiler to check for type errors across all packages (both renderer and main).

### Formatting

```bash
npm run format        # Format all files with Prettier
npm run format:check  # Check if files are formatted correctly
```

## 🛠️ Tech Stack

- **Package Manager**: npm with workspaces
- **Framework**: Next.js 14 with App Router
- **Desktop**: Electron 39 with Electron Forge 7
- **Language**: TypeScript 5
- **UI Library**: React 18
- **Styling**: Tailwind CSS 3
- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier
- **Packaging**: Electron Forge with Webpack plugin
- **Auto-Updates**: electron-updater
- **Logging**: electron-log

## 📦 Packages

### renderer

The Next.js application package with:

- App Router for modern React server components
- TypeScript for type safety
- Tailwind CSS for utility-first styling
- Hot module replacement for fast development

### main

Electron main process with:

- BrowserWindow setup (800x600)
- Preload script with contextBridge for secure IPC
- Loads Next.js from localhost:3000
- Context isolation and security enabled
- TypeScript compilation via Webpack (ts-loader)
- electron-log for application logging
- electron-updater for auto-updates
- IPC handlers for system integration

## 🏗️ Architecture

### Electron Forge Integration

This project uses Electron Forge with the Webpack plugin for building and packaging:

- **Configuration**: `forge.config.js` at project root
- **Main Process**: Bundled with Webpack (ts-loader + fork-ts-checker-webpack-plugin)
- **Preload Script**: Bundled with Webpack alongside main process
- **Renderer**: External Next.js development server (localhost:3000)
- **Makers**: Squirrel for Windows, ZIP for cross-platform distribution
- **Publishers**: GitHub releases integration

Webpack provides these globals in the main process:
- `MAIN_WINDOW_WEBPACK_ENTRY` - Path to compiled main entry
- `MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY` - Path to compiled preload script

### Main Process

The main process (`packages/main/src/index.ts`) is responsible for:

- Creating and managing the application window
- Loading the Next.js renderer from localhost:3000
- Handling application lifecycle events
- Registering IPC handlers for renderer communication
- Initializing electron-log and electron-updater

### Preload Script

The preload script (`packages/main/src/preload.ts`) provides a secure API:

- Exposes `window.api` object for IPC communication
- Uses `contextBridge` for secure main/renderer communication
- Provides methods for settings, dialogs, providers, updates, logs
- All communication is typed with TypeScript and validated with Zod

### Renderer Process

The renderer process (`packages/renderer/`) is a standard Next.js application that runs in the Electron window.

### IPC Communication

IPC channels are organized in `packages/main/src/ipc/`:
- `channels.ts` - Channel name constants
- `schemas.ts` - Zod validation schemas
- `handlers.ts` - Handler implementations

## 📝 Development Notes

### Path Aliases

The renderer package is configured with path aliases:

- `@/*` maps to `./src/*`

### Code Quality

The project includes:

- ESLint for code linting
- Prettier for code formatting
- TypeScript strict mode enabled
- Editor config for consistent coding style

### Workspace Commands

Run commands in specific packages:

```bash
npm run dev --workspace=packages/renderer
npm run build --workspace=packages/renderer
npm run build --workspace=packages/main
```

Run commands in all packages:

```bash
npm run typecheck --workspaces --if-present    # Run typecheck in all packages
npm run build --workspaces --if-present        # Build all packages
```

## ⚠️ Known Issues

- The Electron window loads the Next.js dev server at http://localhost:3000
- Make sure no other application is using port 3000
- In production mode, Next.js must be running on localhost:3000
- Electron Forge may show library errors in test environments (expected)

## 🔮 Future Enhancements

Possible future additions:

- Static file serving for production builds
- Custom application menu and tray
- Native modules as needed
- Additional IPC channels
- Production build optimization

## 🤝 Contributing

1. Follow the existing code style
2. Run `npm run lint` before committing
3. Run `npm run typecheck` to ensure no type errors
4. Use meaningful commit messages

## 📄 License

Private project - not licensed for public use.
