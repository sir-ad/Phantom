<p align="center">
  <pre>
░█▀█░█░█░█▀█░█▀█░▀█▀░█▀█░█▄█
░█▀▀░█▀█░█▀█░█░█░░█░░█░█░█░█
░▀░░░▀░▀░▀░▀░▀░▀░░▀░░▀▀▀░▀░▀
  </pre>
</p>

<h1 align="center">PHANTOM</h1>
<p align="center"><strong>The invisible force behind every great product.</strong></p>
<p align="center">Open-source PM operating system for the terminal age.</p>

## Install

```bash
# Recommended: GitHub-hosted installer
curl -fsSL https://raw.githubusercontent.com/sir-ad/Phantom/main/scripts/install.sh | sh

# npm global install directly from GitHub
npm install -g github:sir-ad/Phantom

# npx run without global install
npx -y github:sir-ad/Phantom --help
```

## Upgrade

```bash
# Upgrade PHANTOM in place
curl -fsSL https://raw.githubusercontent.com/sir-ad/Phantom/main/scripts/install.sh | sh -s -- --upgrade

# Local repo helper
npm run agents:upgrade
```

## Upgrade Agent Integrations

```bash
# Upgrade PHANTOM + refresh local agent skills + run integration checks
curl -fsSL https://raw.githubusercontent.com/sir-ad/Phantom/main/scripts/upgrade-agents.sh | sh

# Upgrade and connect specific targets
curl -fsSL https://raw.githubusercontent.com/sir-ad/Phantom/main/scripts/upgrade-agents.sh | sh -s -- codex cursor vscode claude-code
```

## Skills.sh Compatibility

```bash
# Check and update local agent skills (Codex/Cursor/Claude Code, etc.)
npx skills check
npx skills update
```

## First Run

```bash
phantom
phantom context add ./your-project
phantom swarm "Should we add social login?" --json
phantom prd create "Auth System"
```

## Capability Matrix

| Capability | Status |
|---|---|
| Context indexing and search | Real |
| Module registry and installation | Real |
| Deterministic swarm analysis | Real |
| PRD generation | Real |
| Screen analyze/audit (file metadata + rules) | Real |
| Runtime health command | Real |
| Integration scan/connect/doctor | Beta |
| MCP server tools and resources | Beta |
| One-line GitHub installer (`curl .../scripts/install.sh`) | Real |
| Hosted one-line endpoint `phantom.pm/install` | Planned |
| Hosted module marketplace | Planned |

## Core Commands

```bash
phantom --help
phantom status --json
phantom doctor --json
phantom integrate scan --json
phantom integrate doctor --json
phantom mcp tools --json
phantom docs generate --json
```

## Repository Structure

```text
packages/
  cli/         # command surface
  core/        # context, swarm, modules, runtime engines
  mcp-server/  # MCP contracts and transport
  tui/         # terminal UI rendering
  modules/     # module package scaffold
scripts/
  install.sh
  install.ps1
  upgrade-agents.sh
website/
```

## Build and Verify

```bash
npm install
npm run build
npm run test
npm run reality:check
npm run installer:test-local
```

## License

MIT (see `LICENSE`)
