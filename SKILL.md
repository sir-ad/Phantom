---
name: phantom-real-release
description: Enforce PHANTOM real-only release quality. Use for any task that changes CLI behavior, core analysis logic, integrations, installer, MCP contracts, or website claims. Blocks simulated outputs, requires deterministic behavior, and mandates command/test verification.
---

# PHANTOM Real Release Skill

## Use this skill when

1. Implementing or changing any surfaced runtime feature.
2. Editing command outputs, schemas, recommendations, or dashboards.
3. Updating integrations, MCP tools, installer scripts, or website claims.

## Required workflow

1. Confirm output is deterministic.
2. Add/maintain JSON mode for machine verification.
3. Run command verification matrix from `AGENTS.md`.
4. Run repo tests and trust gate.

## Mandatory checks

1. `npm run build`
2. `npm run test`
3. `npm run installer:test-local`
4. `npm run reality:check`

## Fail conditions

1. Any simulated/illustrative runtime output.
2. Any randomized decision behavior in core PM analysis flows.
3. Any public claim that cannot be verified by command or test.
