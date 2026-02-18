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

**AI-native PM Operating System — 23 modules, local-first, consulting-grade intelligence.**

[![License: MIT](https://img.shields.io/badge/license-MIT-00FF41?style=flat-square)](./LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/sir-ad/Phantom/ci.yml?branch=main&style=flat-square&label=build&color=00FF41)](https://github.com/sir-ad/Phantom/actions)
[![Release](https://img.shields.io/github/v/release/sir-ad/Phantom?style=flat-square&color=00D4FF&label=release)](https://github.com/sir-ad/Phantom/releases)
[![Docs](https://img.shields.io/badge/docs-live-00FF41?style=flat-square)](https://sir-ad.github.io/Phantom/)
[![Node](https://img.shields.io/badge/node-%3E%3D20-00D4FF?style=flat-square)](https://nodejs.org)
[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Linux%20%7C%20Windows-333?style=flat-square)](./)
[![Modules](https://img.shields.io/badge/modules-23-FF6B35?style=flat-square)](./)

[Install](#install) · [Modules](#module-system--23-superpowers) · [Phantom Oracle](#phantom-oracle-universal-agent) · [MCP Setup](#mcp-integration) · [Docs](https://sir-ad.github.io/Phantom/) · [Contributing](./CONTRIBUTING.md)

</div>

---

## What is Phantom?

Phantom is a **terminal-native operating system** that gives LLMs structured product management superpowers. Connect any model — OpenAI, Anthropic, Gemini, or local Ollama — and get an AI PM co-pilot that thinks in **McKinsey/BCG frameworks**.

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│   You  ──→  Phantom  ──→  LLM  ──→  Structured Output               │
│                │                                                     │
│         ┌─────┼─────────────────┐                                    │
│    Frameworks  │  Agents         │  Modules                           │
│    (18 FWs)    │  (7 PMs)        │  (23 tools)                        │
│    RICE,JTBD   │  Strategist,    │  PRDs, Decks,                     │
│    MECE,BCG    │  Analyst...     │  BCG Matrix...                    │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

### 🔮 Chrome Extension (Development)
1. Navigate to `packages/chrome-extension`.
2. Run `npm install && npm run build`.
3. Open Chrome and go to `chrome://extensions/`.
4. Enable **Developer Mode**.
5. Click **Load Unpacked** and select the `packages/chrome-extension/dist` folder.

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
phantom mece analyze "Auth flows"  # MECE validation
phantom bcg analyze                # BCG matrix analysis
phantom task analyze "Build a SaaS" # Recursive task decomposition 🧠
```

---

## 🦅 Sprint 5: Wings of Depth (Universal Agent)

Phantom has evolved from a CLI tool into a **Universal Agent** that follows you across the web.

### 🔮 Phantom Oracle (Chrome Extension)
A "New Tab" experience that connects your web research to your product strategy.
- **Context Awareness**: Content scripts read your active LLM chats (ChatGPT, Claude, Gemini).
- **Philosophical Calibration**: Analyzes your current challenges and surfaces relevant philosophical insights (Marcus Aurelius on bugs, Nietzsche on purpose).
- **Local Integration**: Everything is processed by your local Phantom instance.

### 🧠 Deep Task Analysis
Recursive task decomposition inspired by high-performance engineering teams.
- **`phantom task analyze <goal>`**: Breaks goals into hierarchical subtasks.
- **Complexity Scoring**: AI-driven 1-10 difficulty assessment.
- **Agent Assignment**: Recommends specialized agents (Coder, Architect, Researcher) for each node.

### 🤝 Agent-to-Agent Protocols
Standardized communication for agents talking to agents, compatible with MCP and OpenClaw.

---

## Module System — 23 Superpowers

Every module is an installable PM superpower. Install with `phantom install <name>`.

### Core PM Modules

| Module | What it does | Quote |
|--------|-------------|-------|
| `prd-forge` | Generate full PRDs from natural language | _"I know PRDs."_ |
| `story-writer` | Auto-generate user stories + acceptance criteria | _"I know user stories."_ |
| `sprint-planner` | AI sprint planning with velocity tracking | _"I know velocity."_ |
| `swarm` | 7-agent consensus analysis on any question | _"We know everything."_ |
| `competitive` | Competitor monitoring + market positioning | _"I know your enemies."_ |
| `analytics-lens` | Connect analytics → surface actionable insights | _"I know the numbers."_ |
| `oracle` | Monte Carlo sims, prediction, risk analysis | _"I know the future."_ |
| `experiment-lab` | Design A/B tests + analyze results | _"I know the truth."_ |
| `ux-auditor` | Automated UX audits + WCAG compliance | _"I know the user."_ |
| `time-machine` | Version product decisions, what-if analysis | _"I know the past."_ |
| `figma-bridge` | Connect Figma designs → PRDs → dev tasks | _"I know design."_ |
| `bridge` | PM ↔ Dev translation engine | _"I know both worlds."_ |

### Beta Modules

| Module | What it does |
|--------|-------------|
| 🆕 `autopilot` | Break goals into steps → execute autonomously |
| 🆕 `mind-map` | Generate visual concept maps from ideas |
| 🆕 `scope-guard` | Detect scope creep in PRDs + feature bloat |
| 🆕 `retro-ai` | AI-powered sprint retrospectives |
| 🆕 `stakeholder-sim` | Simulate stakeholder reactions before presenting |

### 🧠 Consulting Superpowers _(McKinsey / BCG grade)_

| Module | Framework | What it does |
|--------|-----------|-------------|
| 🏛️ `mece-lens` | **MECE Analysis** | Validates feature sets are mutually exclusive & collectively exhaustive |
| 🌳 `issue-tree` | **Hypothesis-Driven PS** | Decomposes problems into testable hypothesis trees |
| 📊 `bcg-matrix` | **BCG Growth-Share** | Classifies features as Stars / Cash Cows / Question Marks / Dogs |
| 📑 `deck-forge` | **Pyramid Principle** | Generates presentation outlines (Situation→Complication→Resolution) |
| 📋 `exec-brief` | **Executive One-Pager** | Creates C-suite ready briefs from PRDs and analysis |
| 🔍 `porter-scan` | **Porter's Five Forces** | Competitive landscape analysis for product positioning |
| 🧠 `task-master` | **Recursive Decomposition** | Recursive goal breakdown with complexity + assignment |
| 🔮 `oracle` | **Contextual Calibration** | The brain behind 'Phantom Oracle' Chrome Extension |

```bash
# Consulting examples
phantom mece analyze "Our feature categories"
phantom issue-tree build "Why is user retention dropping?"
phantom bcg classify "Dark mode" --growth high --share low
phantom deck create "Q4 Product Strategy Review"
phantom brief generate --input prd.md --format ceo
phantom porter analyze "Project management SaaS market"
```

---

## MCP Integration

Phantom runs as an MCP server — plug it into any AI IDE with a single config.

### Cursor

Add to `~/.cursor/mcp.json` (or `.cursor/mcp.json` per project):

```json
{
  "mcpServers": {
    "phantom-pm": {
      "command": "npx",
      "args": ["-y", "@phantom-pm/cli", "mcp", "serve"],
      "env": {
        "OPENAI_API_KEY": "YOUR_KEY",
        "ANTHROPIC_API_KEY": "YOUR_KEY"
      }
    }
  }
}
```

### Windsurf

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "phantom-pm": {
      "command": "npx",
      "args": ["-y", "@phantom-pm/cli", "mcp", "serve"]
    }
  }
}
```

### VS Code

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "phantom-pm": {
      "command": "npx",
      "args": ["-y", "@phantom-pm/cli", "mcp", "serve"],
      "type": "stdio"
    }
  }
}
```

### Claude Code

```bash
claude mcp add phantom-pm -- npx -y @phantom-pm/cli mcp serve
```

---

## Agent Integrations

Phantom auto-detects and orchestrates **11 AI development environments**:

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

## 18 Built-in Frameworks

Phantom thinks in **industry-standard frameworks**:

| Category | Frameworks |
|----------|-----------|
| **Prioritization** | RICE Scoring · MoSCoW · ICE Scoring · Opportunity Scoring |
| **Strategy** | Lean Canvas · Value Proposition · North Star · Story Mapping |
| **Analysis** | Kano Model · AARRR Pirate Metrics · Jobs-to-be-Done · Impact Mapping |
| **Consulting** | MECE Analysis · Pyramid Principle · Issue Tree · BCG Matrix · Porter's Five Forces · McKinsey 7S |

---

## Architecture

```
phantom/
├── packages/
│   ├── cli/            # Command-line interface + REPL
│   ├── core/           # Context engine, AI manager, module system, brand config
│   ├── mcp-server/     # Model Context Protocol server
│   ├── modules/        # 23 built-in PM modules
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
| **A PM** | AI agents that think in McKinsey/BCG frameworks |
| **A founder** | Instant PRDs, competitive analysis, executive briefs |
| **A consultant** | MECE validation, issue trees, Porter's analysis on demand |
| **An AI engineer** | MCP server that plugs into any agent workflow |
| **Anyone with an idea** | Consulting-grade thinking → actionable output |

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
 "The Matrix has you... but Phantom has your product strategy."
```

**[⬆ Back to top](#)**

</div>
