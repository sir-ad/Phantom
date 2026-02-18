+++
title = "Test Strategy"
+++


Owner: PhantomPM QA + Platform Team  
Last Updated: 2026-02-13  
Status: Real

## Purpose

Define release gates across docs, CLI, installer, integrations, and web surfaces.

## Current Implementation State

1. baseline build checks exist
2. dedicated test suite coverage is limited
3. this strategy defines the target steady-state quality system

## Target State

1. deterministic CI gates for docs, CLI, installer, integrations, and website
2. automated matrix coverage for supported platform/shell combinations
3. release blocking policy enforced from machine-readable test results

## Test Layers

## Layer 1: Build and Static Reliability

1. workspace build must pass
2. command boot path must execute without startup exceptions

## Layer 2: CLI Smoke Tests

Required routes:

1. `phantom --help`
2. `phantom --version`
3. `phantom context`
4. `phantom context add <path>`
5. `phantom doctor`
6. `phantom status --json`
7. `phantom mcp tools`

## Layer 3: Docs Integrity

1. link validation across docs
2. capability matrix and README consistency check
3. status tag coverage for user-facing feature claims

## Layer 4: Installer Validation

1. OS/arch matrix tests
2. checksum mismatch handling
3. PATH update behavior checks

## Layer 5: Integration Validation

1. `phantom integrate scan` baseline
2. `phantom integrate <target>` success/failure states
3. `phantom integrate doctor` reporting quality

## Layer 6: Website Validation

1. route render checks
2. metadata/SEO checks
3. performance budget thresholds
4. funnel event instrumentation checks

## Release Gates

A release is blocked if:

1. build fails
2. CLI boot/help fails
3. docs truth checks fail
4. installer integrity checks fail (for installer releases)

## Test Environment Matrix

1. local macOS
2. local Linux
3. CI Linux baseline
4. Windows coverage for install path and command boot

## Acceptance Criteria

1. all critical gates automated
2. failures map to actionable diagnostics
3. release notes include test coverage summary
