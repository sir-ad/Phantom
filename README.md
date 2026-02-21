<div align="center">

```text
░█▀█░█░█░█▀█░█▀█░▀█▀░█▀█░█▄█
░█▀▀░█▀█░█▀█░█░█░░█░░█░█░█░█
░▀░░░▀░▀░▀░▀░▀░▀░░▀░░▀▀▀░▀░▀
```

  <h1>Phantom OS</h1>
  <p><em>The Super Intellect Operating System for Product Managers.</em></p>
  <p>
    <a href="https://sir-ad.github.io/Phantom/">Website</a> •
    <a href="https://sir-ad.github.io/Phantom/docs.html">Documentation</a> •
    <a href="https://github.com/sir-ad/Phantom">GitHub</a>
  </p>
</div>

---

## 👁️ The Illusion of Control (The Problem)

Look at the screen of a modern Product Manager. What do you see?

A staggering, fragmented mess. Jira tickets cascading into an abyss. Notion pages that read like ancient, neglected scrolls. Slack channels screaming with disconnected context. The modern PM is not a visionary; they are a glorified stenographer. The tools we use were designed to build bureaucracy, not products. 

They force human minds to act as API glue between fundamentally broken, siloed systems. **We don’t need another SaaS tool. We need an entirely new paradigm.**

## 💊 The Singularity: Phantom OS (The Solution)

Phantom is not a web app. Phantom is a **Super Intellect**, a localized Operating System that lives in your terminal and your browser, observing, reasoning, and executing the mundane so you can return to the art of product design.

**If developers have Cursor, Product Managers have Phantom.**

Phantom combines the extreme, brutalist minimalism of a terminal with the omnipotent reach of autonomous intelligence. No bloated UIs. No infinite Kanban boards. Just you, a blinking cursor, and the invisible force behind every great product.

---

## 🚀 The Trinity Architecture

Phantom is designed as a central Brain that drives various Hands (Agents).

### 1. The Swarm (The Mind)
A network of state-of-the-art models (`deepseek-r1`, `o3-mini`, `claude-3.7-sonnet`, `gemini-2.5-pro`) working in asynchronous harmony. When you speak, Phantom summons a localized Swarm, distributing tasks in milliseconds. It synthesizes Jira, Notion, and Slack dynamically, compiling a singular source of truth in the background before you even ask for it.

### 2. OpenClaws (The Hands)
Intelligence without agency is just a book. Phantom has hands. 
With **OpenClaws**, Phantom breaks out of the terminal. It controls a headless browser instance. It navigates to staging servers, takes visual screenshots, parses the DOM, highlights UI inconsistencies against your Figma specs, and injects code on the fly. You don't tell the engineers the color is wrong. You tell Phantom, and Phantom opens the browser, sees the error, and submits the exact hex code fix.

### 3. Rowboat (The Memory)
Files and folders are dead. Phantom utilizes a semantic Knowledge Graph. Every conversation, every Slack extract, every user interview is mapped as a node. Phantom remembers the context of the Zoom call from six months ago without you having to search for it.

---

## ⚡ 1-Click Boot Sequence (Installation)

Phantom operates with YC-level speed. No cloning. No Node.js build steps. No configuration horror. 

Boot the Matrix natively on your machine in seconds:

```bash
# 1. Download the OS locally to ~/.phantom
npx @phantom-pm/cli@latest boot

# 2. Spin up the localized Intellect and Web Interface
npx @phantom-pm/cli@latest server
```

The server automatically exposes the Matrix UI locally. Open the provided `localhost` URL, and Phantom is awake.

---

## 🔌 MCP Server Integration

Phantom exposes a standard **Model Context Protocol (MCP)** server, enabling external AI IDEs (Cursor, Windsurf, Claude Desktop) to leverage Phantom's intelligence.

1. Add Phantom to your `claude_desktop_config.json` or IDE MCP settings:
```json
{
  "mcpServers": {
    "phantom": {
      "command": "npx",
      "args": ["-y", "@phantom-pm/mcp-server@latest"]
    }
  }
}
```
2. Phantom's `OpenCode` rules will automatically dynamically switch cloud providers, scrape local files, and grant your IDE new capabilities based on `AGENTS.md` parameters.


---

## 📦 Monorepo Architecture

Phantom's monorepo is ruthlessly optimized for performance, reliability, and modularity.

| Package | Description |
|---------|-------------|
| `@phantom-pm/core` | The engine for AI Management, Knowledge Graph extraction, and Swarm Orchestration. |
| `@phantom-pm/app` | The "Matrix/Codex" UI. A radical, terminal-inspired Next.js command center. |
| `@phantom-pm/os-agent` | Local Edge Node connecting Phantom back to your physical desktop for deep context ingestion. |
| `@phantom-pm/mcp-server` | The Model Context Protocol interface allowing Claude, Cursor, and other tools to tap into Phantom's brain. |
| `@phantom-pm/cli` | The terminal daemon orchestrating the entire `.phantom` local layer. |
| `@phantom-pm/browser-agent` | The autonomous Playwright executor for "OpenClaws" visual interactions. |

---

## 🧠 The YC Ethos

1. **Make Something People Want:** We strip away the PM bureaucracy to give you back the one thing that matters: time to talk to users and build great products.
2. **Move Fast, Don't Break Things:** AI output must be structurally reliable for enterprise consumption. Phantom ensures schemas are rigid so you can move blisteringly fast.
3. **Open Ecosystem:** If a tool has an MCP, Phantom can use it. We are the ultimate aggregator.
4. **"A computer is a bicycle for the mind."** Phantom is a cognitive exoskeleton for the Product Manager. 

---

<div align="center">
  <em>There is only context.</em>
</div>
