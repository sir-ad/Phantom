# PHANTOM Configuration Guide

Learn how to configure PHANTOM for optimal performance and customization.

## Configuration Locations

PHANTOM stores configuration in the following locations:

1. **Primary Config**: `~/.phantom/config.json` (Linux/macOS) or `%USERPROFILE%\.phantom\config.json` (Windows)
2. **Environment Variables**: Runtime overrides
3. **Command-Line Flags**: Per-command overrides

## Configuration Commands

### Interactive Setup

Run the interactive configuration wizard:

```bash
phantom config setup
```

This guides you through setting up:
- AI provider API keys
- Preferred themes
- Default models
- Integration preferences

### Direct Configuration

Set individual configuration values:

```bash
phantom config set <key> <value>
```

Get configuration values:

```bash
phantom config get [key]
```

Clear configuration:

```bash
phantom config clear [--api-keys]
```

Check environment status:

```bash
phantom config env
```

## Configuration Options

### Core Settings

| Key | Description | Default | Example |
|-----|-------------|---------|---------|
| `version` | Configuration version | `1.0.0` | `1.0.0` |
| `firstRun` | First run indicator | `true` | `false` |
| `dataMode` | Data storage mode | `local` | `local`, `cloud`, `hybrid` |
| `encryption` | Enable data encryption | `true` | `true` |
| `telemetry` | Send anonymous usage data | `false` | `false` |
| `autoUpdate` | Automatically update PHANTOM | `true` | `true` |
| `permissionLevel` | Security permission level | `L2` | `L1`, `L2`, `L3` |
| `theme` | Terminal UI theme | `matrix` | `matrix`, `cyberpunk`, `minimal` |

### AI Model Configuration

#### Primary Model

```bash
phantom config set primaryModel.provider openai
phantom config set primaryModel.model gpt-4-turbo-preview
```

#### Fallback Model

```bash
phantom config set fallbackModel.provider anthropic
phantom config set fallbackModel.model claude-3-opus-20240229
```

#### Vision Model

```bash
phantom config set visionModel.provider openai
phantom config set visionModel.model gpt-4-vision-preview
```

### Model Providers

PHANTOM supports multiple AI providers:

#### OpenAI

```bash
phantom config set apiKeys.openai YOUR_OPENAI_API_KEY
```

Supported models:
- `gpt-4-turbo-preview`
- `gpt-4-vision-preview`
- `gpt-3.5-turbo`

#### Anthropic

```bash
phantom config set apiKeys.anthropic YOUR_ANTHROPIC_API_KEY
```

Supported models:
- `claude-3-opus-20240229`
- `claude-3-sonnet-20240229`
- `claude-3-haiku-20240307`

#### Ollama (Local)

```bash
# Ollama runs locally, no API key needed
phantom config set primaryModel.provider ollama
phantom config set primaryModel.model llama3.1:70b
```

Supported models (requires local installation):
- `llama3.1:70b`
- `llama3.1:8b`
- `mistral:7b`
- `mixtral:8x7b`

### Integration Configuration

#### GitHub Integration

```bash
phantom config set apiKeys.githubClientId YOUR_GITHUB_CLIENT_ID
phantom config set apiKeys.githubClientSecret YOUR_GITHUB_CLIENT_SECRET
```

#### Linear Integration

```bash
phantom config set apiKeys.linear YOUR_LINEAR_API_KEY
```

#### Figma Integration

```bash
phantom config set apiKeys.figma YOUR_FIGMA_ACCESS_TOKEN
```

#### Slack Integration

```bash
phantom config set apiKeys.slack YOUR_SLACK_BOT_TOKEN
```

### Module Configuration

#### Installed Modules

View installed modules:

```bash
phantom modules --installed
```

Install modules:

```bash
phantom install @phantom/prd
```

Uninstall modules:

```bash
phantom uninstall @phantom/prd
```

### MCP Configuration

#### Enable/Disable MCP

```bash
phantom config set mcp.enabled true
```

#### Server Mode

```bash
phantom config set mcp.server_mode stdio
```

Options:
- `stdio` - Standard input/output mode
- `socket` - Socket-based communication

### Security Configuration

#### Audit Logging

```bash
phantom config set security.audit_log_path ~/.phantom/logs/audit.log
```

