+++
title = "Cli Reference"
+++



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


### `phantom prd <title>`

Generate a Product Requirements Document.

```bash
phantom prd "User Authentication"
phantom prd "User Authentication" --json
```


### `phantom agents scan`

Discover AI agents on your system.

```bash
phantom agents scan
phantom agents scan --json
```


### `phantom model`

List available AI models across all providers.

```bash
phantom model
phantom model list
```


### `phantom doctor`

Run a system health check.

```bash
phantom doctor
```

