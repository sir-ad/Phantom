# PHANTOM Real-Only Engineering Rules

These rules apply to all work in this repository.

## Non-Negotiable

1. No simulated or illustrative runtime outputs.
2. No fake analytics, fake recommendations, or placeholder decision data.
3. If a feature is not implemented, return a clear `not implemented` error.

## Command Verification Matrix

Every change touching CLI/core/integration/installer must verify impacted commands.

Core commands:

1. `npm run phantom -- --help`
2. `npm run phantom -- status --json`
3. `npm run phantom -- doctor`
4. `npm run phantom -- context`
5. `npm run phantom -- mcp tools`

Integration commands:

1. `npm run phantom -- integrate scan --json`
2. `npm run phantom -- integrate doctor --json`

Analysis commands:

1. `npm run phantom -- swarm "<question>" --json`
2. `npm run phantom -- screen analyze <path> --json`
3. `npm run phantom -- screen audit <path> --json`
4. `npm run phantom -- health --json`
5. `npm run phantom -- simulate "<scenario>" --json`
6. `npm run phantom -- nudge --json`
7. `npm run phantom -- products --json`
8. `npm run phantom -- docs generate --json`

## Required Tests by Subsystem

1. Core determinism changes: `npm run test` and determinism tests must pass.
2. Integration changes: integration JSON contract tests must pass.
3. MCP changes: MCP contract tests must pass.
4. Installer changes: `npm run installer:test-local` must pass.
5. Website changes: route sanity and content trust checks must pass.

## Trust Gate

All PRs must pass `npm run reality:check`.

Failure conditions include:

1. Runtime `Demo Mode` text in product commands.
2. Runtime `illustrative` or `simulated` output markers.
3. Randomized decision logic in core analysis surfaces.

## Rollback Rules

For high-risk changes (core swarm, installer, integrations):

1. Keep commits scoped to one subsystem.
2. If verification fails, revert the scoped commit immediately.
3. Do not stack unrelated fixes into the same rollback window.

## Coding Conventions

1. Prefer deterministic functions over time/random side effects.
2. Return machine-verifiable JSON (`--json`) for all analysis commands.
3. Keep interfaces backward compatible unless explicitly versioned.
