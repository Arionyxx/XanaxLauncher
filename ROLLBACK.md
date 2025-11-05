# Rollback and Recovery Plan

This document outlines procedures for rolling back problematic releases and recovering from deployment issues.

## Table of Contents

- [When to Rollback](#when-to-rollback)
- [Rollback Procedures](#rollback-procedures)
- [Prevention Strategies](#prevention-strategies)
- [Recovery Procedures](#recovery-procedures)
- [User Communication](#user-communication)

## When to Rollback

Consider rolling back when:

- ✅ **Critical Bug**: App crashes on startup for majority of users
- ✅ **Data Loss**: Update causes settings or database corruption
- ✅ **Security Issue**: Vulnerability discovered after release
- ✅ **Breaking Change**: Major functionality broken unexpectedly
- ❌ **Minor Issues**: Small UI bugs, typos, non-critical features
- ❌ **Single Reports**: One or two users reporting issues (may be environment-specific)

## Rollback Procedures

### Option 1: Remove GitHub Release (Preferred)

**Stops auto-updates to problematic version**

1. **Navigate to GitHub Releases**
   ```
   https://github.com/your-username/media-manager/releases
   ```

2. **Delete Problematic Release**
   - Click on the problematic release (e.g., `v1.2.0`)
   - Click "Delete" button
   - Confirm deletion

3. **Verify Previous Version is "Latest"**
   - Ensure previous stable version (e.g., `v1.1.0`) is marked as "Latest release"
   - If not, manually edit and check "Set as the latest release"

4. **Update Download Links**
   - Update any external download links to point to previous version
   - Update website/changelog if applicable

**Impact**: Users on older versions won't auto-update to broken version. Users already on broken version must manually downgrade.

### Option 2: Publish Hotfix Release

**Fixes critical issues quickly**

1. **Create Hotfix Branch**
   ```bash
   git checkout v1.2.0  # Checkout problematic tag
   git checkout -b hotfix/v1.2.1
   ```

2. **Apply Minimal Fix**
   - Fix only the critical issue
   - Don't include new features
   - Test thoroughly

3. **Bump Patch Version**
   - Update version to `1.2.1` in all `package.json` files
   - Update CHANGELOG.md

4. **Build and Test**
   ```bash
   npm test
   npm run package
   # Test installer manually
   ```

5. **Create Hotfix Release**
   ```bash
   git add .
   git commit -m "fix: critical issue in v1.2.0"
   git tag v1.2.1
   git push origin hotfix/v1.2.1
   git push origin v1.2.1
   ```

6. **Publish to GitHub**
   - Create GitHub Release from `v1.2.1` tag
   - Mark as "Latest release"
   - Note in release notes: "Hotfix for v1.2.0"

**Impact**: Users auto-update to fixed version. Faster than full rollback but requires quick diagnosis and fix.

### Option 3: Rollback Commit (Last Resort)

**Reverts to previous codebase state**

⚠️ **Warning**: Only use if Options 1-2 aren't viable

1. **Create Revert Commit**
   ```bash
   git revert v1.2.0..HEAD --no-commit
   git commit -m "revert: rollback to v1.1.0"
   ```

2. **Bump to New Version**
   - Update to `1.2.1` (or `1.3.0` if appropriate)
   - Document rollback in CHANGELOG.md

3. **Build and Release**
   ```bash
   npm run package
   git tag v1.2.1
   git push origin v1.2.1
   # Create GitHub Release
   ```

## Manual User Downgrade

Users who installed a problematic version can manually downgrade:

### Windows

1. **Uninstall Current Version**
   - Open Settings > Apps > Apps & features
   - Find "Media Manager"
   - Click "Uninstall"

2. **Download Previous Version**
   - Go to https://github.com/your-username/media-manager/releases
   - Find previous stable release (e.g., `v1.1.0`)
   - Download `.exe` installer

3. **Install Previous Version**
   - Run downloaded installer
   - Follow installation prompts

4. **Verify Settings Preserved**
   - User data stored in: `%APPDATA%/media-manager`
   - Settings, sources, and jobs should be intact

### Important Notes

- **Data Preservation**: Uninstalling does NOT delete user data
- **Version Check**: After reinstall, disable auto-update temporarily if needed
- **Logs**: Users should backup logs before uninstalling: Settings > Advanced > Open Logs

## Prevention Strategies

### Pre-Release

1. **Comprehensive Testing**
   - [ ] All unit tests pass
   - [ ] All E2E tests pass
   - [ ] Manual smoke testing
   - [ ] Test on clean Windows install
   - [ ] Test upgrade from previous version

2. **Staged Rollout** (Future Enhancement)
   - Release to beta channel first
   - Monitor for 24-48 hours
   - Promote to stable if no issues

3. **Automated Checks**
   - [ ] GitHub Actions CI passes
   - [ ] No TypeScript errors
   - [ ] No linting errors
   - [ ] Installer builds successfully
   - [ ] Installer size < 200MB

### Post-Release

1. **Monitoring Window**
   - Monitor GitHub Issues for 48 hours after release
   - Check crash logs (if telemetry enabled)
   - Watch for user reports on social media

2. **Quick Response**
   - Acknowledge issues within 24 hours
   - Assess severity immediately
   - Decide rollback vs. hotfix within 48 hours

## Recovery Procedures

### User Data Corruption

If update corrupts user data:

1. **Immediate Action**
   - Roll back release immediately
   - Post warning on GitHub Releases

2. **Data Recovery**
   - Document corruption details
   - Create recovery script if possible
   - Provide manual recovery instructions

3. **User Communication**
   - Email affected users if contact available
   - Post on GitHub Issues
   - Update website with recovery steps

### Database Migration Issues

If database migration fails:

1. **Rollback Strategy**
   - Ensure forward-only migrations
   - Never delete columns in migrations
   - Always add, rename, or make nullable

2. **Recovery Steps**
   ```javascript
   // Example: Rollback migration
   db.version(2).stores({ ... }) // Previous schema
   db.open()
   ```

3. **User Instructions**
   - Provide clear rollback steps
   - Document manual database edits if needed

### Settings Reset

If settings are lost/corrupted:

1. **Default Values**
   - App falls back to defaults automatically
   - Users reconfigure settings manually

2. **Backup Recommendation**
   - Encourage users to export settings before updates
   - Add Settings > Export/Import feature (future)

## User Communication

### Templates

#### GitHub Issue Response

```markdown
Thank you for reporting this issue. We've confirmed this is a critical bug 
affecting v1.2.0 users.

**Immediate Action**:
We've removed v1.2.0 from auto-updates and are working on a hotfix.

**For Affected Users**:
Please downgrade to v1.1.0 following these steps:
1. [Uninstall instructions]
2. [Download link to v1.1.0]

**Timeline**:
- Hotfix v1.2.1 expected within 24 hours
- We'll update this issue when released

**Data Safety**:
Your settings and data are safe and will be preserved.
```

#### Release Notes Warning

```markdown
## ⚠️ Known Issues

**v1.2.0 has been pulled due to [critical issue].**

Please use v1.1.0 until hotfix v1.2.1 is released.

[Download v1.1.0](link)
```

### Communication Channels

1. **GitHub Releases**: Primary announcement
2. **GitHub Issues**: Detailed discussion
3. **README.md**: Update with warning
4. **Website**: Homepage banner (if applicable)
5. **Social Media**: Tweet/post announcement

## Testing Rollback

### Simulation

Periodically test rollback procedures:

1. **Mock Scenario**
   - Create test release with intentional "bug"
   - Follow rollback procedures
   - Document any issues

2. **Automated Testing**
   - Test installer upgrade/downgrade paths
   - Verify data preservation across versions

3. **Documentation Review**
   - Ensure docs are up-to-date
   - Verify links work
   - Test instructions manually

## Lessons Learned Log

After each rollback, document:

- **Date**: When did rollback occur?
- **Version**: Which version was rolled back?
- **Issue**: What was the problem?
- **Root Cause**: Why did it happen?
- **Prevention**: How can we prevent this in future?
- **Improvements**: What can we improve in rollback process?

Example:
```markdown
### 2024-01-15: v1.2.0 Rollback

**Issue**: App crashed on startup for Windows 10 users

**Root Cause**: Missing dependency in electron-builder config

**Prevention**: 
- Add Windows 10 VM to test matrix
- Test on multiple Windows versions before release

**Improvements**:
- Rollback completed in 2 hours
- User communication was clear and timely
- 95% of users successfully downgraded
```

## Emergency Contacts

- **Release Manager**: [Name] - [Email]
- **Lead Developer**: [Name] - [Email]
- **GitHub Admin**: [Name] - [Email]

## Additional Resources

- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Electron Builder Docs](https://www.electron.build/)
- [GitHub Releases API](https://docs.github.com/en/rest/releases)
