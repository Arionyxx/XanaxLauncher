# pnpm Workspace with Next.js

A modern monorepo setup using pnpm workspaces, Next.js with App Router, TypeScript, and Tailwind CSS.

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
│   └── main/              # Placeholder for future Electron main process
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

Starts the Next.js development server on http://localhost:3000

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

Runs TypeScript compiler to check for type errors across all packages.

### Formatting

```bash
pnpm format        # Format all files with Prettier
pnpm format:check  # Check if files are formatted correctly
```

## 🛠️ Tech Stack

- **Package Manager**: pnpm with workspaces
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript 5
- **UI Library**: React 18
- **Styling**: Tailwind CSS 3
- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier

## 📦 Packages

### renderer

The Next.js application package with:

- App Router for modern React server components
- TypeScript for type safety
- Tailwind CSS for utility-first styling
- Hot module replacement for fast development

### main

Placeholder package for future Electron main process integration.

## 🔮 Next Steps

This setup is intentionally minimal and does not include Electron yet to avoid installation issues with native modules.

Future additions:

- Electron integration for desktop application
- Electron Builder for packaging
- IPC communication between main and renderer processes
- Native module support as needed

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
```

Run commands in all packages:

```bash
pnpm -r typecheck    # Run typecheck in all packages
pnpm -r build        # Build all packages
```

## 🤝 Contributing

1. Follow the existing code style
2. Run `pnpm lint` before committing
3. Run `pnpm typecheck` to ensure no type errors
4. Use meaningful commit messages

## 📄 License

Private project - not licensed for public use.