#### Permission Levels

```bash
phantom config set permissionLevel L2
```

Levels:
- `L1` - Restricted (minimal file access)
- `L2` - Standard (normal file access)
- `L3` - Elevated (full system access)

### Project Configuration

#### Add Project

```bash
phantom context add ./my-project
```

This automatically adds the project to your configuration.

#### Set Active Project

```bash
phantom config set activeProject my-project
```

#### View Projects

```bash
phantom products
```

## Environment Variables

PHANTOM recognizes the following environment variables:

### Core Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PHANTOM_HOME` | Configuration directory | `~/.phantom` |
| `PHANTOM_THEME` | UI theme override | (from config) |
| `NO_COLOR` | Disable colored output | unset |

### AI Provider Variables

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `OLLAMA_HOST` | Ollama server host |
| `GITHUB_TOKEN` | GitHub personal access token |
| `LINEAR_API_KEY` | Linear API key |
| `FIGMA_ACCESS_TOKEN` | Figma access token |
| `SLACK_BOT_TOKEN` | Slack bot token |

### Proxy Configuration

| Variable | Description |
|----------|-------------|
| `HTTP_PROXY` | HTTP proxy URL |
| `HTTPS_PROXY` | HTTPS proxy URL |
| `NO_PROXY` | Comma-separated hosts to bypass proxy |

## Configuration File Structure

The main configuration file (`~/.phantom/config.json`) has the following structure:

```json
{
  "version": "1.0.0",
  "firstRun": false,
  "dataMode": "local",
  "encryption": true,
  "telemetry": false,
  "autoUpdate": true,
  "permissionLevel": "L2",
  "primaryModel": {
    "provider": "ollama",
    "model": "llama3.1:70b",
    "status": "connected"
  },
  "integrations": [],
  "projects": [
    {
      "name": "my-project",
      "path": "/path/to/my-project",
      "contextPaths": ["/path/to/my-project"],
      "createdAt": "2026-02-15T10:30:00.000Z",
      "lastAccessed": "2026-02-15T10:30:00.000Z"
    }
  ],
  "installedModules": [
    "prd-forge",
    "story-writer"
  ],
  "theme": "matrix",
  "installation": {
    "channel": "stable",
    "version": "1.0.0"
  },
  "mcp": {
    "enabled": true,
    "server_mode": "stdio"
  },
  "security": {
    "audit_log_path": "/Users/user/.phantom/logs/audit.log"
  },
  "apiKeys": {
    "openai": "sk-...",
    "anthropic": "sk-ant-..."
  }
}
```

## Best Practices

### Security

1. **Use environment variables** for API keys instead of config files
2. **Regularly rotate** API keys
3. **Use the minimum permission level** necessary
4. **Enable audit logging** for security monitoring

### Performance

1. **Choose appropriate models** for your use case
2. **Use local models** (Ollama) when possible for better privacy
3. **Configure fallback models** for reliability
4. **Limit context indexing** to necessary files only

### Organization

1. **Use project-specific configurations** for different codebases
2. **Keep modules updated** regularly
3. **Document custom configurations** for team sharing
4. **Use version control** for shared configuration files

## Troubleshooting

### Configuration Reset

If you need to reset your configuration:

```bash
phantom config clear
```

This resets to default settings while preserving API keys:

```bash
phantom config clear --api-keys
```

This clears everything including API keys.

### Configuration Validation

Check your current configuration:

```bash
phantom config env
```

This shows all configuration sources and their current values.

### Migration

When upgrading PHANTOM, configuration files are automatically migrated to newer versions. If migration fails, you may need to:

1. Backup your current config: `cp ~/.phantom/config.json ~/.phantom/config.backup.json`
2. Reset configuration: `phantom config clear`
3. Reconfigure using `phantom config setup`

## Advanced Configuration

### Custom Themes

Create custom themes by modifying the theme files in `~/.phantom/themes/`.

### Plugin Configuration

Configure third-party plugins in the `plugins` section of your config file.

### Custom Models

Add custom model configurations for unsupported providers.

For more information on specific configuration topics, see:
- [AI Providers Guide](ai-providers.md)
- [Module Development](module-development.md)
- [MCP Integration](mcp.md)
- [Security Guide](security.md)