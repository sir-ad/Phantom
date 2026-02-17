# Model Context Protocol (MCP)

Phantom acts as an MCP Server, allowing other AI agents (like Claude Desktop, Cursor, Windsurf) to use Phantom's capabilities as tools.

## Setup

Phantom supports auto-registration with most major agents.

```bash
# Register with all detected agents
phantom register --all

# Register with a specific agent
phantom register --target claude-desktop
```

This command automatically modifies the configuration files for the target agents to add Phantom as an MCP server.

## Available Tools

When connected via MCP, your agent gains these tools:

| Tool Name | Description |
|-----------|-------------|
| `phantom_generate_prd` | Generate a structured PRD from a feature description. |
| `phantom_swarm_analyze` | Run a multi-agent consensus debate on a topic. |
| `phantom_simulate` | Run a deterministic product simulation. |
| `phantom_discover_agents` | Scan the local system for other AI agents. |
| `phantom_register_self` | Allow Phantom to register itself with other agents. |

## Supported Clients

Phantom has been tested with:
- **Claude Desktop**
- **Cursor**
- **Windsurf**
- **VS Code** (via MCP extension)
- **Zed**
- **Cline**
- **Continue**
