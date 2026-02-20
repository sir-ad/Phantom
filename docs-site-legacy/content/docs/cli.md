+++
title = "Cli"
+++


Complete reference for all PHANTOM command-line interface commands.

## Global Options

```bash
-v, --version    # Output the version number
-h, --help       # Display help for command
--json           # Output as JSON (where applicable)
```

## Core Commands

### phantom
Launch the PHANTOM operator console.

```bash
phantom
```

### phantom --help
Display help information for all commands.

```bash
phantom --help
```

### phantom --version
Display the current version of PHANTOM.

```bash
phantom --version
```

## Context Management

### phantom context
Manage project context for PHANTOM's understanding.

```bash
phantom context [options]
```

#### phantom context add
Add a path to PHANTOM's context engine.

```bash
phantom context add <path>
```

Options:
- `--recursive` - Index directories recursively
- `--exclude <patterns>` - Comma-separated exclude patterns
- `--types <types>` - File types to include (code,docs,images,etc.)

#### phantom context search
Search indexed context.

```bash
phantom context search <query>
```

Options:
- `--limit <number>` - Maximum number of results
- `--type <type>` - Filter by file type

#### phantom context status
Show context indexing status.

```bash
phantom context status
```

## Product Requirements Documents

### phantom prd
Generate and manage Product Requirements Documents.

```bash
phantom prd [options] [command]
```

#### phantom prd create
Generate a new PRD from a title.

```bash
phantom prd create <title>
```

Options:
- `--out <path>` - Output file path
- `--technical` - Include technical requirements
- `--ux` - Include UX wireframe descriptions
- `--metrics` - Include metrics framework

#### phantom prd list
List generated PRDs.

```bash
phantom prd list
```

#### phantom prd update
Update an existing PRD.

```bash
phantom prd update <id>
```

#### phantom prd export
Export PRD to different formats.

```bash
phantom prd export <id> --format <pdf|markdown|json>
```

## User Stories

### phantom stories
Generate user stories from features or PRDs.

```bash
phantom stories [options] [command]
```

#### phantom stories generate
Generate user stories from a feature description.

```bash
phantom stories generate <feature>
```

Options:
- `-c, --count <number>` - Number of stories to generate (default: 5)
- `--no-edge-cases` - Skip edge case stories
- `-o, --output <filename>` - Output filename (default: user-stories.md)

#### phantom stories from-prd
Generate user stories from a PRD file.

```bash
phantom stories from-prd <prd-path>
```

Options:
- `-s, --sprints <number>` - Number of sprints to plan (default: 2)

## Sprint Planning

### phantom sprint
Plan and manage sprints.

```bash
phantom sprint [options] [command]
```

#### phantom sprint plan
Plan a new sprint.

```bash
phantom sprint plan
```

Options:
- `--goal <string>` - Sprint goal
- `--duration <days>` - Sprint duration in days (default: 14)
- `--velocity <points>` - Team velocity in story points
- `--backlog <path>` - Path to backlog file

#### phantom sprint retro
Generate sprint retrospective.

```bash
phantom sprint retro
```

Options:
- `--sprint <path>` - Path to sprint data file

## Agent Swarm

### phantom swarm
Run multi-agent product analysis.

```bash
phantom swarm <question>
```

Options:
- `--json` - Output as JSON

## Module Management

### phantom modules
Browse and manage modules.

```bash
phantom modules [options]
```

Options:
- `--installed` - Show only installed modules
- `--available` - Show only available modules
- `--json` - Output as JSON

### phantom install
Install a module.

```bash
phantom install <module>
```

### phantom uninstall
Uninstall a module.

```bash
phantom uninstall <module>
```

### phantom update
Update modules.

```bash
phantom update [module]
```

Options:
- `--all` - Update all modules

## Configuration

### phantom config
Manage PHANTOM configuration.

```bash
phantom config [options] [command]
```

#### phantom config set
Set configuration values.

```bash
phantom config set <key> <value>
```

#### phantom config get
Get configuration values.

```bash
phantom config get [key]
```

#### phantom config setup
Interactive configuration setup.

```bash
phantom config setup
```

#### phantom config clear
Clear configuration.

```bash
phantom config clear [--api-keys]
```

#### phantom config env
Show environment configuration status.

```bash
phantom config env
```

## Integrations

### phantom integrate
Manage IDE and tool integrations.

```bash
phantom integrate [options] [command]
```

