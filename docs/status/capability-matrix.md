# Capability Matrix

Owner: PhantomPM Core Team  
Last Updated: 2026-02-13  
Status: Real

This matrix is the authoritative mapping between marketed PHANTOM capabilities and implementation status.

## Legend

- `Real`: implemented and available now.
- `Beta`: partially implemented, demo-heavy, or under validation.
- `Planned`: designed but not implemented.

## Core Platform

| Capability | Status | Evidence | Notes |
|---|---|---|---|
| CLI command framework | Real | `packages/cli/src/index.tsx` | Command architecture exists; quality fixes in progress. |
| Context indexing from filesystem | Real | `packages/core/src/context.ts` | Recursive indexing with extension-based typing. |
| Module registry and install state | Real | `packages/core/src/modules.ts`, `packages/core/src/config.ts` | Registry is static/built-in. |
| PRD file generation | Real | `packages/core/src/prd.ts`, CLI write path | Generates markdown output. |
| Health dashboard rendering | Beta | `packages/tui/src/screens/health.ts` | Screen exists; many metrics are static defaults. |
| Agent swarm orchestration | Beta | `packages/core/src/agents.ts` | Parallel execution exists; outputs are simulated/randomized. |
| Screen analysis and app audit | Beta | `packages/tui/src/screens/screen-analysis.ts` | Uses example payloads in current CLI path. |
| Auto-documentation generation | Planned | CLI currently prints simulated file list | No real artifact generation pipeline yet. |
| Multi-product portfolio management | Beta | CLI renders sample data | Not yet backed by persistent product model. |

## Installation and Runtime

| Capability | Status | Evidence | Notes |
|---|---|---|---|
| `npm` local workspace install/run | Real | Root `package.json` scripts | Works after foundation fixes. |
| One-line curl installer | Beta | `scripts/install.sh`, `scripts/install.ps1` | Script flow implemented; public endpoint/release pipeline still pending. |
| Cross-platform binary release manifest | Beta | `releases/manifest.template.json` | Template and parser contract exist; hosted manifest pipeline pending. |
| Install-time auto-discovery | Planned | Spec in docs only | Current behavior requires manual command invocation. |
| `phantom doctor` diagnostics | Beta | Added in foundation work | Initial checks only; will expand. |

## Integrations and Protocols

| Capability | Status | Evidence | Notes |
|---|---|---|---|
| Config model for integrations | Real | `PhantomConfig.integrations` | Basic structure present. |
| Integration scan command | Beta | `packages/core/src/integrations.ts` | Heuristic scan with target-level reasons. |
| Integration connect command | Beta | `packages/core/src/integrations.ts` | Adapter baseline saves structured local integration metadata. |
| MCP core server | Beta | `packages/mcp-server/src/index.ts` | Stdio server + documented tool contracts implemented. |
| IDE adapters (Claude/Codex/Cursor/VS Code) | Beta | `packages/core/src/integrations.ts` + CLI commands | Detection/config baseline exists; deep client patching still planned. |

## Security and Privacy

| Capability | Status | Evidence | Notes |
|---|---|---|---|
| Local data storage | Real | `~/.phantom/config.json` | Local-first baseline exists. |
| Permission level model in config | Real | `permissionLevel` field | Not yet enforced across all actions. |
| AES-256 at rest enforcement | Planned | Claim currently informational | Requires real encryption implementation. |
| OS keychain secret storage | Planned | Claim currently informational | Requires keychain integration. |
| Audit logging | Planned | No structured audit log yet | Targeted in security workstream. |

## Website and Documentation

| Capability | Status | Evidence | Notes |
|---|---|---|---|
| Website source directory | Real | `website/` exists | Static marketing pages and local server scripts are available. |
| Local website run command | Beta | `scripts/serve-website.mjs`, `npm run website:dev` | Works outside restricted sandboxes; production deployment not wired. |
| Launch-ready website | Planned | Web specs in `docs/web/*` | To be built in Phase E. |
| Full docs architecture | Real | `docs/` tree | Fully authored in this sprint. |
| Status-tagged user-facing docs | Real | `docs/status/*`, updated README | Source-of-truth model in place. |

## Release Rules

1. A capability cannot be promoted from `Beta` to `Real` without reproducible test coverage.
2. Marketing pages must only present `Real` and clearly labeled `Beta` capabilities.
3. Any command transcript derived from mocked data must be explicitly labeled `Demo Mode`.
