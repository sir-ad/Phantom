# Contributing

Phantom is open source under [MIT](./LICENSE). Contributions welcome.

## Quick Start

```bash
git clone https://github.com/sir-ad/Phantom.git
cd phantom
npm install
npm run build
npm test        # 18 tests, all green
```

## Project Layout

```
packages/
  cli/            Command-line interface + REPL
  core/           Context engine, AI manager, modules
  mcp-server/     Model Context Protocol server
  modules/        17 built-in PM modules
  tui/            Terminal UI (matrix theme)
  integrations/   IDE auto-detection
```

## Making Changes

1. Fork → branch → code → test → PR.
2. Use [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`.
3. Run `npm run build && npm test` before pushing.
4. Keep PRs focused — one feature or fix per PR.

## Writing Modules

Every module lives in `packages/modules/src/` and exports functions that take args and return `ModuleResult`. See existing modules for the pattern. To register a new module, add its manifest to `BUILTIN_MODULES` in `packages/core/src/modules.ts`.

## Issues

- **Bug?** → [Open an issue](https://github.com/sir-ad/Phantom/issues/new) with steps to reproduce.
- **Feature idea?** → [Open a discussion](https://github.com/sir-ad/Phantom/issues/new) first.
- **Question?** → Check the [docs](https://sir-ad.github.io/Phantom/) first.

## Code Style

TypeScript strict mode. Run `npm run lint` and `npm run format:check`.

## License

By contributing, you agree your code will be MIT-licensed. See [LICENSE](./LICENSE).
