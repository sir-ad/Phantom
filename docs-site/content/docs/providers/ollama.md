+++
title = "Ollama"
+++

---
title: Ollama
---


[Ollama](https://ollama.com) runs LLMs locally on your machine. It's free, private, and fast.

## Setup

1. Install Ollama from [ollama.com](https://ollama.com).
2. Pull a model:
   ```bash
   ollama pull llama3.1:8b
   ```
3. Start Ollama:
   ```bash
   ollama serve
   ```
4. That's it — Phantom auto-detects Ollama at `localhost:11434`.

## Supported Models

| Model | Size | Best For |
|-------|------|----------|
| `llama3.1:8b` | 4.7 GB | General PM tasks, fast responses |
| `llama3.1:70b` | 40 GB | Deep analysis, complex strategy |
| `codellama:7b` | 3.8 GB | Technical specs, API design |
| `mistral:7b` | 4.1 GB | European language support, concise answers |
| `gemma2:9b` | 5.4 GB | Balanced quality and speed |

## Usage

```bash
phantom chat --model ollama:llama3.1:8b
```

## Configuration

Ollama defaults to `http://localhost:11434`. To use a remote Ollama instance:

```bash
phantom config set providers.ollama.baseUrl http://your-server:11434
```

## Tips

- **8B models** are great for quick iteration and testing.
- **70B models** produce significantly better analysis but require 48+ GB RAM.
- Run `ollama list` to see which models you have installed.
