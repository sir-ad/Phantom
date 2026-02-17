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
[![CLI + MCP](https://img.shields.io/badge/Interface-CLI%20%2B%20MCP-00D4FF.svg)](./packages/cli)

*"The unexamined product is not worth building." — Phantom*

</div>

---

## ⚡ What is Phantom?

Phantom is an **open-source product management OS** that runs in your terminal. Connect any LLM — local or cloud — and get structured PM intelligence: PRDs, user stories, swarm analysis, competitive intel, sprint planning, and more.

Think of it as **Claude Code, but for Product Management.**

## 🚀 Quick Start

```bash
# Install
curl -fsSL https://raw.githubusercontent.com/sir-ad/Phantom/main/scripts/install.sh | sh

# OR with npm
npm install -g phantom-pm

# Launch (interactive mode)
phantom
```

That's it. Phantom boots up, connects to your model, and you're ready to go.

## 🧠 Connect Any Model

Phantom works with **any** LLM — local or cloud:

```bash
# Local (free) — Ollama
phantom chat --model ollama:llama3.1:8b

# OpenAI
export OPENAI_API_KEY="sk-..."
phantom chat --model gpt-4o

# Anthropic
export ANTHROPIC_API_KEY="sk-ant-..."
phantom chat --model claude

# Google Gemini
export GEMINI_API_KEY="..."
phantom chat --model gemini

# Interactive setup wizard
phantom config setup
```

### Supported Providers

| Provider | Models | Cost |
|----------|--------|------|
| **Ollama** | Llama 3.1, Mistral, CodeLlama, + any | 🟢 Free (local) |
| **OpenAI** | GPT-4o, GPT-4o-mini, o3-mini | 💳 API key |
| **Anthropic** | Claude Sonnet 4, Haiku, Opus | 💳 API key |
| **Gemini** | Gemini 2.0 Flash, 2.5 Pro, 1.5 Pro | 💳 API key |

## 💎 Features

### Interactive Chat
```
$ phantom

  ░█▀█░█░█░█▀█░█▀█░▀█▀░█▀█░█▄█
  ░█▀▀░█▀█░█▀█░█░█░░█░░█░█░█░█
  ░▀░░░▀░▀░▀░▀░▀░▀░░▀░░▀▀▀░▀░▀

  ◈ Initializing thought engine... ✓
  ◈ Connecting to ollama (llama3.1:8b)... ✓

  "Measure twice. Ship once. Iterate forever." — Phantom

phantom (ollama:llama3.1) ▸ Should we add social login?
```

### PM Superpowers

| Command | What it does |
|---------|-------------|
| `phantom` | Interactive chat with your connected model |
| `phantom swarm "question"` | 7-agent consensus analysis |
| `phantom prd create "Feature"` | Generate production-ready PRDs |
| `phantom simulate "scenario"` | Deterministic product simulation |
| `phantom screen "url"` | UX/accessibility audit |
| `phantom agents scan` | Discover AI agents on your system |
| `phantom register --all` | Auto-register Phantom with 16 agents |
| `phantom model` | List all available models |
| `phantom doctor` | System health check |

### MCP Server (for IDE Integration)

Phantom ships as an **MCP server** — connect it to Cursor, VS Code, Windsurf, Claude Desktop, or any MCP-compatible agent:

```bash
phantom mcp start         # Start MCP server
phantom register --all    # Auto-register with all detected agents
```

**13 MCP tools** available: PRD generation, swarm analysis, context management, agent discovery, competitive analysis, and more.

### Agent Discovery

Phantom detects and integrates with **16 AI agents**:

> Cursor · VS Code · Windsurf · Claude Code · Claude Desktop · Zed · Cline · Continue · Aider · Copilot · Ollama · LM Studio · OpenCode · Antigravity · and more

## 🏗️ Architecture

```
phantom/
├── packages/
│   ├── core/          # Engine: AI providers, discovery, config, runtime
│   ├── cli/           # Terminal interface + chat REPL
│   ├── mcp-server/    # Model Context Protocol server
│   ├── tui/           # Terminal UI components
│   ├── modules/       # Installable PM modules
│   └── integrations/  # IDE/agent integrations
├── website/           # Static site (GitHub Pages)
└── tests/             # Smoke + contract tests
```

## ⚙️ Configuration

```bash
# Interactive wizard (recommended)
phantom config setup

# Manual API key setup
phantom config set apiKeys.openai sk-...
phantom config set apiKeys.anthropic sk-ant-...
phantom config set apiKeys.gemini AIza...

# View configuration
phantom config env
```

## 🔧 Development

```bash
git clone https://github.com/sir-ad/Phantom.git
cd phantom
npm install
npm run build
npm run test

# Run locally
node packages/cli/dist/index.js
```

## 📄 License

MIT — build whatever you want.

---

<div align="center">

**Built for product people who live in the terminal.**

[Website](https://sir-ad.github.io/Phantom) · [Issues](https://github.com/sir-ad/Phantom/issues) · [Contributing](./CONTRIBUTING.md)

</div>
