# PHANTOM

The invisible force behind every great product.  
Open-source PM operating system for the terminal age.

## What is in this repo

1. CLI (`packages/cli`) for PM workflows
2. Core engine (`packages/core`) for context, swarm, modules, config
3. MCP server (`packages/mcp-server`) for agent/IDE integration contracts
4. TUI rendering (`packages/tui`)
5. Installer scripts (`scripts/install.sh`, `scripts/install.ps1`)
6. Minimal website scaffold (`website/`)

## Quick Start

```bash
npm install
npm run build
npm run test
npm run reality:check
npm run phantom -- --help
```

## Useful Commands

```bash
# Core CLI
npm run phantom -- status --json
npm run phantom -- doctor --json
npm run phantom -- swarm "Should we add dark mode?" --json
npm run phantom -- integrate scan --json
npm run phantom -- integrate doctor --json
npm run phantom -- mcp tools --json
npm run phantom -- docs generate --json

# Local installer pipeline
npm run release:local
npm run installer:test-local

# Website
npm run website:dev
```

## Capability Snapshot

1. Context indexing: `Real`
2. Module system: `Real`
3. Deterministic swarm analysis: `Real`
4. Integration scan/connect/doctor: `Beta`
5. MCP core server commands: `Beta`
6. One-line installer endpoint hosting: `Planned`

## Contributing

See `CONTRIBUTING.md`.

## License

MIT (see `LICENSE`).
