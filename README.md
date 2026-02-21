<div align="center">

```text
░█▀█░█░█░█▀█░█▀█░▀█▀░█▀█░█▄█
░█▀▀░█▀█░█▀█░█░█░░█░░█░█░█░█
░▀░░░▀░▀░▀░▀░▀░▀░░▀░░▀▀▀░▀░▀
```

  <h1>Phantom OS</h1>
  <p><strong>The Super Intellect Operating System for Product Managers.</strong></p>
  <p>
    <a href="https://sir-ad.github.io/Phantom/">Website</a> •
    <a href="https://sir-ad.github.io/Phantom/docs.html">Documentation</a> •
    <a href="https://github.com/sir-ad/Phantom">GitHub</a>
  </p>
</div>

---

### **Cursor for Product Managers.**
Phantom OS is an AI-native operating system that automates the manual labor of product discovery. It synthesizes customer interviews, usage data, and feedback into actionable specs and executable tasks for engineering agents.

### **Quick Install**
Boot the local intellect on your machine in under 60 seconds:

```bash
npm install -g @phantom-pm/cli@latest
phantom config --interactive
phantom server
```

---

### **What It Does**
- **Automated Synthesis**: Transform 10 hours of customer interviews into JTBD insights in seconds.
- **Discovery Loops**: Continuous background analysis that identifies exactly what to build next.
- **Agent-Ready Output**: Generates specs optimized for Cursor, Windsurf, and Claude Code.
- **Evidence-Based**: Every recommendation is cited with raw customer quotes and usage data.
- **Multi-Model Intelligence**: Fluidly chain DeepSeek, Claude, Gemini, and OpenAI providers.

---

### **The Trinity Architecture**

**1. The Swarm (The Mind)**  
A distributed network of specialized agents working in consensus to solve product strategy. It automatically synthesizes Jira, Slack, and Notion into a singular, high-fidelity source of truth.

**2. OpenClaws (The Hands)**  
Autonomous browser agents that control OS-level interactions. It executes visual audits, highlights UI inconsistencies against Figma, and verifies staging servers with human-like agency.

**3. Rowboat (The Memory)**  
A semantic Knowledge Graph that functions as a long-term product brain. It maps every interview and thread as an interconnected concept, ensuring no insight is ever lost to time.

---

### **AI Providers**

| Provider | Model Support | Primary Use |
| :--- | :--- | :--- |
| **Anthropic** | Claude 3.7 Sonnet | Logic, reasoning, and spec generation |
| **Ollama** | Llama 3, DeepSeek | Local, private inference and experimentation |
| **OpenAI** | o3-mini, GPT-4o | High-speed planning and task orchestration |
| **Google** | Gemini 2.0 Flash | Long-context ingestion and multimodal analysis |
| **DeepSeek** | DeepSeek-R1 | Complex problem solving and chain-of-thought |

---

### **The Intelligence Modules**

| Module | Description |
| :--- | :--- |
| **Interview Analyzer** | Transform customer transcripts into pain points and JTBD insights. |
| **Feedback Hub** | Aggregates Slack, Intercom, and Zendesk into unified feature themes. |
| **Usage Intelligence** | Connects Mixpanel/Amplitude data to feature adoption and churn insights. |
| **Discovery Loop** | Automated "what to build next" engine with opportunity scoring. |
| **Agent Communicator** | Translates PM decisions into executable tasks for engineering agents. |
| **PRD Forge** | Generates high-fidelity Product Requirements Documents from raw context. |
| **Swarm Orchestrator** | Multi-agent consensus mechanism for complex product strategy. |
| **OS Agent (OpenClaws)** | Local edge node for visual browser automation and desktop control. |
| **MCP Server** | Standardized interface for Cursor, Windsurf, and Claude Desktop. |
| **Story Writer** | Converts PRDs into Jira-ready user stories and acceptance criteria. |
| **Sprint Planner** | Automated estimation and task sequencing for development cycles. |
| **Analytics Lens** | Deep behavioral pattern detection across multiple telemetry data silos. |
| **Phantom Oracle** | Browser extension for real-time strategy and context calibration. |
| **Competitive Intel** | Automated tracking and analysis of competitor feature sets and pricing. |
| **Experiment Lab** | Design and track A/B tests with automated outcome projection. |
| **UX Auditor** | Heuristic evaluation and visual consistency checking via browser agents. |
| **Figma Bridge** | Bidirectional sync between designer intent and implementation code. |
| **Time Machine** | Revision tracking and rollback for product strategy and specifications. |
| **Memory Engine** | Semantic Knowledge Graph for long-term product context retention. |
| **Docs Engine** | Automated documentation generation for APIs and user experience flows. |
| **Chat Server** | High-performance backend for real-time collaboration and agent chat. |
| **Bridge** | Inter-process communication layer between specialized agent nodes. |
| **Integrations** | Native connectors for Slack, Linear, GitHub, and enterprise CRMs. |

---

### **Integrations**

**Claude Desktop**  
Add to your `claude_desktop_config.json`:
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

**Cursor & Windsurf**  
Add a new MCP server in Settings pointing to:  
`npx -y @phantom-pm/mcp-server@latest`

**VS Code**  
Activate via the Phantom CLI:  
`phantom boot --ext vscode`

---

### **Troubleshooting**

**Error: 429 Too Many Requests**  
→ **Cause**: Ollama is hitting a remote proxy.  
→ **Fix**: `export OLLAMA_BASE_URL=http://localhost:11434`

**Error: zsh: command not found: phantom**  
→ **Fix**: `npm install -g @phantom-pm/cli` OR `source ~/.zshrc`

**Error: Port 3333 already in use**  
→ **Fix**: `kill $(lsof -ti:3333)` then re-run server.

**Error: Intent: unknown | Confidence: 0%**  
→ **Cause**: AI provider not configured.  
→ **Fix**: Run `phantom config --interactive`

**Error: Routing failed — API key missing**  
→ **Fix**: Set key in Settings panel OR `export ANTHROPIC_API_KEY=sk-ant-...`

---

### **Contributing**
We build in public. Fork, implement a module, and submit a PR. See `CONTRIBUTING.md` for our agent-first coding standards.

### **License**
Phantom OS is MIT Licensed. Built for the future of product development.
