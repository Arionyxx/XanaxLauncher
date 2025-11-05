# Changelog

All notable changes to Media Manager will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2024-01-XX

### Added

- Initial release of Media Manager
- Content catalog with search and filtering
- Download management with job queue
- Provider integrations (TorBox, Real-Debrid)
- Source management for content feeds
- Catppuccin theming with 4 flavors and 14 accent colors
- Onboarding wizard for first-time setup
- Settings panel with multiple sections:
  - General settings (language, directories)
  - Behavior settings (auto-start, minimize to tray, bandwidth limits)
  - Theme customization
  - Source management
  - Provider integrations
  - Account management
  - Advanced settings
- Keyboard shortcuts for navigation and actions
- Help page with comprehensive documentation
- Auto-update support via electron-updater
- Crash logging with electron-log
- Privacy-focused telemetry (opt-in only)
- Safe mode flag (--safe-mode)
- Windows NSIS installer with desktop/start menu shortcuts
- IndexedDB storage for settings, sources, and jobs
- Error boundaries for graceful error handling
- Loading states and skeleton screens
- Toast notifications for user feedback
- Security warnings for HTTP sources
- Legal compliance notices

### Security

- Context isolation enabled in Electron
- Node integration disabled in renderer
- Secure IPC communication via contextBridge
- Input validation with Zod schemas
- HTTP source warnings

### Performance

- Debounced search (300ms)
- Memoized computations for filtering/sorting
- Lazy loading images
- Virtual scrolling with pagination
- Rate limiting for API calls
- Exponential backoff retry logic

### Accessibility

- Keyboard navigation support
- Focus indicators
- ARIA labels
- Smooth scrolling
- Respects prefers-reduced-motion

[Unreleased]: https://github.com/yourusername/media-manager/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/yourusername/media-manager/releases/tag/v1.0.0
