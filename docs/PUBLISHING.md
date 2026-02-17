# PHANTOM npm Publishing Guide

Complete guide for publishing PHANTOM packages to npm.

## Prerequisites

1. **npm Account**: Create an account at npmjs.com
2. **Organization**: PhantomPM organization must be created on npm
3. **Authentication**: Logged in via `npm login`
4. **GitHub Repository**: PhantomPM/phantom must be public

## Package Structure

PHANTOM uses a monorepo structure with these publishable packages:

- `@phantompm/cli` - Main CLI package
- `@phantompm/core` - Core functionality
- `@phantompm/modules` - Built-in modules
- `@phantompm/mcp-server` - MCP server implementation
- `@phantompm/tui` - Terminal UI components

## Publishing Workflow

### 1. Pre-Publish Checklist

Before publishing, ensure:

- [ ] All tests pass (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Version number updated (following semver)
- [ ] CHANGELOG.md updated
- [ ] README.md complete
- [ ] No `private: true` in package.json
- [ ] `files` array includes only necessary files
- [ ] `.npmignore` configured (if needed)

### 2. Version Bump

Use semantic versioning:

```bash
# Patch - bug fixes
npm version patch

# Minor - new features
npm version minor

# Major - breaking changes
npm version major
```

Or manually update version in package.json.

### 3. Build All Packages

```bash
# Build all workspaces
npm run build

# Or build specific package
cd packages/cli && npm run build
```

### 4. Test Installation

Before publishing, test the package locally:

```bash
# Create test directory
mkdir /tmp/phantom-test && cd /tmp/phantom-test

# Link local package
npm link /path/to/phantom/packages/cli

# Test functionality
phantom --version
phantom --help
```

### 5. Publish to npm

#### Option A: Publish from packages directory

```bash
cd packages/cli
npm publish --access public
```

#### Option B: Automated via GitHub Actions

Publishing is automatically triggered on git tag push:

```bash
# Create version tag
git tag -a v1.0.0 -m "Release version 1.0.0"

# Push tag
git push origin v1.0.0
```

The GitHub Actions workflow (`.github/workflows/release.yml`) will:
1. Build all packages
2. Run tests
3. Publish to npm
4. Create GitHub release
5. Upload artifacts

### 6. Verify Publication

After publishing, verify:

```bash
# Check package on npm
npm view @phantompm/cli

# Test installation
npm install -g @phantompm/cli

# Verify it works
phantom --version
```

Visit: https://www.npmjs.com/package/@phantompm/cli

## GitHub Actions Automated Publishing

### Setup Required Secrets

In GitHub repository settings, add these secrets:

1. **`NPM_TOKEN`** - npm access token
   - Generate at: https://www.npmjs.com/settings/tokens
   - Select "Automation" token type
   - Add to GitHub Secrets

2. **`HOMEBREW_TAP_TOKEN`** - For Homebrew formula updates (optional)

### How It Works

The release workflow triggers on tag push:

```yaml
on:
  push:
    tags:
      - "v*"
```

Workflow steps:
1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Build packages
5. Run tests
6. Publish to npm
7. Create GitHub release
8. Upload binaries

### Manual Trigger

You can also trigger manually:

1. Go to GitHub Actions tab
2. Select "Release" workflow
3. Click "Run workflow"
4. Select branch and run

## Package Configuration Details

### package.json Requirements

```json
{
  "name": "@phantompm/cli",
  "version": "1.0.0",
  "description": "Package description",
  "main": "dist/index.js",
  "bin": {
    "phantom": "dist/index.js"
  },
  "files": [
    "dist/**/*",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "build": "tsc",
    "prepublishOnly": "npm run build"
  },
  "publishConfig": {
    "access": "public"
  },
  "keywords": ["cli", "ai", "product-management"],
  "author": "PhantomPM <hello@phantom.pm>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/PhantomPM/phantom.git"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Key Fields Explained

- **`name`**: Must be `@phantompm/[package-name]` for scoped packages
- **`files`**: Only these files are included in the published package
- **`bin`**: Command-line executable entry point
- **`publishConfig.access`**: Required for scoped packages to be public
- **`engines`**: Specifies Node.js version requirements

## Publishing Strategy

### Initial Release (v1.0.0)

1. Ensure all features documented
2. Create comprehensive README
3. Test on multiple platforms
4. Publish all packages simultaneously
5. Announce on social media

### Subsequent Releases

**Patch Releases (1.0.x)**:
- Bug fixes only
- Can be released quickly
- Minimal testing required

**Minor Releases (1.x.0)**:
- New features
- Backward compatible
- Require changelog update
- Moderate testing

**Major Releases (x.0.0)**:
- Breaking changes
- Comprehensive testing
- Migration guide required
- Deprecation notices

### Release Schedule

- **Patch**: As needed (bugs, security fixes)
- **Minor**: Every 2-4 weeks (features)
- **Major**: Every 6-12 months (breaking changes)

## Troubleshooting

### Common Issues

**1. E403 Forbidden**
```
npm ERR! 403 Forbidden - PUT https://registry.npmjs.org/@phantompm%2fcli
```
Solution: Ensure you're logged in and have publish permissions

**2. E404 Not Found**
```
npm ERR! 404 Not Found - PUT https://registry.npmjs.org/@phantompm
```
Solution: Organization doesn't exist, create it first

**3. Version Already Exists**
```
npm ERR! You cannot publish over the previously published versions
```
Solution: Bump version number in package.json

**4. Private Package Error**
```
npm ERR! This package has been marked as private
```
Solution: Remove `"private": true` from package.json

**5. Build Files Missing**
```
npm ERR! main entry point missing
```
Solution: Run `npm run build` before publishing or add to `prepublishOnly` script

### npm Organization Setup

1. Create organization:
   ```bash
   npm org create phantompm
   ```

2. Invite team members:
   ```bash
   npm org add phantompm username
   ```

3. Set team permissions:
   - Owners: Full access
   - Developers: Publish access
   - Read-only: Install only

### npm Token Management

**Create Token:**
1. Go to https://www.npmjs.com/settings/tokens
2. Click "Create New Token"
3. Select "Automation" type
4. Copy token

**Add to GitHub:**
1. Go to repository Settings → Secrets
2. Click "New repository secret"
3. Name: `NPM_TOKEN`
4. Value: [paste token]

**Rotate Token:**
1. Generate new token
2. Update GitHub secret
3. Delete old token
4. Revoke if compromised

## Distribution Channels

### npm Registry (Primary)
```bash
npm install -g @phantompm/cli
```

### GitHub Packages (Mirror)
```bash
npm install -g @phantompm/cli --registry=https://npm.pkg.github.com
```

### Direct Download
```bash
curl -fsSL https://phantom.pm/install | sh
```

### Homebrew (macOS)
```bash
brew tap phantompm/tap
brew install phantom
```

## Post-Publish Checklist

After publishing:

- [ ] Verify package on npmjs.com
- [ ] Test global installation
- [ ] Update website installation instructions
- [ ] Create GitHub release notes
- [ ] Announce on Twitter/Discord
- [ ] Update documentation links
- [ ] Monitor for issues
- [ ] Update CHANGELOG.md

## Rollback Procedure

If a bad version is published:

```bash
# Deprecate version
npm deprecate @phantompm/cli@1.0.1 "Critical bug, use 1.0.2 instead"

# Or unpublish (within 24 hours)
npm unpublish @phantompm/cli@1.0.1
```

**Note**: Unpublishing is discouraged after 24 hours or if package has dependents.

## Best Practices

1. **Always test before publishing** - Use `npm link` locally
2. **Use semantic versioning** - Follow semver strictly
3. **Write good commit messages** - For automatic changelog generation
4. **Tag releases in git** - Match npm version exactly
5. **Include only necessary files** - Use `files` array in package.json
6. **Document breaking changes** - In README and CHANGELOG
7. **Monitor bundle size** - Keep packages lean
8. **Automate where possible** - Use GitHub Actions

## Resources

- npm Documentation: https://docs.npmjs.com/
- Semantic Versioning: https://semver.org/
- GitHub Actions: https://docs.github.com/en/actions
- npm Scoped Packages: https://docs.npmjs.com/using-npm/scope.html

---

**Quick Reference Commands:**

```bash
# Login to npm
npm login

# Check logged in user
npm whoami

# View package info
npm view @phantompm/cli

# Publish
npm publish --access public

# Test installation
npm install -g @phantompm/cli

# List global packages
npm list -g

# Uninstall
npm uninstall -g @phantompm/cli
```