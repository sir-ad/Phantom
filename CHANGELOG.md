# Changelog

## [2.0.0-alpha.1] - 2026-02-20

### 🚀 Major Features
*   **Crystal Memory (The Brain)**: A dual-layer memory system (Vector + Markdown Wiki). Agents can now "remember" decisions and context explicitly in `.phantom/memory/`.
*   **Adapter Layer (The Body)**: A unified `BaseAdapter` interface. Swappable inputs for CLI, Slack, and Chrome.
*   **Terminal Chic (The Face)**: A complete redesign of the web interface (`packages/app`) and marketing site (`docs-site`) featuring a retro-futurist terminal aesthetic.
*   **Skills Platform (The Hands)**: New `SkillRegistry` allowing agents to dynamically load and utilize tools.
*   **Mission Control**: The Web UI has been transformed into a power console for managing memory and configuration.

### 🛠️ Infrastructure
*   **Monorepo Restructure**: Consolidated `core`, `cli`, `app`, `extension`, `adapters`, `memory` into a unified workspace.
*   **Agent Protocol**: Updated `BaseAgent` with a ReAct loop for autonomous tool usage.
*   **Context Injection**: The Chrome Extension now injects page context directly into the Core API.

### 🐛 Fixes
*   Fixed circular dependencies in `core`.
*   Resolved build issues in `packages/app`.
*   Standardized `tsconfig.json` across all packages.