# Contributing to PHANTOM

Thanks for contributing.

## Setup

```bash
npm install
npm run build
npm run test
```

## Development Commands

```bash
npm run build
npm run test
npm run phantom -- --help
npm run phantom -- doctor
npm run phantom -- status --json
```

## Pull Request Expectations

1. Build and tests pass.
2. New/changed command behavior is covered in `tests/smoke.test.mjs` when practical.
3. Avoid committing generated `dist/` artifacts.
4. Keep behavior labels accurate (`Real`, `Beta`, `Planned`) in user-facing copy.
