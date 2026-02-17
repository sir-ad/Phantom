---
sidebar_position: 3
title: Modules
---

# Module System

Phantom's functionality is organized into installable modules. Each module adds a specific PM capability.

## Available Modules

| Module | Description | Command |
|--------|-------------|---------|
| `prd-forge` | PRD generation engine | `phantom prd` |
| `swarm` | Multi-agent consensus | `phantom swarm` |
| `story-writer` | User story generation | `phantom stories` |
| `ux-auditor` | UX/accessibility analysis | `phantom screen` |
| `sprint-planner` | Sprint planning assistance | `phantom sprint` |
| `competitive` | Competitive analysis | `phantom compete` |
| `oracle` | Product prediction engine | `phantom oracle` |
| `bridge` | PM-to-dev translation | `phantom bridge` |
| `analytics-lens` | Metrics analysis | `phantom metrics` |
| `time-machine` | Feature timeline simulation | `phantom timeline` |
| `experiment-lab` | A/B test design | `phantom experiment` |

## Installing Modules

```bash
# List available modules
phantom modules list

# Install a module
phantom modules install prd-forge

# Uninstall a module
phantom modules uninstall prd-forge
```

## Creating Custom Modules

Modules are TypeScript files in `packages/modules/src/`. Each module exports a standard interface:

```typescript
export interface PhantomModule {
  name: string;
  description: string;
  version: string;
  execute(input: ModuleInput): Promise<ModuleOutput>;
}
```

See `packages/modules/src/prd-forge.ts` for a reference implementation.
