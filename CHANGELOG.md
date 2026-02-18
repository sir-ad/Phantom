# Changelog

All notable changes to Phantom will be documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/). Versioning: [SemVer](https://semver.org/).

## [Unreleased]

### Added
- 5 new beta modules: `autopilot`, `mind-map`, `scope-guard`, `retro-ai`, `stakeholder-sim`
- Matrix-style README with ASCII architecture and 17-module showcase
- Docusaurus documentation site at [sir-ad.github.io/Phantom/](https://sir-ad.github.io/Phantom/)
- GitHub Pages deployment workflow
- Cinematic code comments across all core packages

### Changed
- CONTRIBUTING.md rewritten (Nadh-style, concise)
- SECURITY.md rewritten with clear scope and features table
- CI simplified to Node 20, Ubuntu + macOS
- Release workflow modernized (`softprops/action-gh-release@v2`)

### Fixed
- CI build failure from compile-time dependency on `@phantom-pm/modules`
- Release workflow using deprecated GitHub Actions

## [2.0.0] - 2026-02-18 "Wings of Depth" 🦅

### 🚀 Major Features
-   **Universal Agent ("Wings of Depth")**: Phantom now transcends the CLI to become a persistent OS-level agent.
-   **Phantom Oracle (Chrome Extension)**: A "New Tab" experience that provides philosophical calibration based on your active LLM context.
-   **Deep Task Analysis**: Recursive, agentic task decomposition engine that breaks down complex goals into executed sub-agents.
-   **Kailash Nadh-Style CLI**: A complete aesthetic overhaul of the `README` and CLI output to a minimalist, engineering-first "hacker" vibe.

### ✨ Improvements
-   **Installation**: Rewrote `install.sh` to be robust, NPM-native, and PATH-aware.
-   **Documentation**: Migrated to a premium Zola-based documentation site with dedicated feature guides.
-   **Performance**: Optimized startup time and reduced module loading overhead.

### 📦 Distribution
-   **Standalone Oracle**: The Chrome Extension is now available as a standalone `PhantomOracle` product package.
-   **NPM-First**: Shifted distribution strategy to rely strictly on NPM/NPX for maximum compatibility.

## [1.0.0] - 2026-02-18

### Added
- Initial release of Phantom PM Operating System
- Core CLI with 20+ commands
- Context engine for codebase understanding
- AI provider integration (OpenAI, Anthropic, Gemini, Ollama)
- MCP server for IDE integration (Cursor, Windsurf, Claude Desktop, + 8 more)
- 12 built-in modules: prd-forge, story-writer, sprint-planner, swarm, competitive, analytics-lens, oracle, experiment-lab, ux-auditor, time-machine, figma-bridge, bridge
- Terminal UI with Matrix theme
- Installation scripts for macOS, Linux, Windows
- Comprehensive test suite (18 smoke + contract tests)

[Unreleased]: https://github.com/sir-ad/Phantom/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/sir-ad/Phantom/releases/tag/v1.0.0