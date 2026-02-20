---
sidebar_position: 1
title: Architecture
---

# Architecture

Phantom is built as a modular monorepo. Each package has a single responsibility and communicates through well-defined TypeScript interfaces and WebSockets for edge nodes.

## System Diagram

```mermaid
graph TD
    User[User / Product Manager] --> UI["@phantom-pm/app (Next.js Matrix UI)"]
    User --> Voice["WisprFlow Voice Input"]
    Voice --> UI
    UI --> Core["@phantom-pm/core (The Brain)"]
    
    subgraph "Phantom Core (The Brain)"
        Core --> AI[AIManager (Models)]
        Core --> Context[Rowboat Context Engine (Graph)]
        Core --> Swarm[Agent Swarm Routines]
        Core --> Gateway[OS Gateway (WebSocket)]
        Context --> SQLite[(SQLite DB)]
    end
    
    subgraph "Intelligence Extensibility (The Hands)"
        Gateway --> EdgeNode["@phantom-pm/os-agent (Edge Node)"]
        EdgeNode --> OS[Desktop UI / Bash / Mouse]
        Core --> MCPClient[MCP Aggregator]
        MCPClient --> Notion[Notion MCP Node]
        MCPClient --> Jira[Jira MCP Node]
    end
    
    subgraph "Generative Feedback"
        UI --> Sandpack[OpenUI React Sandbox]
    end
    
    AI --> Claude[Anthropic (Claude 3.7 + Computer Use)]
    AI --> OpenAI[OpenAI (o3-mini)]
    AI --> Ollama[Local Models (Llama 3, DeepSeek)]
```

## Package Overview

| Package | Purpose | Key Files |
|---------|---------|-----------|
| `@phantom-pm/core` | The core engine. Houses the AIManager, Rowboat Graph Context, Swarm Routines, and OS Gateway. | `ai/manager.ts`, `context.ts`, `os-gateway.ts` |
| `@phantom-pm/app` | The "Matrix" UI. A Next.js application embedding interactive Sandboxes and Swarm chats. | `app/page.tsx`, `components/canvas/CanvasPanel.tsx` |
| `@phantom-pm/os-agent` | The physical Hands. A local Edge Node connecting Phantom back to your physical desktop OS. | `index.ts` |
| `@phantom-pm/mcp-server` | Model Context Protocol server exposing Phantom's brain to IDEs like Cursor. | `index.ts`, `discovery.ts` |
| `@phantom-pm/cli` | The terminal interface for headless operation. | `index.tsx`, `commands/chat.ts` |

## Data Storage

All data is stored locally in `~/.phantom/` via SQLite:

```
~/.phantom/
├── config.json     # User configuration & API keys
├── phantom.db      # Rowboat Semantic Knowledge Graph (Graph + Vectors)
└── artifacts/      # Generated PRDs, UI Code, and Diagrams
```

No data is sent to Phantom servers. All AI calls go directly from your machine to the provider API. Local models via Ollama ensure 100% privacy.

## Build System

- **TypeScript** throughout.
- **npm workspaces** for monorepo management.
- **Next.js** for the frontend App UI.
- Dependencies flow: `core` → `app` / `os-agent` / `mcp-server` → `cli`.
