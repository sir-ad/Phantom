<div align="center">
  <img src="packages/app/public/phantom-logo.png" alt="Phantom Logo" width="120" />
  <h1>Phantom OS</h1>
  <p><em>The Super Intellect Operating System for Product Managers.</em></p>
  <p>
    <a href="https://phantom.pm">Website</a> •
    <a href="https://docs.phantom.pm">Documentation</a> •
    <a href="https://github.com/sir-ad/Phantom">GitHub</a>
  </p>
</div>

---

## 👁️ The Vision: Cursor for PMs

Phantom is an open-source, AI-native operating system designed to automate and elevate the entire product discovery and execution loop. It is not just a web application; it is an intelligent **Product Management Swarm**.

Built with the extreme engineering simplicity championed by **Kailash Nadh** (Zerodha) and the deep, philosophical AI-first design of **Paras Chopra**, Phantom acts as a "Super Intellect". It absorbs enterprise context, translates spoken brainstorming into deterministic product specifications, visualizes code natively via Generative Sandboxes, and can physically pilot your desktop OS.

**We believe the future of software creation is context.** If developers have Cursor, Product Managers have Phantom.

## 🚀 The Super Intellect Architecture

Phantom is designed as a central **Brain** that drives various **Hands** (Agents). 

1. **Universal SOTA Models:** Natively routes reasoning tasks to the absolute frontier of open-source and proprietary models: `deepseek-r1`, `o3-mini`, `claude-3.7-sonnet`, `gemini-2.5-pro`, and exhaustive local Ollama support (`llama3.1`, `qwen2.5`, `phi3`).
2. **Rowboat Semantic Knowledge Graph:** Instead of simple vector search, Phantom ingests your Jira backlog, Slack histories, and Notion PRDs into a 1st-degree connected **Semantic Knowledge Graph**. It knows *who* asked for a feature, *where* it was discussed, and *what* code blocks it.
3. **Generative Matrix UI (OpenUI):** Taking inspiration from `v0.dev` and W&B OpenUI, Phantom's Next.js Canvas natively renders and compiles interactive React/Tailwind components directly from the Swarm's generated artifacts.
4. **WisprFlow Voice Brain-Dumps:** Translate your raw, unstructured spoken thoughts accurately into Phantom's Omnibar, letting the Swarm organize the chaos into structured Jira Epics and architectural PRDs.
5. **OpenClaws (OS Gateway & Edge Nodes):** Phantom breaks out of the Browser sandbox via a distributed WebSocket Gateway. By booting a local `@phantom-pm/os-agent` Edge Node, you grant Phantom physical control over your Mac/PC to automatically capture screenshots, move the mouse, and type terminal commands using Anthropic's `computer_20241022` tools.
6. **Nightly Build Swarm:** Record a brain dump at 5 PM. By 9 AM, the autonomous Phantom routines have parallelized your thoughts to write a systemic PRD, mock the UI, and generate assigned Jira tickets.

## 📦 Packages (The Great Pruning)

Phantom's monorepo is ruthlessly pruned. There is no bloat. Only signal.

| Package | Description |
|---------|-------------|
| `@phantom-pm/core` | The beating heart. The AI Manager, Rowboat Graph Context Engine, OpenClaws Gateway, and Swarm Orchestrator. |
| `@phantom-pm/app` | The "Matrix/Codex" UI. A radical, terminal-inspired Next.js command center embedding Sandpack for live generative code. |
| `@phantom-pm/os-agent` | The physical Hands. A local Edge Node connecting Phantom back to your physical desktop OS. |
| `@phantom-pm/mcp-server` | The protocol interface allowing Claude, Cursor, and other tools to tap directly into Phantom's product brain natively. |
| `@phantom-pm/cli` | The terminal interface for headless operation. |

## ⚡ Getting Started

The fastest way to install Phantom OS is via our one-line installer:

```bash
curl -sSL https://raw.githubusercontent.com/sir-ad/Phantom/master/install.sh | bash
```

Alternatively, you can install via NPM:

```bash
npm install -g @phantom-pm/cli
```

### From Source
```bash
# Clone the intellect
git clone https://github.com/sir-ad/Phantom.git
cd Phantom

# Install dependencies
npm install

# Boot the Core Brain (Next.js Dashboard + OS Gateway)
npm run dev

# (Optional) Boot the physical OS Edge Node in a new terminal
npx @phantom-pm/os-agent
```

## 🧠 Core Philosophy

1. **No Blank Canvases:** Product Managers shouldn't start from scratch. Phantom reads the world state and proposes the optimal next move.
2. **Deterministic Output:** AI output must be structurally reliable for enterprise consumption.
3. **Open Ecosystem:** If a tool has an MCP, Phantom can use it. If an OS has a mouse, Phantom can control it.
4. **Minimalist Exuberance:** Beneath a data-dense, radically simple UI lies an architecture of immense power and scalability.

## 🤝 Contributing

We welcome contributions from builders who share the vision of an AI-native product workflow. Please read our `PHANTOM_RULES.md` before submitting a PR to align with the core architectural mandates.

---

<div align="center">
  <em>There is no spoon. There is only context.</em>
</div>
