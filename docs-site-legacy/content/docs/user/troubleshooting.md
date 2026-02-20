+++
title = "Troubleshooting"
+++


Owner: PhantomPM User Docs Team  
Last Updated: 2026-02-13  
Status: Real

## PHANTOM command fails to run

Symptoms:

1. `command not found: phantom`

Fix:

1. run from repo via `npm run phantom -- --help`
2. ensure install path is in PATH when installer is available

## Build fails in modules package

Symptoms:

1. TypeScript reports no inputs for `packages/modules`

Fix:

1. ensure `packages/modules/src/index.ts` exists
2. rerun `npm run build`

## CLI fails with duplicate command error

Symptoms:

1. startup error about duplicate `context` command

Fix:

1. ensure using build with corrected command/subcommand architecture
2. rerun build and retry `phantom --help`

## Integration command reports unknown target

Symptoms:

1. `unsupported integration target`

Fix:

1. run `phantom integrate scan` to view candidates
2. use supported targets listed by command help

## Swarm output seems inconsistent

Explanation:

1. current swarm behavior is `Beta` and may include simulated elements

Reference:

- [`docs/status/demo-vs-real.md`](../status/demo-vs-real.md)

## Need debug snapshot

Use:

```bash
phantom doctor
phantom status --json
```

Include output in issue report with OS and Node version.
