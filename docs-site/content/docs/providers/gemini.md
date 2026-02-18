+++
title = "Gemini"
+++

---
title: Google Gemini
---

# Google Gemini

Connect Gemini models via Google AI Studio for fast, cost-effective AI.

## Setup

1. Get an API key from [aistudio.google.com](https://aistudio.google.com/apikey).
2. Set the environment variable:
   ```bash
   export GEMINI_API_KEY="AIza..."
   ```

## Models

| Model | Context | Best For | Cost |
|-------|---------|----------|------|
| `gemini-2.0-flash` | 1M | Speed, general tasks | Free tier available |
| `gemini-2.5-pro` | 1M | Complex reasoning | ~$1.25/M tokens |
| `gemini-1.5-pro` | 2M | Very long context | ~$1.25/M tokens |
| `gemini-1.5-flash` | 1M | Fast, cheap | ~$0.075/M tokens |

## Usage

```bash
phantom chat --model gemini
```

## Notes

- Gemini 2.0 Flash has a generous free tier.
- The 1M+ token context window makes it excellent for analyzing large codebases or documents.
