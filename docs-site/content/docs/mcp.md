+++
title = "Mcp"
+++

---
sidebar_position: 2
title: MCP Server
---


Phantom implements the [Model Context Protocol](https://modelcontextprotocol.io) (MCP), allowing IDE agents to use Phantom's PM capabilities as tools.

## What is MCP?

MCP is an open standard for connecting AI models to external data and tools. When Phantom runs as an MCP server, agents like Cursor, Windsurf, and Claude Desktop can call Phantom's functions directly.

## Starting the Server

```bash
phantom mcp start
```

Or run via stdio (for agent integration):

```bash
phantom mcp stdio
```

## Available MCP Tools

| Tool | Description | Input |
|------|-------------|-------|
| `phantom_generate_prd` | Generate a Product Requirements Document | `{ feature: string }` |
| `phantom_swarm_analyze` | Run multi-agent consensus analysis | `{ question: string }` |
| `phantom_simulate` | Run a product simulation | `{ scenario: string }` |
| `phantom_discover_agents` | Scan for local AI agents | `{}` |
| `phantom_register_self` | Register Phantom with an agent | `{ target: string }` |
| `phantom_add_context` | Add project context | `{ key: string, value: string }` |
| `phantom_search_context` | Search project context | `{ query: string }` |
| `phantom_bridge_translate` | Translate PM-speak to dev-speak | `{ input: string }` |

## Auto-Registration

Register Phantom with all detected agents:

```bash
phantom register --all
```

This modifies each agent's MCP configuration to include Phantom. For example, for Claude Desktop:

```json
// ~/Library/Application Support/Claude/claude_desktop_config.json
{
  "mcpServers": {
    "phantom": {
      "command": "phantom",
      "args": ["mcp", "stdio"]
    }
  }
}
```

## Using Phantom Tools in Your IDE

After registration, your IDE agent can use Phantom tools. For example in Cursor:

```
"Use phantom_generate_prd to create a PRD for user authentication"
```

The agent will call Phantom's MCP server, which generates the PRD and returns it to your IDE.
