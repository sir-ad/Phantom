# Configuration & Provider Integrations

Phantom requires an underlying brain. Fortunately, the core architecture is inherently model-agnostic. 

We aggressively support the SOTA (State of the Art) across all major frontiers. 

## The Setup Utility

After executing `phantom boot`, you config the system by executing:

```bash
npx @phantom-pm/cli@latest config setup
```

This will trigger a terminal UI walking you through injecting your API keys securely into Phantom's memory banks (`~/.phantom/config.json`).

## Supported Super Intellects

### 1. OpenAI (The Mainstream Benchmark)
- **Supported Models:** `gpt-4o`, `gpt-4o-mini`, `o1`, `o3-mini`
- **Setup:** Provide your `OPENAI_API_KEY`.

### 2. Anthropic (The OS Agent Standard)
- **Supported Models:** `claude-3.7-sonnet`, `claude-3-opus`, `claude-3.5-haiku`
- **Note:** Claude 3.7 Sonnet is currently the *strictly recommended* model if you plan to boot `OpenClaws` via the Browser Agent due to its native Computer Use `xy` API blocks.

### 3. DeepSeek (The Mathematical Vanguard)
- **Supported Models:** `deepseek-chat` (V3), `deepseek-reasoner` (R1)
- **Setup:** Provide your `DEEPSEEK_API_KEY`. Perfect for exhaustive PRD logic and rigorous technical requirement generation.

### 4. Gemini (The Context Behemoth)
- **Supported Models:** `gemini-3.1-pro`
- **Use Case:** Pumping entire Slack histories or 100-page Notion transcripts into Phantom for Rowboat Semantic Mapping.

### 5. Ollama (The Absolute Privacy Airgap)
- **Supported Models:** `llama3.1:8b`, `qwen2.5`, `mistral`, `deepseek-coder-v2`
- **Use Case:** 100% offline, privacy-centric PMing.
- **Setup:** Ensure Ollama is running (`ollama serve`) and phantom will natively intercept localized calls to `localhost:11434`.

---

## Modifying Configurations Mid-Flight

Phantom allows you to hot-swap intellects on the fly during a single Chat session.

In the CLI Omnibar:
```bash
# Force the Chat module to utilize Claude
npx @phantom-pm/cli@latest chat --provider anthropic --model claude-3.7-sonnet
```
