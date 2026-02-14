<div align="center">

```text
░█▀█░█░█░█▀█░█▀█░▀█▀░█▀█░█▄█
░█▀▀░█▀█░█▀█░█░█░░█░░█░█░█░█
░▀░░░▀░▀░▀░▀░▀░▀░░▀░░▀▀▀░▀░▀
```

# PHANTOM

**The invisible force behind every great product.**

Open-source PM operating system for the terminal age.

[![License: MIT](https://img.shields.io/badge/License-MIT-00FF41.svg)](./LICENSE)
[![Node >=18](https://img.shields.io/badge/Node-%3E%3D18-0D1117.svg)](./package.json)
[![CLI](https://img.shields.io/badge/Interface-CLI%20%2B%20MCP-00D4FF.svg)](./packages/cli)

</div>

## Install

```bash
# One-line install (recommended)
curl -fsSL https://raw.githubusercontent.com/sir-ad/Phantom/main/scripts/install.sh | sh

# Upgrade
curl -fsSL https://raw.githubusercontent.com/sir-ad/Phantom/main/scripts/install.sh | sh -s -- --upgrade

# npm global install from GitHub tarball
npm install -g https://codeload.github.com/sir-ad/Phantom/tar.gz/refs/heads/main

# npx run without global install
npx -y https://codeload.github.com/sir-ad/Phantom/tar.gz/refs/heads/main --help
```

## Quick Start

```bash
phantom --help
phantom context add ./your-project
phantom swarm "Should we add social login?" --json
phantom prd create "Auth System"
phantom doctor --json
```

## Agent Self-Discovery

PHANTOM can detect local agent/IDE environments and register itself for MCP usage.

```bash
# Scan installed agents and IDEs
phantom agents scan --json

# Auto-register PHANTOM with detected tools
phantom agents register

# Check connection health
phantom agents health
phantom integrate doctor --json
```

Supported discovery targets include:
- Claude Code
- Codex
- Cursor
- VS Code
- Zed

## MCP Tools (Agent-Callable)

```bash
phantom mcp tools --json
phantom mcp serve --mode stdio
```

Core MCP tool contracts:
- `context.add`
- `context.search`
- `phantom_generate_prd`
- `phantom_swarm_analyze`
- `phantom_create_stories`
- `phantom_plan_sprint`
- `phantom_analyze_product`
- `bridge.translate_pm_to_dev`

Legacy aliases retained for compatibility:
- `prd.generate`
- `swarm.analyze`

## Capability Status

| Capability | Status |
|---|---|
| Context indexing/search | Real |
| PRD generation | Real |
| Deterministic swarm analysis | Real |
| Agent scan/register/list/network | Beta |
| Integration scan/connect/doctor | Beta |
| MCP server stdio tools/resources | Beta |
| Hosted `phantom.pm/install` endpoint | Planned |

## Repository Layout

```text
packages/
  cli/           # Command surface
  core/          # Context, swarm, discovery, runtime engines
  mcp-server/    # MCP contracts + stdio server
  tui/           # Terminal UI
  modules/       # Module package scaffold
  integrations/  # IDE integration packages (in progress)
scripts/
  install.sh
  install.ps1
  upgrade-agents.sh
website/
```

## Validate Locally

```bash
npm install
npm run build
npm run test
npm run reality:check
npm run installer:test-local
```

## License

MIT — see [`LICENSE`](./LICENSE)
