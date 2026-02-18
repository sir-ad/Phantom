+++
title = "Contributing"
+++

---
sidebar_position: 11
title: Contributing
---

# Contributing

Phantom is open source (MIT) and we welcome contributions of all kinds.

## Getting Started

1. **Fork** the repository on GitHub.
2. **Clone** your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Phantom.git
   cd phantom
   ```
3. **Install** dependencies:
   ```bash
   npm install
   ```
4. **Build** the project:
   ```bash
   npm run build
   ```
5. **Run tests**:
   ```bash
   npm run test
   ```

## Development Workflow

```bash
# Run the CLI locally
npm run phantom

# Or directly
node packages/cli/dist/index.js

# Run tests
npm run test

# Format code
npm run format
```

## Project Structure

```
phantom/
├── packages/
│   ├── core/           # AI providers, config, context
│   ├── cli/            # Terminal interface & commands
│   ├── mcp-server/     # Model Context Protocol server
│   ├── tui/            # Terminal UI components
│   ├── modules/        # PM capability plugins
│   └── integrations/   # External tool connectors
├── tests/              # Smoke & contract tests
├── scripts/            # Build & release scripts
├── website/            # Static website (GitHub Pages)
└── docs-site/          # This documentation (Docusaurus)
```

## Adding a New AI Provider

1. Create `packages/core/src/ai/providers/your-provider.ts`.
2. Extend `BaseAIProvider` and implement `complete()`, `stream()`, `isAvailable()`.
3. Add the provider to `AIManager.initializeProviders()` in `packages/core/src/ai/manager.ts`.
4. Add a config entry in `createAIManagerFromConfig()`.

## Adding a New Module

1. Create `packages/modules/src/your-module.ts`.
2. Export a class implementing the module interface.
3. Register the module in `packages/modules/src/index.ts`.

## Pull Request Guidelines

- Keep PRs focused on a single change.
- Add tests for new functionality.
- Follow existing code style (Prettier + ESLint).
- Update documentation if behavior changes.

## Code Style

- **TypeScript** for all source code.
- **Prettier** for formatting (`npm run format`).
- **No `any`** unless absolutely necessary.
- **Descriptive names** over comments.

## Reporting Issues

- Use [GitHub Issues](https://github.com/sir-ad/Phantom/issues).
- Include your OS, Node.js version, and steps to reproduce.
- Tag with appropriate labels (`bug`, `feature`, `docs`).
