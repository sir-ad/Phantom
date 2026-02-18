---
sidebar_position: 1
title: Interactive Chat
---

# Interactive Chat

The chat REPL is Phantom's primary interface. It's an intelligent, streaming conversation with your connected LLM, guided by PM frameworks.

## Launching Chat

```bash
# Default — auto-detects best available model
phantom

# Specify a model
phantom chat --model gpt-4o

# Specify provider and model
phantom chat --provider ollama --model llama3.1:8b
```

## The Prompt

Once connected, you'll see Phantom's boot sequence and a prompt showing your active provider and model:

```
phantom (ollama:llama3.1) ▸
```

Type any product question, and Phantom will stream a structured response.

## How It Thinks

Phantom isn't a generic chatbot. Its system prompt instructs it to:

1. **Apply PM Frameworks**: RICE scoring, MoSCoW prioritization, Kano analysis, JTBD.
2. **Think in Structure**: Every response has clear sections (Problem, Analysis, Recommendation).
3. **Challenge Assumptions**: Phantom will push back on weak requirements.
4. **Quantify Impact**: Responses include estimated effort, risk level, and expected outcomes.

### Example

```
phantom (gemini:gemini-2.0-flash) ▸ Should we add dark mode to our mobile app?

◈ ANALYSIS

  Framework: RICE Scoring
  ─────────────────────────────────
  Reach:      High (85% of users on mobile)
  Impact:     Medium (accessibility + aesthetics)
  Confidence: High (industry standard feature)
  Effort:     Low-Medium (2-3 sprint cycles)
  RICE Score: 7.2 / 10

  Recommendation: SHIP IT
  Dark mode is a high-reach, low-effort feature with strong user demand.
  Prioritize via MoSCoW as a "Should Have" for the next release.
```

## Slash Commands

These commands are available inside the chat:

| Command | Description |
|---------|-------------|
| `/model <name>` | Switch to a different model mid-conversation |
| `/provider` | Show all providers and their status (✓/✗) |
| `/swarm <question>` | Trigger a multi-agent swarm debate |
| `/prd <title>` | Generate a Product Requirements Document |
| `/clear` | Reset conversation history |
| `/help` | Show all available commands |
| `/exit` | Exit Phantom |

## Model Switching

Switch models without leaving the chat:

```
phantom (ollama:llama3.1) ▸ /model gpt-4o
  ✓ Switched to openai:gpt-4o

phantom (openai:gpt-4o) ▸ Now using GPT-4o for this conversation
```

## Conversation Context

Phantom maintains conversation history within a session. This means:
- Follow-up questions reference previous context.
- You can refine analysis by asking "what about X?" after an initial response.
- Use `/clear` to reset context and start fresh.

## Tips for Best Results

1. **Be specific**: "Should we add social login?" is better than "What features should we add?"
2. **Provide context**: "We're a B2B SaaS with 500 enterprise customers" gives Phantom data to work with.
3. **Use follow-ups**: Ask Phantom to drill into specific aspects of its analysis.
4. **Try different models**: GPT-4o excels at strategy, Claude at writing, Gemini at speed.
