+++
title = "Openai"
+++



Connect GPT-4o, GPT-4o-mini, and o3-mini to Phantom.

## Setup

1. Get an API key from [platform.openai.com](https://platform.openai.com/api-keys).
2. Set the environment variable:
   ```bash
   export OPENAI_API_KEY="sk-..."
   ```

## Models

| Model | Context | Best For | Cost |
|-------|---------|----------|------|
| `gpt-4o` | 128K | Strategy, analysis, PRDs | ~$5/M tokens |
| `gpt-4o-mini` | 128K | Quick tasks, brainstorming | ~$0.30/M tokens |
| `o3-mini` | 128K | Reasoning, complex decisions | ~$1.10/M tokens |

## Usage

```bash
phantom chat --model gpt-4o
```
