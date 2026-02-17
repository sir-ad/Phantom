# Roadmap Status

Owner: PhantomPM PM Team  
Last Updated: 2026-02-13  
Status: Real

This is the execution progress tracker aligned to the foundation-first strategy.

## Timeline Overview

- Phase A (Weeks 1-2): Documentation production and truth alignment.
- Phase B (Weeks 3-4): Foundation repair and reliability.
- Phase C (Weeks 5-6): One-line installer delivery.
- Phase D (Weeks 7-9): MCP core and initial adapters.
- Phase E (Weeks 10-12): Website launch track.

## Phase A: Documentation Sprint

Status: In Progress

Completed:
1. Docs architecture defined.
2. Status model and capability matrix created.
3. Vision, PM, technical, web, and user documentation authored.

Remaining:
1. Final consistency pass between README and status docs.
2. Add release checklist references in contributor docs.

Exit Criteria:
1. Every major README claim has a backing doc.
2. No unresolved placeholders in docs tree.

## Phase B: Foundation Repair

Status: In Progress

Scope:
1. Fix CLI startup/command architecture issues.
2. Restore deterministic green build.
3. Resolve cross-package typing/wiring issues.
4. Repair empty modules package build behavior.
5. Add baseline lint/test smoke checks.

Exit Criteria:
1. `npm run build` succeeds.
2. `phantom --help` runs successfully.
3. CLI core routes are stable.

## Phase C: Installer Delivery

Status: Planned

Scope:
1. Implement install script(s).
2. Implement release manifest format.
3. Add checksum verification and fallback path.
4. Publish install and troubleshooting docs.

Exit Criteria:
1. Fresh install to first successful command within target time.
2. Installer passes OS/arch matrix tests.

## Phase D: MCP + Adapters

Status: Planned

Scope:
1. Build MCP core contract implementation.
2. Ship first adapters: Claude Code, Codex path, Cursor, VS Code.
3. Implement integration health checks and docs.

Exit Criteria:
1. At least one end-to-end adapter flow verified.

## Phase E: Website Launch

Status: Planned

Scope:
1. Build website with install-first conversion path.
2. Align all marketed capabilities with status tags.
3. Launch instrumentation and operational runbook.

Exit Criteria:
1. Capability status is accurate on all public pages.
2. Install funnel is measurable end-to-end.

## Risk Register

1. Risk: over-marketing before reliability.
   - Mitigation: strict status-tag policy.
2. Risk: integration complexity expansion.
   - Mitigation: MCP-first architecture and phased adapters.
3. Risk: install friction by platform variation.
   - Mitigation: manifest-driven installer + fallback install path.
