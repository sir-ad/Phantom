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
npm run phantom -- --help
```

## Useful Commands

```bash
# Core CLI
npm run phantom -- status --json
npm run phantom -- doctor
npm run phantom -- integrate scan
npm run phantom -- mcp tools

# Local installer pipeline
npm run release:local
npm run installer:test-local

# Website
npm run website:dev
```

## Capability Snapshot

1. Context indexing: `Real`
2. Module system: `Real`
3. Integration scan/connect/doctor: `Beta`
4. MCP core server commands: `Beta`
5. One-line installer endpoint hosting: `Planned`

## Contributing

See `CONTRIBUTING.md`.

## License

MIT (see `LICENSE`).
