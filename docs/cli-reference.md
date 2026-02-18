---
sidebar_position: 4
title: CLI Reference
---

# CLI Reference

Complete reference for all Phantom CLI commands.

## Global Options

| Option | Description |
|--------|-------------|
| `--version`, `-V` | Show version number |
| `--help`, `-h` | Show help for any command |
| `--json` | Output as JSON (where supported) |

## Commands

### `phantom` (default)

Launch the interactive chat REPL.

```bash
phantom
phantom chat
phantom chat --model gpt-4o
phantom chat --provider ollama --model llama3.1:8b
```

| Option | Description |
|--------|-------------|
| `--model <name>` | Model to connect |
| `--provider <name>` | Force a specific provider |

---

### `phantom swarm <question>`

Run a multi-agent consensus analysis.

```bash
phantom swarm "Should we add dark mode?"
phantom swarm "Should we add dark mode?" --json
```

---

### `phantom prd <title>`

Generate a Product Requirements Document.

```bash
phantom prd "User Authentication"
phantom prd "User Authentication" --json
```

---

### `phantom simulate <scenario>`

Run a product simulation.

```bash
phantom simulate "User onboarding flow"
phantom simulate "User onboarding flow" --json
```

---

### `phantom agents scan`

Discover AI agents on your system.

```bash
phantom agents scan
phantom agents scan --json
```

---

### `phantom register`

Register Phantom with AI agents.

```bash
phantom register --all
phantom register --target cursor
phantom register --target claude-desktop
```

---

### `phantom model`

List available AI models across all providers.

```bash
phantom model
phantom model list
```

---

### `phantom config`

Manage configuration.

```bash
phantom config setup              # Interactive wizard
phantom config set <key> <value>  # Set a value
phantom config get [key]          # Get a value
phantom config env                # Show environment status
phantom config clear              # Reset configuration
```

---

### `phantom doctor`

Run a system health check.

```bash
phantom doctor
```

---

### `phantom mcp`

Start the MCP server.

```bash
phantom mcp start        # Start MCP server
phantom mcp stdio        # Run in stdio mode (for agents)
phantom mcp tools        # List available MCP tools
```
