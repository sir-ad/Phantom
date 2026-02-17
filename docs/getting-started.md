# Getting Started with PHANTOM

Welcome to PHANTOM - the invisible force behind every great product. This guide will help you get up and running with PHANTOM in minutes.

## Installation

### Prerequisites

Before installing PHANTOM, ensure you have:

- **Node.js 18+** installed on your system
- (Optional) **Ollama** for local AI capabilities

### Installation Methods

#### One-Line Install (Recommended)

```bash
curl -fsSL https://phantom.pm/install | sh
```

#### npm Global Install

```bash
npm install -g @phantompm/cli
```

#### Homebrew (macOS)

```bash
brew tap phantompm/tap
brew install phantom
```

#### Windows PowerShell

```powershell
irm https://phantom.pm/install.ps1 | iex
```

## First Run

After installation, run PHANTOM to see the operator console:

```bash
phantom
```

On first run, you'll be guided through a quick setup wizard to configure your preferred AI providers and settings.

## Basic Commands

### Add Project Context

Feed PHANTOM your codebase to give it deep understanding of your product:

```bash
phantom context add ./my-project
```

### Generate a PRD

Create a comprehensive Product Requirements Document in seconds:

```bash
phantom prd create "User Authentication System"
```

### Run Swarm Analysis

Get multi-agent product analysis for any decision:

```bash
phantom swarm "Should we add dark mode to our app?"
```

### Generate User Stories

Create user stories from features or PRDs:

```bash
phantom stories generate "Payment processing integration"
phantom stories from-prd ./my-prd.md
```

### Plan Sprints

Organize stories into optimized sprint plans:

```bash
phantom sprint plan --goal "Q2 Features" --duration 14
```

## AI Provider Configuration

PHANTOM supports multiple AI providers. Configure your preferred provider:

```bash
phantom config setup
```

Or set API keys manually:

```bash
phantom config set apiKeys.openai YOUR_OPENAI_KEY
phantom config set apiKeys.anthropic YOUR_ANTHROPIC_KEY
```

## Module System

PHANTOM's power comes from its modular architecture. Install modules as needed:

```bash
phantom install @phantom/prd          # PRD generation
phantom install @phantom/stories      # User story creation
phantom install @phantom/competitive  # Competitive analysis
phantom install @phantom/analytics    # Analytics insights
```

See all available modules:

```bash
phantom modules
```

## MCP Integration

PHANTOM works invisibly with popular AI coding tools:

- **Claude Code**
- **Cursor**
- **VS Code**
- **Zed Editor**

These tools automatically discover and use PHANTOM when available, enhancing their capabilities with PM intelligence.

## Next Steps

1. [CLI Commands Reference](cli.md) - Complete command documentation
2. [Modules Guide](modules.md) - Detailed module documentation
3. [MCP Integration](mcp.md) - Integration with AI coding tools
4. [Advanced Configuration](configuration.md) - Customizing PHANTOM
5. [Community](https://discord.gg/phantom) - Join our Discord

## Troubleshooting

If you encounter issues:

1. Run the diagnostic tool:
   ```bash
   phantom doctor
   ```

2. Check your configuration:
   ```bash
   phantom config env
   ```

3. Clear cache if needed:
   ```bash
   phantom config clear --api-keys
   ```

For additional help, visit our [Discord community](https://discord.gg/phantom) or check the [GitHub issues](https://github.com/PhantomPM/phantom/issues).