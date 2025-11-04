# pnpm Workspace with Next.js and Electron

A modern monorepo setup using pnpm workspaces, Next.js with App Router, Electron, TypeScript, and Tailwind CSS.

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
│       │   └── preload.ts # Preload script
│       ├── electron-builder.yml
│       └── package.json
├── package.json           # Root workspace configuration
├── pnpm-workspace.yaml    # pnpm workspace definition
└── tsconfig.json          # Base TypeScript configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Installation

```bash
pnpm install
```

This should complete in under 2 minutes.

## 📜 Available Scripts

### Development

```bash
pnpm dev
```

Starts the Electron application with:

1. Next.js development server on http://localhost:3000
2. Electron window loading the Next.js app

The script uses `concurrently` to run both processes and `wait-on` to ensure Next.js is ready before launching Electron.

### Build

```bash
pnpm build
```

Builds the Next.js application for production.

### Linting

```bash
pnpm lint        # Run ESLint
pnpm lint:fix    # Run ESLint and auto-fix issues
```

### Type Checking

```bash
pnpm typecheck
```

Runs TypeScript compiler to check for type errors across all packages (both renderer and main).

### Formatting

```bash
pnpm format        # Format all files with Prettier
pnpm format:check  # Check if files are formatted correctly
```

## 🛠️ Tech Stack

- **Package Manager**: pnpm with workspaces
- **Framework**: Next.js 14 with App Router
- **Desktop**: Electron 28
- **Language**: TypeScript 5
- **UI Library**: React 18
- **Styling**: Tailwind CSS 3
- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier
- **Packaging**: electron-builder

## 📦 Packages

### renderer

The Next.js application package with:

- App Router for modern React server components
- TypeScript for type safety
- Tailwind CSS for utility-first styling
- Hot module replacement for fast development

### main

Electron main process with:

- Basic BrowserWindow setup (800x600)
- Preload script with contextBridge
- Loads Next.js dev server in development
- Context isolation and security enabled

## 🏗️ Architecture

### Main Process

The main process (`packages/main/src/index.ts`) is responsible for:

- Creating and managing the application window
- Loading the Next.js renderer in the BrowserWindow
- Handling application lifecycle events

### Preload Script

The preload script (`packages/main/src/preload.ts`) provides a minimal API:

- Exposes a simple `window.api` object with version information
- Uses `contextBridge` for secure communication
- Can be extended with additional IPC methods in the future

### Renderer Process

The renderer process (`packages/renderer/`) is a standard Next.js application that runs in the Electron window.

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
pnpm --filter renderer dev
pnpm --filter renderer build
pnpm --filter main build
```

Run commands in all packages:

```bash
pnpm -r typecheck    # Run typecheck in all packages
pnpm -r build        # Build all packages
```

## ⚠️ Known Issues

- The Electron window loads the Next.js dev server at http://localhost:3000
- Make sure no other application is using port 3000
- In production mode, you'll need to implement static file serving or Next.js standalone mode

## 🔮 Next Steps

This setup includes minimal Electron configuration. Future additions:

- IPC communication channels for main/renderer interaction
- Native modules as needed
- Auto-updater for production releases
- Custom application menu and tray
- Content Security Policy (CSP) configuration
- Production build optimization

## 🤝 Contributing

1. Follow the existing code style
2. Run `pnpm lint` before committing
3. Run `pnpm typecheck` to ensure no type errors
4. Use meaningful commit messages

## 📄 License

Private project - not licensed for public use.
