+++
title = "Anthropic"
+++

---
title: Anthropic
---

# Anthropic

Connect Claude models to Phantom for long-form writing and nuanced analysis.

## Setup

1. Get an API key from [console.anthropic.com](https://console.anthropic.com/).
2. Set the environment variable:
   ```bash
   export ANTHROPIC_API_KEY="sk-ant-..."
   ```

## Models

| Model | Context | Best For | Cost |
|-------|---------|----------|------|
| `claude-sonnet-4-20250514` | 200K | Balanced quality and speed | ~$3/M tokens |
| `claude-3.5-haiku` | 200K | Fast tasks, low cost | ~$0.80/M tokens |
| `claude-3-opus` | 200K | Deep analysis, long documents | ~$15/M tokens |

## Usage

```bash
phantom chat --model claude
```
