# Adapter Specifications

Owner: PhantomPM Integrations Team  
Last Updated: 2026-02-13  
Status: Beta

## Scope

Define client adapters for:

1. Claude Code
2. Codex-compatible MCP client path
3. Cursor
4. VS Code

## Current Implementation State

Baseline adapter implementation is shipped for scan/connect/doctor workflows:

1. target detection heuristics per integration
2. config registration with detection metadata
3. doctor status output with pass/fail reason

Deep client config patching and rollback are still planned.

## Target State

Each adapter is a thin compatibility layer over MCP core.

Responsibilities:

1. discover local PHANTOM MCP endpoint
2. patch/update client config safely
3. validate connectivity
4. expose a health report

## CLI UX Requirements

1. `phantom integrate scan`
2. `phantom integrate <target>`
3. `phantom integrate doctor`

## Adapter Contract

Each adapter must define:

1. `target_id`
2. `detect()`
3. `configure()`
4. `validate()`
5. `rollback()`

## Failure Modes

1. target not installed
2. config file not writable
3. incompatible target version
4. MCP handshake failure

## Recovery Requirements

1. no partial config corruption
2. reversible changes
3. clear instructions for manual fix path

## Acceptance Criteria

1. adapter setup path <= 3 minutes in normal environment
2. integration doctor provides pass/fail + reason per target
3. each adapter has setup and troubleshooting docs
