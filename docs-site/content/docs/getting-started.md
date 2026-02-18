+++
title = "Getting Started"
+++



Get Phantom running in under 60 seconds.

## Prerequisites

- **Node.js 18+** — Required for all installation methods.
- **An LLM** — Either a local model via [Ollama](https://ollama.com) or an API key for OpenAI / Anthropic / Gemini.

## Step 1: Install Phantom

The fastest way to install:

```bash
curl -fsSL https://raw.githubusercontent.com/sir-ad/Phantom/main/scripts/install.sh | sh
```

Or via npm:

```bash
npm install -g phantom-pm
```

See the [Installation Guide](/docs/installation) for Docker, manual builds, and upgrade instructions.

## Step 2: Connect a Model

### Option A: Local Model (Free)

Install [Ollama](https://ollama.com), then:

```bash
ollama pull llama3.1:8b
ollama serve
```

Phantom auto-detects Ollama — no configuration needed.

### Option B: Cloud Model

Set an API key:

```bash
export OPENAI_API_KEY="sk-..."
export ANTHROPIC_API_KEY="sk-ant-..."
export GEMINI_API_KEY="AIza..."
```

Or run the interactive setup wizard:

```bash
phantom config setup
```

## Step 3: Launch Phantom

```bash
phantom
```

That's it. Phantom boots up, connects to your model, and drops you into an interactive PM chat.

## Step 4: Try It Out

```bash
phantom (ollama:llama3.1) ▸ Should we build a mobile app or focus on PWA?

phantom (ollama:llama3.1) ▸ /prd Dark Mode for iOS App

phantom (ollama:llama3.1) ▸ /swarm Should we pivot to enterprise sales?
```

## Next Steps

- Read about [Chat](/docs/features/chat) to learn all slash commands.
- Explore [Swarm Intelligence](/docs/features/swarm) for multi-agent analysis.
- Set up [MCP integration](/docs/mcp) for IDE connectivity.
