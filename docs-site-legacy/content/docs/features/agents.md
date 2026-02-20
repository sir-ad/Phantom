+++
title = "Agents"
+++



Phantom can detect, register with, and orchestrate other AI agents installed on your system.

## Scanning for Agents

```bash
phantom agents scan
```

This scans your system for AI coding agents and development tools:

```
=== AGENT DISCOVERY ===

  ✓ Cursor          ~/.cursor/               Registered
  ✓ Windsurf        ~/.windsurf/             Registered
  ✓ Claude Desktop  ~/Library/Application..  Registered
  ✓ VS Code         ~/.vscode/               Detected
  ✓ Ollama          localhost:11434           Running
  ✗ Cline           Not found
  ✗ Continue        Not found

Found: 5 agents (3 registered, 2 detected)
```

## Supported Agents

Phantom detects and integrates with **16 AI agents**:

| Agent | Type | Integration |
|-------|------|-------------|
| **Cursor** | IDE | MCP server registration |
| **Windsurf** | IDE | MCP server registration |
| **VS Code** | IDE | MCP extension config |
| **Claude Desktop** | App | MCP config file |
| **Claude Code** | CLI | Direct integration |
| **Zed** | IDE | Extension config |
| **Cline** | Extension | MCP config |
| **Continue** | Extension | MCP config |
| **Aider** | CLI | Tool integration |
| **Copilot** | Extension | Detected |
| **Ollama** | Runtime | Direct API |
| **LM Studio** | App | API integration |
| **OpenCode** | CLI | MCP config |
| **Antigravity** | Agent | MCP config |
| **Roo** | Agent | MCP config |
| **Kilo** | Agent | MCP config |

## Key Agents

- **StrategistAgent**: Focused on long-term product vision and market positioning.
- **TaskMasterAgent**: Specialized in recursive goal decomposition and complexity assessment.
- **OracleAgent**: Bridges real-world context with product calibration and philosophical insights.
- **ArchitectAgent**: High-level system design and technical feasibility analysis.

## Auto-Registration

Register Phantom as an MCP server with all detected agents:

```bash
phantom register --all

phantom register --target cursor
phantom register --target claude-desktop
```

This modifies the agent's configuration file to add Phantom as an available MCP tool server.

## What Registration Does

When Phantom registers with an agent (e.g., Cursor), it:

1. Locates the agent's MCP configuration file.
2. Adds a `phantom` entry pointing to the Phantom MCP server binary.
3. The agent can now call Phantom tools (PRD generation, swarm, simulation) from within the IDE.

## Health Check

```bash
phantom agents scan --json
```

Returns structured JSON with detection confidence, registration status, and health metrics for each agent.
