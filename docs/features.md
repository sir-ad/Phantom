# Features

Phantom combines the power of LLMs with structured product management frameworks.

## 1. Interactive PM Chat

The core experience. Connect any model and have a context-aware conversation about your product.

```bash
phantom
```

- **Framework-Aware**: Phantom applies RICE, MoSCoW, Kanban, and JTBD thinking automatically.
- **Streaming**: Real-time responses.
- **Model Agnostic**: Switch between GPT-4o, Claude 3.5, Gemini 1.5, or local Llama 3 models.

Commands:
- `/model <name>`: Switch model instantly.
- `/clear`: Reset context.
- `/help`: Show command list.

## 2. Swarm Intelligence

Simulate a team of expert agents debating a problem to reach consensus.

```bash
phantom swarm "Should we pivot to enterprise sales?"
```

**The Agents:**
- **Strategist**: Market fit & business logic.
- **Visionary**: Long-term impact & innovation.
- **User Advocate**: UX & customer needs.
- **Technologist**: Feasibility & implementation.
- **Skeptic**: Risk analysis.

The output is a synthesized recommendation based on multi-perspective analysis.

## 3. PRD Generation

Generate comprehensive Product Requirements Documents from a simple feature title.

```bash
phantom prd "Dark Mode for Mobile App"
```

Generates a Markdown file with:
- Problem Statement
- User Stories
- Technical Requirements
- Success Metrics (KPIs)
- Riskiest Assumptions
- GTM Strategy

## 4. Product Simulation

Simulate user behavior or market reaction to a feature before building it.

```bash
phantom simulate "User onboarding flow for non-tech savvy users"
```

Phantom runs a deterministic simulation of the user journey, identifying friction points and potential drop-offs.

## 5. UX Audit

Analyze a live website or design mockup for usability issues.

```bash
phantom screen "https://example.com"
```

*Note: Requires vision-capable model (GPT-4o, Claude 3.5 Sonnet, Gemini Pro).*

## 6. Agent Discovery

Find all AI agents installed on your system.

```bash
phantom agents scan
```

Detects: Cursor, Windsurf, VS Code, Claude Desktop, Ollama, customized agent configs, and more.
