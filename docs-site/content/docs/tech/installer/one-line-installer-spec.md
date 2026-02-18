+++
title = "One Line Installer Spec"
+++

# One-Line Installer Specification

Owner: PhantomPM Platform Team  
Last Updated: 2026-02-13  
Status: Beta

## Objective

Deliver a safe, low-friction installer for:

`curl -fsSL phantom.pm/install | sh`

with equivalent Windows path.

## Current Implementation State

1. Installer scripts are implemented in repository:
   - `scripts/install.sh`
   - `scripts/install.ps1`
2. Hosted production endpoint wiring and release asset hosting are not deployed yet.

## Target State

Installer completes these stages:

1. platform and shell detection
2. asset retrieval from release manifest
3. checksum verification
4. binary installation in user-local path
5. PATH and completion setup
6. post-install diagnostics (`phantom doctor`)

## Supported Platforms

1. macOS arm64
2. macOS x64
3. Linux arm64
4. Linux x64
5. Windows x64 (PowerShell script path)

## Safety Requirements

1. HTTPS-only downloads
2. required checksum validation
3. hard fail on integrity mismatch
4. explicit fallback path if binary unavailable

## Fallback Path

If platform asset unavailable:

1. installer suggests and can run `npm install -g @phantompm/cli`
2. post-install verification still required

## UX Requirements

1. clear progress output
2. actionable error messages
3. short completion path with first command suggestion

## Non-Goals

1. enterprise fleet management in v1
2. background auto-update daemon in v1

## Acceptance Criteria

1. installer matrix passes on target platforms
2. median install-to-version-check within target threshold
3. failure modes documented with recovery commands
