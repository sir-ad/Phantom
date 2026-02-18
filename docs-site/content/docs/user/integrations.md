+++
title = "Integrations"
+++

# Integrations Guide

Owner: PhantomPM User Docs Team  
Last Updated: 2026-02-13  
Status: Beta

## Capability Status

- integration config model: `Real`
- `integrate scan/connect/doctor` baseline: `Beta`
- full provider sync automation: `Planned`

## Commands

## Scan

```bash
phantom integrate scan
```

Scans local workspace indicators for likely tools.

## Connect

```bash
phantom integrate github
phantom integrate cursor
phantom integrate vscode
```

Registers target in PHANTOM config for workflow use.

## Doctor

```bash
phantom integrate doctor
```

Checks configured integrations and reports status.

## MCP Core Commands

```bash
phantom mcp tools
phantom mcp serve --mode stdio
```

Use `mcp serve` for agent/IDE client connections that support stdio MCP transports.

## Current Limitations

1. connect currently stores integration metadata; full API auth flows vary by provider and are not fully implemented.
2. scan is heuristic-based and may miss tools in non-standard layouts.

## Troubleshooting

If integration commands fail, see:

- [`docs/user/troubleshooting.md`](./troubleshooting.md)
