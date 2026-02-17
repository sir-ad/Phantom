---
sidebar_position: 1
title: AI Providers Overview
---

# AI Providers

Phantom supports 4 LLM providers out of the box. You can use one or configure all of them — Phantom will auto-detect the best available provider.

## Provider Comparison

| Provider | Models | Cost | Best For | Latency |
|----------|--------|------|----------|---------|
| **Ollama** | Llama 3.1, Mistral, CodeLlama | 🟢 Free | Privacy, offline, fast iteration | Low |
| **OpenAI** | GPT-4o, GPT-4o-mini, o3-mini | 💳 Pay-per-use | Strategy, nuanced analysis | Medium |
| **Anthropic** | Claude Sonnet 4, Opus, Haiku | 💳 Pay-per-use | Long-form writing, PRDs | Medium |
| **Gemini** | 2.0 Flash, 2.5 Pro, 1.5 Pro | 💳 Pay-per-use | Speed, multimodal | Low |

## Priority Order

When you run `phantom` without specifying a provider, it checks in this order:

1. **Ollama** (if running locally)
2. **OpenAI** (if `OPENAI_API_KEY` is set)
3. **Anthropic** (if `ANTHROPIC_API_KEY` is set)
4. **Gemini** (if `GEMINI_API_KEY` is set)

## Configuration

### Environment Variables

```bash
export OPENAI_API_KEY="sk-..."
export ANTHROPIC_API_KEY="sk-ant-..."
export GEMINI_API_KEY="AIza..."
```

### Config File

```bash
phantom config setup
```

This stores keys in `~/.phantom/config.json`.

### Switching Providers

```bash
# At launch
phantom chat --provider openai --model gpt-4o

# During chat
phantom (ollama:llama3.1) ▸ /model gpt-4o
```

## Fallback Chain

If your primary provider fails (rate limit, network error), Phantom automatically falls back through the chain: OpenAI → Anthropic → Ollama → Gemini.
