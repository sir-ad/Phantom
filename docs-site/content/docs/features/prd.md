+++
title = "Prd"
+++

---
sidebar_position: 3
title: PRD Generation
---

# PRD Generation

Generate comprehensive Product Requirements Documents from a single sentence.

## Usage

```bash
# From the terminal
phantom prd "Dark Mode for Mobile App"

# From inside chat
phantom (openai:gpt-4o) ▸ /prd User onboarding email sequence
```

## What Gets Generated

Phantom produces a structured PRD in Markdown format containing:

### 1. Overview
- **Problem Statement**: What user pain point does this solve?
- **Objective**: What does success look like?
- **Target Audience**: Who benefits from this feature?

### 2. User Stories
- As a [persona], I want [action] so that [outcome].
- Acceptance criteria for each story.
- Edge cases and error states.

### 3. Functional Requirements
- Detailed feature specifications.
- Input/output definitions.
- API contracts (if applicable).

### 4. Non-Functional Requirements
- Performance targets (e.g., < 200ms response time).
- Security considerations.
- Accessibility (WCAG 2.1 AA compliance).
- Scalability expectations.

### 5. Technical Approach
- Recommended technology stack.
- Architecture considerations.
- Integration points.

### 6. Success Metrics
- Primary KPIs with target values.
- Secondary metrics.
- How to measure (instrumentation plan).

### 7. Risk Assessment
- Riskiest assumptions.
- Mitigation strategies.
- Dependencies and blockers.

### 8. Timeline
- Phased rollout plan.
- Sprint-level breakdown.
- MVP vs. Full Feature scope.

## Example Output

```markdown
# PRD: Dark Mode for Mobile App

## Problem Statement
72% of mobile users prefer dark mode, but our app only supports light theme.
This results in poor nighttime UX and accessibility complaints.

## User Stories

### US-1: Toggle Dark Mode
- **As a** mobile user
- **I want** to switch between light and dark themes
- **So that** I can use the app comfortably in low-light environments

**Acceptance Criteria:**
- [ ] Toggle accessible from Settings > Appearance
- [ ] System default option (follows OS setting)
- [ ] Persists across sessions
- [ ] All screens render correctly in both modes

## Success Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Adoption rate | 40% of MAU | Analytics toggle events |
| Session duration (night) | +15% | Compare pre/post |
| App store rating | +0.2 stars | Monitor reviews |

## Timeline
- **Sprint 1**: Design system tokens + core screens
- **Sprint 2**: Remaining screens + settings UI
- **Sprint 3**: QA + beta rollout
```

## Options

| Flag | Description |
|------|-------------|
| `--output <path>` | Save PRD to a specific file |
| `--json` | Output as structured JSON |
| `--model <name>` | Use a specific model for generation |

## Tips

- **More context = better PRDs**: Include your product name, target market, and constraints.
- **Iterate**: Use the chat REPL to refine sections after generation.
- **Version control**: Save PRDs to your repo and track changes over time.
