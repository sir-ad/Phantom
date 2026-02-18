+++
title = "Install"
+++

# Install Guide

Owner: PhantomPM User Docs Team  
Last Updated: 2026-02-13  
Status: Beta

## Capability Status

- One-line curl installer: `Beta`
- Workspace install via npm scripts: `Real`
- npm global package install path: `Beta`

## Canonical Install (Beta)

```bash
curl -fsSL phantom.pm/install | sh
```

Expected behavior:

1. detects platform
2. installs PHANTOM binary
3. configures PATH/completions
4. runs `phantom doctor`

## Local Installer Test (Works Today)

```bash
npm run release:local
npm run installer:test-local
```

This generates a local manifest + archive and validates the install flow end-to-end.

## Current Working Path

From repository root:

```bash
npm install
npm run build
npm run phantom -- --help
```

## Fallback Install Path (Target)

```bash
npm install -g @phantompm/cli
phantom --version
```

## Verify Installation

```bash
phantom --version
phantom --help
```

## Next Step

Proceed to quickstart:

- [`docs/user/quickstart.md`](./quickstart.md)
