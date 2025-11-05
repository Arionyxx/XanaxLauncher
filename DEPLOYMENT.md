# Deployment Guide

This guide covers the complete deployment process for Media Manager, including building, packaging, and releasing the application.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Build Process](#build-process)
- [Packaging](#packaging)
- [Auto-Updates](#auto-updates)
- [Code Signing](#code-signing)
- [Release Process](#release-process)
- [Rollback Plan](#rollback-plan)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Tools

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**: For version control and tagging

### Environment Variables

Create a `.env.production` file in the project root:

```bash
# GitHub repository info for auto-updates
GITHUB_REPOSITORY_OWNER=your-github-username
GITHUB_REPOSITORY_NAME=media-manager

# Optional: Custom TorBox API URL
NEXT_PUBLIC_TORBOX_API_URL=https://api.torbox.app/v1/api
```

### Code Signing (Optional)

For production releases, you should code sign your Windows installer:

1. Obtain a code signing certificate (`.pfx` or `.p12` file)
2. Set environment variables:
   ```bash
   CSC_LINK=path/to/certificate.pfx
   CSC_KEY_PASSWORD=your-certificate-password
   ```

## Build Process

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Tests

Before building, ensure all tests pass:

```bash
# Unit and integration tests
npm test

# End-to-end tests
npm run test:e2e

# Type checking
npm run typecheck

# Linting
npm run lint
```

### 3. Build for Production

```bash
# Build Next.js renderer
npm run build

# Build Electron main process
npm run build:main
```

This creates:
- `packages/renderer/.next/` - Next.js production build
- `packages/main/dist/` - Compiled Electron main process

## Packaging

### Build Windows Installer

```bash
npm run package
```

This command:
1. Builds the renderer (Next.js)
2. Builds the main process (Electron)
3. Packages with electron-builder
4. Creates NSIS installer in `dist/` directory

### Output Files

After packaging, you'll find in the `dist/` directory:

- `Media Manager-1.0.0-x64.exe` - Windows installer
- `latest.yml` - Auto-update metadata file
- `builder-debug.yml` - Build configuration (debug info)

### Installer Features

The NSIS installer includes:

- ✅ Desktop shortcut creation
- ✅ Start Menu entry
- ✅ Add/Remove Programs entry
- ✅ Custom install location (user choice)
- ✅ Uninstaller
- ✅ Auto-update support

### Installer Size

Target: **< 200MB**

Current typical size: ~150MB (includes Electron, Chromium, Node.js)

## Auto-Updates

### Configuration

Auto-updates are configured in `packages/main/electron-builder.yml`:

```yaml
publish:
  provider: github
  owner: ${env.GITHUB_REPOSITORY_OWNER}
  repo: ${env.GITHUB_REPOSITORY_NAME}
  releaseType: release
```

### How It Works

1. **electron-updater** checks GitHub Releases for new versions
2. Compares current app version with latest release
3. Downloads differential update if available
4. Prompts user to install update
5. Quits and installs on user confirmation

### Update Channels

- **Stable**: Production releases (tags: `v1.0.0`, `v1.1.0`)
- **Beta**: Pre-release versions (tags: `v1.0.0-beta.1`)

### Manual Update Check

Users can check for updates via Settings > Advanced > Check for Updates

## Code Signing

### Why Sign?

- Prevents Windows SmartScreen warnings
- Builds user trust
- Required for some enterprise deployments

### Setup

1. **Obtain Certificate**
   - Purchase from CA (DigiCert, Sectigo, etc.)
   - Or use self-signed for testing (not recommended for production)

2. **Configure electron-builder**

   Already configured in `electron-builder.yml`:
   ```yaml
   win:
     certificateFile: ${env.CSC_LINK}
     certificatePassword: ${env.CSC_KEY_PASSWORD}
   ```

3. **Set Environment Variables**
   ```bash
   export CSC_LINK=/path/to/certificate.pfx
   export CSC_KEY_PASSWORD=your_password
   ```

4. **Build Signed Installer**
   ```bash
   npm run package
   ```

### Verification

After signing, verify with:
```bash
signtool verify /pa /v "dist/Media Manager-1.0.0-x64.exe"
```

## Release Process

### Pre-Release Checklist

- [ ] All tests passing (`npm test`, `npm run test:e2e`)
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] No linting errors (`npm run lint`)
- [ ] CHANGELOG.md updated with release notes
- [ ] Version bumped in all `package.json` files
- [ ] Smoke testing completed
- [ ] Breaking changes documented

### Version Bump

We follow [Semantic Versioning](https://semver.org/):

- **Patch** (1.0.x): Bug fixes, minor changes
- **Minor** (1.x.0): New features, backward compatible
- **Major** (x.0.0): Breaking changes

Update versions in:
- `package.json` (root)
- `packages/main/package.json`
- `packages/renderer/package.json`

```bash
# Example: Bump to 1.1.0
# Update all package.json files manually
# Then commit
git add .
git commit -m "chore: bump version to 1.1.0"
```

### Create Release

#### Option 1: Manual Release

1. **Create Git Tag**
   ```bash
   git tag v1.1.0
   git push origin v1.1.0
   ```

2. **Build Installer**
   ```bash
   npm run package
   ```

3. **Generate Checksums**
   ```bash
   cd dist
   sha256sum "Media Manager-1.1.0-x64.exe" > checksums.txt
   ```

4. **Create GitHub Release**
   - Go to GitHub > Releases > Draft a new release
   - Tag: `v1.1.0`
   - Title: `Media Manager v1.1.0`
   - Description: Copy from CHANGELOG.md
   - Attach files:
     - `Media Manager-1.1.0-x64.exe`
     - `latest.yml`
     - `checksums.txt`
   - Publish release

#### Option 2: Automated Release (GitHub Actions)

The project includes a release workflow (`.github/workflows/release.yml`):

1. **Trigger Workflow**
   ```bash
   git tag v1.1.0
   git push origin v1.1.0
   ```

2. **Workflow Automatically**:
   - Runs tests
   - Builds installer
   - Generates checksums
   - Creates GitHub Release
   - Uploads artifacts

### Post-Release

- [ ] Verify GitHub Release is published
- [ ] Test auto-update from previous version
- [ ] Announce release (social media, changelog page, etc.)
- [ ] Monitor for issues (GitHub Issues, crash reports)

## Rollback Plan

### If Update Causes Issues

1. **Remove Problematic Release**
   - Go to GitHub Releases
   - Delete the problematic release
   - This prevents auto-updates to that version

2. **Publish Hotfix**
   - Create hotfix branch: `git checkout -b hotfix/v1.1.1`
   - Fix critical issue
   - Bump patch version
   - Release as `v1.1.1`

3. **Notify Users**
   - Update website/changelog
   - Post on social media
   - Email if critical security issue

### Manual Downgrade

Users can manually downgrade:

1. Uninstall current version
2. Download previous installer from GitHub Releases
3. Install previous version

All user data (settings, sources, jobs) is preserved in:
- Windows: `%APPDATA%/media-manager`

## Troubleshooting

### Build Fails

**Issue**: `npm run build` fails with errors

**Solution**:
1. Clear caches: `rm -rf node_modules .next packages/*/dist`
2. Reinstall: `npm install`
3. Rebuild: `npm run build`

### Packaging Fails

**Issue**: `npm run package` fails

**Solution**:
- Check `packages/main/build/` directory has icon files
- Verify `electron-builder.yml` syntax
- Check electron-builder logs in terminal

### Auto-Update Not Working

**Issue**: App doesn't detect updates

**Solution**:
1. Verify `latest.yml` is uploaded to GitHub Release
2. Check `GITHUB_REPOSITORY_OWNER` and `GITHUB_REPOSITORY_NAME` env vars
3. Ensure release is marked as "Latest" on GitHub
4. Check electron-updater logs (Settings > Advanced > Open Logs)

### Code Signing Errors

**Issue**: Signing fails during build

**Solution**:
- Verify certificate path: `echo $CSC_LINK`
- Check password: `echo $CSC_KEY_PASSWORD`
- Ensure certificate hasn't expired
- Try without signing first (for testing)

### Installer Size Too Large

**Issue**: Installer exceeds 200MB

**Solution**:
- Check for unnecessary dependencies
- Review `extraResources` in `electron-builder.yml`
- Ensure `node_modules` isn't included in files
- Use `asar: true` for better compression

## Smoke Test Checklist

Before releasing, manually test:

- [ ] App launches successfully
- [ ] Settings are persisted across restarts
- [ ] Download/install location selection works
- [ ] Provider connections work (TorBox, Real-Debrid)
- [ ] Source sync works
- [ ] Theme changes apply correctly
- [ ] Keyboard shortcuts work
- [ ] Auto-update check works (if previous version exists)
- [ ] Logs folder opens
- [ ] Uninstaller works correctly
- [ ] Desktop/Start Menu shortcuts created

## Support & Logs

### Log Locations

- **Windows**: `%APPDATA%/media-manager/logs/main.log`

### Safe Mode

Launch with safe mode to troubleshoot:
```bash
"Media Manager.exe" --safe-mode
```

This disables:
- Auto-update checks
- Extension loading
- Telemetry

### Crash Reports

If telemetry is enabled, crash reports are sent to:
- electron-log file
- Optional: External crash reporting service (configure separately)

## Additional Resources

- [Electron Builder Docs](https://www.electron.build/)
- [electron-updater Docs](https://www.electron.build/auto-update)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)

## Questions?

- Check GitHub Issues: https://github.com/your-username/media-manager/issues
- Read CONTRIBUTING.md for development guidelines
- Contact: your-email@example.com
