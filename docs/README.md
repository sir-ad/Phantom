# PHANTOM Documentation

Owner: PhantomPM Core Team  
Last Updated: 2026-02-13  
Status: Real

This directory is the canonical source of truth for product, technical, user, and launch documentation for PHANTOM.

## Documentation Model

PHANTOM uses a dual-track documentation model:

1. Vision track (`docs/vision/*`): bold, cinematic, aspirational narrative.
2. Product truth track (`docs/status/*`, `docs/user/*`, `docs/tech/*`): factual, implementation-grounded content with capability status tags.

All user-facing feature claims must be tagged with one of:

- `Real`: implemented and verified in current code.
- `Beta`: implemented partially or behind constraints/flags.
- `Planned`: not implemented yet.

## Navigation

## Status

- [`docs/status/capability-matrix.md`](./status/capability-matrix.md)
- [`docs/status/demo-vs-real.md`](./status/demo-vs-real.md)
- [`docs/status/roadmap-status.md`](./status/roadmap-status.md)

## Vision

- [`docs/vision/phantom-magical-os.md`](./vision/phantom-magical-os.md)
- [`docs/vision/magic-moments.md`](./vision/magic-moments.md)
- [`docs/vision/agent-personas.md`](./vision/agent-personas.md)
- [`docs/vision/2-year-vision.md`](./vision/2-year-vision.md)

## Product Management

- [`docs/pm/prd-phantom-v1.md`](./pm/prd-phantom-v1.md)
- [`docs/pm/personas-jtbd.md`](./pm/personas-jtbd.md)
- [`docs/pm/metrics-kpi-framework.md`](./pm/metrics-kpi-framework.md)
- [`docs/pm/roadmap-quarterly.md`](./pm/roadmap-quarterly.md)
- [`docs/pm/launch-plan.md`](./pm/launch-plan.md)
- [`docs/pm/product-hunt-runbook.md`](./pm/product-hunt-runbook.md)

## Technical

- [`docs/tech/architecture-overview.md`](./tech/architecture-overview.md)
- [`docs/tech/installer/one-line-installer-spec.md`](./tech/installer/one-line-installer-spec.md)
- [`docs/tech/installer/install-script-design.md`](./tech/installer/install-script-design.md)
- [`docs/tech/installer/release-manifest-schema.md`](./tech/installer/release-manifest-schema.md)
- [`docs/tech/integrations/mcp-core-spec.md`](./tech/integrations/mcp-core-spec.md)
- [`docs/tech/integrations/adapter-specs.md`](./tech/integrations/adapter-specs.md)
- [`docs/tech/core/context-engine-spec.md`](./tech/core/context-engine-spec.md)
- [`docs/tech/core/agent-swarm-spec.md`](./tech/core/agent-swarm-spec.md)
- [`docs/tech/security/privacy-model.md`](./tech/security/privacy-model.md)
- [`docs/tech/testing/test-strategy.md`](./tech/testing/test-strategy.md)

## Web

- [`docs/web/website-prd.md`](./web/website-prd.md)
- [`docs/web/design-system.md`](./web/design-system.md)
- [`docs/web/page-spec-home.md`](./web/page-spec-home.md)
- [`docs/web/page-spec-install.md`](./web/page-spec-install.md)
- [`docs/web/page-spec-docs.md`](./web/page-spec-docs.md)
- [`docs/web/page-spec-modules.md`](./web/page-spec-modules.md)
- [`docs/web/seo-analytics.md`](./web/seo-analytics.md)
- [`docs/web/launch-runbook.md`](./web/launch-runbook.md)

## User

- [`docs/user/install.md`](./user/install.md)
- [`docs/user/quickstart.md`](./user/quickstart.md)
- [`docs/user/integrations.md`](./user/integrations.md)
- [`docs/user/modules.md`](./user/modules.md)
- [`docs/user/troubleshooting.md`](./user/troubleshooting.md)

## Documentation Quality Gates

1. Every `Real` claim must be testable via CLI or source inspection.
2. Every demo transcript must be marked `Demo Mode` if nondeterministic.
3. Every technical spec must include:
   - current implementation state
   - target state
   - acceptance criteria
4. `README.md` and website marketing pages must link to status docs.

## Ownership and Update Cadence

- Status docs: update every release.
- Technical specs: update when interfaces or schemas change.
- PM roadmap and launch docs: update weekly.
- User docs: update with each CLI command or behavior change.