#### phantom integrate scan
Scan for available integrations.

```bash
phantom integrate scan
```

Options:
- `--json` - Output as JSON

#### phantom integrate connect
Connect to a specific integration.

```bash
phantom integrate connect <target>
```

#### phantom integrate doctor
Run integration health checks.

```bash
phantom integrate doctor
```

Options:
- `--json` - Output as JSON

## MCP (Model Connection Protocol)

### phantom mcp
MCP server and tool management.

```bash
phantom mcp [options] [command]
```

#### phantom mcp serve
Start MCP server.

```bash
phantom mcp serve
```

Options:
- `--mode <stdio|legacy-jsonl>` - Server mode (`stdio` is default)

#### phantom mcp tools
List available MCP tools.

```bash
phantom mcp tools
```

Options:
- `--json` - Output as JSON

#### phantom mcp status
Show MCP server status.

```bash
phantom mcp status
```

## System Commands

### phantom status
Show PHANTOM runtime status.

```bash
phantom status [options]
```

Options:
- `--json` - Output as JSON

### phantom doctor
Run system health checks.

```bash
phantom doctor [options]
```

Options:
- `--json` - Output as JSON

### phantom health
Show real runtime health metrics.

```bash
phantom health [options]
```

Options:
- `--json` - Output as JSON

### phantom simulate
Run deterministic simulation for a product scenario.

```bash
phantom simulate <scenario>
```

Options:
- `--json` - Output as JSON

### phantom nudge
Show intelligent nudges and suggestions.

```bash
phantom nudge [options]
```

Options:
- `--json` - Output as JSON
- `--dismiss <id>` - Dismiss a specific nudge
- `--snooze <id>:<minutes>` - Snooze a nudge
- `--refresh` - Generate new suggestions

### phantom products
Show persisted project/product portfolio.

```bash
phantom products [options]
```

Options:
- `--json` - Output as JSON

### phantom docs
Documentation operations.

```bash
phantom docs [options] [command]
```

### phantom frameworks
List built-in PM frameworks.

```bash
phantom frameworks [options] [action] [framework]
```

Options:
- `--json` - Output as JSON

### phantom dashboard
Show concise runtime summary.

```bash
phantom dashboard [options]
```

Options:
- `--json` - Output as JSON

### phantom agents
Show Agent Matrix usage and capabilities.

```bash
phantom agents [options] [command]
```

### phantom boot
Run onboarding boot sequence.

```bash
phantom boot
```

### phantom tools
Tool palette (real-mode gate).

```bash
phantom tools [options] [command]
```

## Environment Variables

PHANTOM respects the following environment variables:

- `PHANTOM_HOME` - Configuration directory (default: `~/.phantom`)
- `OPENAI_API_KEY` - OpenAI API key
- `ANTHROPIC_API_KEY` - Anthropic API key
- `OLLAMA_HOST` - Ollama server host (default: `http://localhost:11434`)
- `PHANTOM_THEME` - UI theme (matrix, cyberpunk, minimal)

## Examples

### Basic Workflow

```bash
phantom context add ./my-project

phantom prd create "User Authentication System"

phantom stories generate "Authentication with OAuth support"

phantom sprint plan --goal "Implement Auth System" --duration 10

phantom swarm "Should we use JWT or session-based auth?"
```

### Module Management

```bash
phantom modules

phantom install @phantom/competitive
phantom install @phantom/analytics-lens

phantom modules --installed
```

### Integration Setup

```bash
phantom integrate scan

phantom integrate connect cursor
phantom integrate connect vscode

phantom integrate doctor
```

### Configuration

```bash
phantom config setup

phantom config set apiKeys.openai sk-...
phantom config set primaryModel.provider openai

phantom config env
```

## Exit Codes

- `0` - Success
- `1` - General error
- `2` - Invalid arguments
- `3` - Configuration error
- `4` - Network error
- `5` - AI provider error

## Output Formats

Most commands support multiple output formats:

- **Human-readable** - Default terminal-friendly output
- **JSON** - Structured data output with `--json` flag
- **Silent** - Minimal output for scripting (where applicable)

## Performance Considerations

- First-time module installations may take longer due to downloading
- AI-powered commands require network connectivity to AI providers
- Context indexing can be resource-intensive for large codebases
- Use `--json` output for programmatic consumption

For more information on specific commands, use `phantom <command> --help`.
