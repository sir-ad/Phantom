# MCP Integration

PHANTOM seamlessly integrates with AI coding tools through the Model Connection Protocol (MCP), working invisibly to enhance your development workflow with PM intelligence.

## What is MCP?

MCP (Model Connection Protocol) is an open standard that allows AI coding tools and language models to discover, connect to, and utilize external tools and services. PHANTOM implements MCP to provide PM capabilities to your AI tools.

## Supported Integrations

PHANTOM automatically detects and integrates with:

- **Claude Code**
- **Cursor**
- **VS Code** (with appropriate extensions)
- **Zed Editor**
- **Codex AI**
- **Gemini CLI**

## How It Works

1. **Automatic Discovery**: PHANTOM registers itself with detected AI tools during installation
2. **Seamless Integration**: AI tools discover PHANTOM automatically
3. **Contextual Enhancement**: Your AI tools gain PM superpowers without configuration
4. **Invisible Operation**: PHANTOM works in the background

Example workflow:
```
User in Claude Code: "Build auth feature"
→ Claude discovers PHANTOM is available
→ Claude generates PRD via PHANTOM
→ Claude creates user stories via PHANTOM
→ Claude codes with PM intelligence
→ User sees PM artifacts appear magically
```

## MCP Tools Provided

PHANTOM exposes the following tools to integrated AI agents:

### context.add
Index a path into the local PHANTOM context engine

```json
{
  "tool": "context.add",
  "arguments": {
    "path": "./src"
  }
}
```

### context.search
Search indexed context by path and content

```json
{
  "tool": "context.search",
  "arguments": {
    "query": "authentication implementation",
    "limit": 10
  }
}
```

### prd.generate
Generate a PRD document from a title

```json
{
  "tool": "prd.generate",
  "arguments": {
    "title": "User Authentication System",
    "output_path": "./docs/auth-prd.md"
  }
}
```

### swarm.analyze
Run deterministic swarm analysis for a product decision

```json
{
  "tool": "swarm.analyze",
  "arguments": {
    "question": "Should we implement two-factor authentication?"
  }
}
```

### phantom_create_stories
Create user stories from a feature request

```json
{
  "tool": "phantom_create_stories",
  "arguments": {
    "feature": "Payment Processing",
    "count": 5
  }
}
```

### phantom_plan_sprint
Create a lightweight sprint plan from priorities and velocity

```json
{
  "tool": "phantom_plan_sprint",
  "arguments": {
    "velocity": 21,
    "priorities": ["auth", "payments", "notifications"]
  }
}
```

### phantom_analyze_product
Analyze product/project state from local context and modules

```json
{
  "tool": "phantom_analyze_product",
  "arguments": {
    "focus": "security"
  }
}
```

### bridge.translate_pm_to_dev
Translate PM intent into dev-ready tasks

```json
{
  "tool": "bridge.translate_pm_to_dev",
  "arguments": {
    "pm_intent": "Users need faster checkout",
    "product_constraints": "PCI compliance, mobile-first"
  }
}
```

## Agent Discovery System

PHANTOM includes an intelligent agent discovery system that:

1. **Detects** installed AI agents and IDEs
2. **Registers** PHANTOM with compatible tools
3. **Monitors** integration health
4. **Auto-updates** configurations

### Manual Discovery

Trigger manual agent discovery:

```bash
phantom agents scan
```

### Registration Status

Check integration status:

```bash
phantom agents health
```

### Force Registration

Manually register with specific agents:

```bash
phantom agents register
```

## Configuration

### MCP Server Mode

PHANTOM supports official MCP stdio by default:

```bash
phantom mcp serve --mode stdio
```

Legacy compatibility mode is available temporarily:

```bash
phantom mcp serve --mode legacy-jsonl
```

### Tool Visibility

Control which tools are exposed to agents:

```bash
phantom config set mcp.enabled true
phantom config set mcp.server_mode stdio
```

## Resources

PHANTOM also provides resources that agents can read:

### phantom://status/summary
Current Phantom runtime status and core configuration summary

### phantom://projects/summary
Tracked projects and active context metadata

### phantom://modules/summary
Installed and available module inventory

## Troubleshooting

### Integration Issues

If agents aren't discovering PHANTOM:

1. Check registration status:
   ```bash
   phantom agents health
   ```

2. Force re-registration:
   ```bash
   phantom agents register
   ```

3. Verify agent compatibility:
   ```bash
   phantom agents scan
   ```

### Connection Problems

For connection issues:

1. Check MCP server status:
   ```bash
   phantom mcp status
   ```

2. Start MCP server explicitly:
   ```bash
   phantom mcp serve --mode stdio
   ```

3. Enable debug logs:
   ```bash
   PHANTOM_MCP_DEBUG=1 phantom mcp serve --mode stdio
   ```

## Best Practices

### For AI Tool Users

1. **Let PHANTOM work invisibly** - Don't manually invoke PHANTOM commands unless needed
2. **Provide rich context** - The more context you give your AI tool, the better PHANTOM can help
3. **Use natural language** - PHANTOM understands PM terminology naturally

### For Developers

1. **Keep PHANTOM updated** - Regular updates ensure best integration
2. **Monitor integration health** - Periodically check `phantom agents health`
3. **Report compatibility issues** - Help improve integration with new tools

## Security Considerations

PHANTOM follows security best practices for MCP integration:

- **Local-first operation** - All processing happens on your machine
- **Controlled access** - Agents can only access tools you've explicitly enabled
- **Data privacy** - Your code and data never leave your machine
- **Audit logging** - Track all MCP interactions for security monitoring

View security configuration:

```bash
phantom config env
```

## Future Enhancements

Planned MCP improvements include:

- **Enhanced tool contracts** - More sophisticated PM capabilities
- **Bi-directional communication** - Agents can notify PHANTOM of developments
- **Smart routing** - Route requests to optimal AI providers
- **Collaboration features** - Multi-user PM workflows

Stay updated by watching the [GitHub repository](https://github.com/PhantomPM/phantom) or joining our [Discord community](https://discord.gg/phantom).
