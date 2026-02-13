# Contributing to PHANTOM

Thanks for contributing.

## Setup

```bash
npm install
npm run build
npm run test
npm run reality:check
```

## Development Commands

```bash
npm run build
npm run test
npm run phantom -- --help
npm run phantom -- doctor
npm run phantom -- status --json
npm run phantom -- swarm "Should we build X?" --json
npm run phantom -- integrate scan --json
```

## Pull Request Expectations

1. Build and tests pass.
2. `npm run reality:check` passes (no simulated/demo runtime markers).
3. New/changed command behavior is covered in `tests/smoke.test.mjs` when practical.
4. Avoid committing generated `dist/` artifacts.
5. Keep behavior labels accurate (`Real`, `Beta`, `Planned`) in user-facing copy.
