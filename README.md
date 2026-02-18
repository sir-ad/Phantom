<div align="center">

```
 ██████╗ ██╗  ██╗ █████╗ ███╗   ██╗████████╗ ██████╗ ███╗   ███╗
 ██╔══██╗██║  ██║██╔══██╗████╗  ██║╚══██╔══╝██╔═══██╗████╗ ████║
 ██████╔╝███████║███████║██╔██╗ ██║   ██║   ██║   ██║██╔████╔██║
 ██╔═══╝ ██╔══██║██╔══██║██║╚██╗██║   ██║   ██║   ██║██║╚██╔╝██║
 ██║     ██║  ██║██║  ██║██║ ╚████║   ██║   ╚██████╔╝██║ ╚═╝ ██║
 ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝    ╚═════╝ ╚═╝     ╚═╝
```

### `The invisible force behind every great product.`

**Open-source PM Operating System that turns any LLM into a structured Product Manager.**

[![License: MIT](https://img.shields.io/badge/license-MIT-00FF41?style=flat-square)](./LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/sir-ad/Phantom/ci.yml?branch=main&style=flat-square&label=build&color=00FF41)](https://github.com/sir-ad/Phantom/actions)
[![Release](https://img.shields.io/github/v/release/sir-ad/Phantom?style=flat-square&color=00D4FF&label=release)](https://github.com/sir-ad/Phantom/releases)
[![Docs](https://img.shields.io/badge/docs-live-00FF41?style=flat-square)](https://sir-ad.github.io/Phantom/)
[![Node](https://img.shields.io/badge/node-%3E%3D18-00D4FF?style=flat-square)](https://nodejs.org)
[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Linux%20%7C%20Windows-333?style=flat-square)](.)

[Install](#install) · [Features](#superpowers) · [Docs](https://sir-ad.github.io/Phantom/) · [Contributing](./CONTRIBUTING.md)

</div>

---

## What is Phantom?

Phantom is a **terminal-native operating system** that gives LLMs structured product management superpowers. Connect any model — OpenAI, Anthropic, Gemini, or local Ollama — and get an AI-powered PM co-pilot that actually _thinks_ in frameworks.

It's like **Claude Code for Product Management.**

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│   You  ──→  Phantom  ──→  LLM  ──→  Structured Output   │
│                │                                         │
│         ┌─────┴─────┐                                    │
│    Frameworks    Agents    Modules                        │
│    (RICE,JTBD)   (7 PMs)  (17 tools)                     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Install

```bash
# One-liner (recommended)
curl -fsSL https://raw.githubusercontent.com/sir-ad/Phantom/main/scripts/install.sh | sh

# Or via npm
npm install -g phantom-pm
```

```bash
# Quick start
phantom                            # Interactive PM chat
phantom config setup               # Connect your LLM
phantom prd "Dark Mode for iOS"    # Generate a PRD
phantom swarm "Mobile app or PWA?" # 7 agents debate it
```

---

## Superpowers

### Core Commands

| Command | What it does |
|---------|-------------|
| `phantom` | Interactive chat REPL — streaming, philosophy, frameworks |
| `phantom chat` | Framework-aware PM conversations (RICE, JTBD, MoSCoW) |
| `phantom swarm` | Deploy 7 specialized PM agents for consensus analysis |
| `phantom prd` | Generate complete Product Requirements Documents |
| `phantom simulate` | Run deterministic product simulations with personas |
| `phantom agents` | Discover & register with local AI agents |
| `phantom mcp` | Run as MCP server for IDE integration |
| `phantom doctor` | System health check |

### Module System — 17 Superpowers

Every module is an installable PM superpower. Install with `phantom install <name>`.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PHANTOM MODULES                              │
├───────────────────┬─────────────────────────────────────────────────┤
│ prd-forge         │ Generate full PRDs from natural language        │
│ story-writer      │ Auto-generate user stories + acceptance criteria│
│ sprint-planner    │ AI sprint planning with velocity tracking       │
│ swarm             │ 7-agent consensus analysis on any question      │
│ competitive       │ Competitor monitoring + market positioning      │
│ analytics-lens    │ Connect analytics → surface actionable insights │
│ oracle            │ Monte Carlo sims, prediction, risk analysis     │
│ experiment-lab    │ Design A/B tests + analyze results              │
│ ux-auditor        │ Automated UX audits + WCAG compliance           │
│ time-machine      │ Version product decisions, what-if analysis     │
│ figma-bridge      │ Connect Figma designs → PRDs → dev tasks        │
│ bridge            │ PM ↔ Dev translation engine                     │
├───────────────────┼─────────────────────────────────────────────────┤
│ 🆕 autopilot      │ Break goals into steps → execute autonomously   │
│ 🆕 mind-map       │ Generate visual concept maps from ideas         │
│ 🆕 scope-guard    │ Detect scope creep in PRDs + feature bloat      │
│ 🆕 retro-ai       │ AI-powered sprint retrospectives                │
│ 🆕 stakeholder-sim│ Simulate stakeholder reactions before presenting│
└───────────────────┴─────────────────────────────────────────────────┘
```

---

## Agent Integrations

Phantom auto-detects and integrates with **11 AI development environments**:

```
 Cursor · Windsurf · VS Code · Claude Desktop · Zed
 Cline · Continue · Aider · Copilot · Ollama · LM Studio
```

```bash
phantom agents            # See what's running
phantom register --all    # Connect to everything
phantom mcp start         # Run as MCP server
```

---

## AI Providers

| Provider | Setup | Local? |
|----------|-------|--------|
| **Ollama** | `phantom config set provider ollama` | ✅ Yes |
| **OpenAI** | `phantom config set provider openai` | ❌ |
| **Anthropic** | `phantom config set provider anthropic` | ❌ |
| **Gemini** | `phantom config set provider gemini` | ❌ |

```bash
# Run 100% local with Ollama — zero data leaves your machine
ollama pull llama3 && phantom config set provider ollama
```

---

## Architecture

```
phantom/
├── packages/
│   ├── cli/            # Command-line interface + REPL
│   ├── core/           # Context engine, AI manager, module system
│   ├── mcp-server/     # Model Context Protocol server
│   ├── modules/        # 17 built-in PM modules
│   ├── tui/            # Terminal UI (Matrix theme)
│   └── integrations/   # IDE auto-detection + registration
├── docs-site/          # Docusaurus documentation
├── scripts/            # Build, release, install scripts
└── tests/              # Smoke + contract tests
```

---

## Who is Phantom for?

| You are... | Phantom gives you... |
|------------|---------------------|
| **A developer** | PM superpowers without leaving the terminal |
| **A PM** | AI agents that think in frameworks you know |
| **A founder** | Instant PRDs, competitive analysis, sprint plans |
| **An AI engineer** | MCP server that plugs into any agent workflow |
| **Anyone with an idea** | Structured thinking → actionable output |

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). We welcome PRs, module ideas, and bug reports.

```bash
git clone https://github.com/sir-ad/Phantom.git
cd phantom && npm install && npm run build && npm test
```

## License

[MIT](./LICENSE) — Adarsh Agrahari, 2026.

---

<div align="center">

```
 "The Matrix has you... but Phantom has your product."
```

**[⬆ Back to top](#)**

</div>
