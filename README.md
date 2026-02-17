<div align="center">

```text
░█▀█░█░█░█▀█░█▀█░▀█▀░█▀█░█▄█
░█▀▀░█▀█░█▀█░█░█░░█░░█░█░█░█
░▀░░░▀░▀░▀░▀░▀░▀░░▀░░▀▀▀░▀░▀
```

# Phantom

**The invisible force behind every great product.**

Open-source Product Management Operating System for the terminal age.

[![License](https://img.shields.io/github/license/sir-ad/Phantom?style=flat-square&color=00FF41)](./LICENSE)
[![Build](https://img.shields.io/github/actions/workflow/status/sir-ad/Phantom/ci.yml?branch=main&style=flat-square&label=build)](https://github.com/sir-ad/Phantom/actions)
[![Release](https://img.shields.io/github/v/release/sir-ad/Phantom?style=flat-square&color=00D4FF)](https://github.com/sir-ad/Phantom/releases)

[Installation](#installation) • [Documentation](./docs/README.md) • [Features](#features) • [Contributing](./docs/contributing.md)

</div>

---

## What is it?

Phantom is a terminal-based OS that turns LLMs into structured Product Managers. Connect any model (OpenAI, Anthropic, Gemini, Ollama) and get:

- **Interactive PM Chat**: Framework-aware conversations (RICE, JTBD).
- **Swarm Intelligence**: Multi-agent consensus debates.
- **PRD Generation**: Full spec writing from simple prompts.
- **Product Simulation**: Deterministic user journey simulations.
- **MCP Server**: Integration with Cursor, Windsurf, and Claude Desktop.

It's like **Claude Code for Product Management**.

## Installation

### One-line (Recommended)
```bash
curl -fsSL https://raw.githubusercontent.com/sir-ad/Phantom/main/scripts/install.sh | sh
```

### npm
```bash
npm install -g phantom-pm
```

See [docs/install.md](./docs/install.md) for Docker and manual builds.

## Quick Start

```bash
# 1. Start interactive chat
phantom

# 2. Configure a model (Gemini, OpenAI, Anthropic, or local Ollama)
phantom config setup

# 3. Generate a PRD
phantom prd "Dark Mode for iOS App"

# 4. Run a swarm debate
phantom swarm "Should we build a mobile app or PWA?"
```

## Features

| Command | Description |
|---------|-------------|
| `phantom` | Interactive chat REPL with streaming & philosophy |
| `phantom swarm` | AI agent consensus debate |
| `phantom prd` | Generate Product Requirements Documents |
| `phantom simulate` | Run product simulations |
| `phantom agents` | Discover & register with local AI agents |
| `phantom mcp` | Run as MCP server for IDEs |

Full list in [docs/features.md](./docs/features.md).

## Agents & MCP

Phantom auto-detects and integrates with:
> Cursor · Windsurf · VS Code · Claude Desktop · Zed · Cline · Continue · Aider · Copilot · Ollama · LM Studio

Run `phantom register --all` to connect Phantom to all of them.

## Documentation

Full documentation is available at [docs/](./docs/README.md).

- [Architecture](./docs/architecture.md)
- [MCP Server Guide](./docs/mcp.md)
- [Module System](./docs/modules.md)

## License

MIT. See [LICENSE](./LICENSE).
