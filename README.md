<div align="center">

```
 ░█▀█░█░█░█▀█░█▀█░▀█▀░█▀█░█▄█
 ░█▀▀░█▀█░█▀█░█░█░░█░░█░█░█░█
 ░▀░░░▀░▀░▀░▀░▀░▀░░▀░░▀▀▀░▀░▀

```

### `The invisible force behind every great product.`

**AI-native PM Operating System — 23 modules, local-first, consulting-grade intelligence.**

[![License: MIT](https://img.shields.io/badge/license-MIT-00FF41?style=flat-square)](./LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/sir-ad/Phantom/ci.yml?branch=main&style=flat-square&label=build&color=00FF41)](https://github.com/sir-ad/Phantom/actions)
[![Release](https://img.shields.io/github/v/release/sir-ad/Phantom?style=flat-square&color=00D4FF&label=release)](https://github.com/sir-ad/Phantom/releases)
[![Docs](https://img.shields.io/badge/docs-live-00FF41?style=flat-square)](https://sir-ad.github.io/Phantom/)
[![Node](https://img.shields.io/badge/node-%3E%3D20-00D4FF?style=flat-square)](https://nodejs.org)
[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Linux%20%7C%20Windows-333?style=flat-square)](./)

[Install](#install) · [Modules](#module-system) · [Phantom Oracle](#phantom-oracle) · [Task Analysis](#deep-task-analysis) · [Docs](https://sir-ad.github.io/Phantom/docs/intro) · [Contributing](./CONTRIBUTING.md)

</div>

---

## ⚡️ What is Phantom?

Phantom is a **terminal-native operating system** that gives LLMs structured product management superpowers. Connect any model — OpenAI, Anthropic, Gemini, or local Ollama — and get an AI PM co-pilot that thinks in **McKinsey/BCG frameworks**.

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│   You  ──→  Phantom  ──→  LLM  ──→  Structured Output                │
│                │                                                     │
│         ┌──── ─┼─────────────────┐                                    │
│    Frameworks  │  Agents         │  Modules                          │
│    (18 FWs)    │  (7 PMs)        │  (23 tools)                       │
│    RICE,JTBD   │  Strategist,    │  PRDs, Decks,                     │
│    MECE,BCG    │  Analyst...     │  BCG Matrix...                    │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 📥 Install

```bash
# Run instantly with npx (Recommended)
npx @phantom-pm/cli --tag next

# Or install globally
npm install -g @phantom-pm/cli
```

```bash
# Quick start
phantom                            # Interactive PM chat
phantom config setup               # Connect your LLM
phantom prd "Dark Mode for iOS"    # Generate a PRD
phantom swarm "Mobile app or PWA?" # 7 agents debate it
```

---

## 🦅 Features

### 🔮 Phantom Oracle (Chrome Extension)

A "New Tab" experience that connects your web research to your product strategy.

-   **Description**: Transforms your new tab into a focus dashboard that analyzes your active LLM chats and surfaces relevant philosophical calibration.
-   **Key Benefit**: Keeps you aligned with your core product vision while you research.
-   **[Read Full Documentation](https://sir-ad.github.io/Phantom/docs/features/oracle)**

#### Installation

1.  **Build**: `cd packages/chrome-extension && npm run build`
2.  **Load**: Open `chrome://extensions/` -> Enable **Developer Mode** -> Click **Load Unpacked**.
3.  **Select**: Choose the `packages/chrome-extension/dist` folder.

### 🧠 Deep Task Analysis (Level 4 Intelligence)

Recursive task decomposition inspired by high-performance engineering teams.

-   **Command**: `phantom task analyze "Build a SaaS"`
-   **How it Works**: breaks goal into subtasks -> assigns complexity scores (1-10) -> recursively breaks down high-complexity nodes -> assigns specialized agents (`Coder`, `Architect`, `Researcher`) to each leaf node.
-   **[Read Full Documentation](https://sir-ad.github.io/Phantom/docs/features/analyze)**

---

## 📦 Module System

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

### Consulting Superpowers _(McKinsey / BCG grade)_

| Module | Framework | What it does |
|--------|-----------|-------------|
| 🏛️ `mece-lens` | **MECE Analysis** | Validates feature sets are mutually exclusive |
| 🌳 `issue-tree` | **Hypothesis-Driven PS** | Decomposes problems into testable hypothesis trees |
| 📊 `bcg-matrix` | **BCG Growth-Share** | Classifies features as Stars / Cash Cows / Question Marks / Dogs |
| 📑 `deck-forge` | **Pyramid Principle** | Generates presentation outlines (Situation→Complication→Resolution) |
| 📋 `exec-brief` | **Executive One-Pager** | Creates C-suite ready briefs from PRDs and analysis |

---

## 🔌 MCP Integration

Phantom runs as an MCP server — plug it into any AI IDE with a single config.

### Quick Setup

**Cursor / Windsurf / VS Code / Claude Code:**

```bash
npx -y @phantom-pm/cli mcp serve
```

See [**Full MCP Documentation**](https://sir-ad.github.io/Phantom/docs/mcp) for detailed configuration files.

---

## 🏗️ Architecture

```
phantom/
├── packages/
│   ├── cli/            # Command-line interface + REPL
│   ├── core/           # Context engine, AI manager, module system
│   ├── mcp-server/     # Model Context Protocol server
│   ├── chrome-extension/ # Phantom Oracle (New Tab experience)
│   ├── modules/        # 23 built-in PM modules
│   └── integrations/   # IDE auto-detection + registration
├── docs-site/          # Zola documentation site
└── scripts/            # Build, release, install scripts
```

---

## 📜 License

[MIT](./LICENSE) — Adarsh Agrahari, 2026.

<div align="center">

```
 "The Matrix has you... but Phantom has your product strategy."
```

**[⬆ Back to top](#)**

</div>
