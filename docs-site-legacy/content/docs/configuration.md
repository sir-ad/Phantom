+++
title = "Configuration"
+++



Phantom stores configuration in `~/.phantom/config.json`.

## Setup Wizard

The easiest way to configure Phantom:

```bash
phantom config setup
```

This walks you through setting:
- OpenAI API key
- Anthropic API key
- Gemini API key
- GitHub OAuth credentials
- Theme preference

## Environment Variables

| Variable | Provider |
|----------|----------|
| `OPENAI_API_KEY` | OpenAI (GPT-4o, etc.) |
| `ANTHROPIC_API_KEY` | Anthropic (Claude) |
| `GEMINI_API_KEY` | Google Gemini |
| `GOOGLE_API_KEY` | Google Gemini (alternative) |
| `GITHUB_CLIENT_ID` | GitHub OAuth |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth |

Environment variables take priority over config file values.

## Manual Configuration

```bash
phantom config set apiKeys.openai sk-...
phantom config set apiKeys.anthropic sk-ant-...
phantom config set apiKeys.gemini AIza...

phantom config set theme matrix    # matrix | cyberpunk | minimal

phantom config get

phantom config get apiKeys.openai

phantom config env
```

## Config File Format

```json
{
  "version": "1.0.0",
  "theme": "matrix",
  "dataMode": "local",
  "firstRun": false,
  "apiKeys": {
    "openai": "sk-...",
    "anthropic": "sk-ant-...",
    "gemini": "AIza..."
  },
  "primaryModel": {
    "provider": "ollama",
    "model": "llama3.1:8b",
    "status": "active"
  },
  "integrations": [],
  "installedModules": []
}
```

## Resetting Configuration

```bash
phantom config clear --api-keys

phantom config clear
```
