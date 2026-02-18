+++
title = "Quickstart"
+++


Owner: PhantomPM User Docs Team  
Last Updated: 2026-02-13  
Status: Real

## Step 1: Confirm CLI is Running

```bash
phantom --help
```

## Step 2: Add Project Context

```bash
phantom context add ./
```

What this does now (`Real`):

1. scans files recursively
2. classifies file types
3. calculates context stats

## Step 3: Generate a First PRD

```bash
phantom prd create "Wishlist Feature"
```

What this does now (`Real/Beta`):

1. generates PRD markdown from template
2. writes output under `.phantom/output/`

## Step 4: Run Swarm Analysis

```bash
phantom swarm "Should we prioritize wishlist now?"
```

Current behavior (`Beta`):

1. parallel swarm orchestration runs
2. result content includes simulated components

## Step 5: Check System Health

```bash
phantom health
```

Current behavior (`Beta`):

1. dashboard is rendered
2. many values are illustrative defaults

## Notes

For deterministic behavior references, see:

- [`docs/status/demo-vs-real.md`](../status/demo-vs-real.md)
- [`docs/status/capability-matrix.md`](../status/capability-matrix.md)
