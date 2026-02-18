+++
title = "Architecture Overview"
+++

# Architecture Overview

Owner: PhantomPM Platform Team  
Last Updated: 2026-02-13  
Status: Real

## Current Implementation State

PHANTOM is currently a TypeScript monorepo with these active packages:

1. `packages/cli`: command orchestration
2. `packages/core`: config, context, modules, swarm, PRD
3. `packages/tui`: terminal rendering and themed screens
4. `packages/modules`: baseline built-in modules package
5. `packages/mcp-server`: MCP core server and tool contracts

Current runtime model:

1. local CLI process
2. local filesystem indexing for context
3. local JSON configuration in `~/.phantom/config.json`

## Target State

Target architecture adds:

1. one-line installer pipeline and release manifest
2. MCP core server with adapter layer
3. deterministic swarm pipeline with evidence provenance
4. stronger security and audit model

## Config Schema Additions (Public Interface)

Required config keys in persisted user config:

1. `installation.channel`
2. `installation.version`
3. `mcp.enabled`
4. `mcp.server_mode`
5. `integrations[]`
6. `security.audit_log_path`

Current implementation state:

1. configuration includes installation metadata and integrations list
2. MCP and security keys are available in config model
3. compatibility path accepts legacy camelCase keys while writing canonical keys

Target state:

1. schema validation gate for config load/save
2. `phantom doctor` includes config schema diagnostics
3. migration tooling for older config payloads

## Logical Layers

## Interface Layer

1. CLI commands
2. TUI outputs
3. future website and API docs reference

## CLI Contract Additions (Foundation)

Required command surface:

1. `phantom doctor`
2. `phantom integrate scan`
3. `phantom integrate <target>`
4. `phantom integrate doctor`
5. `phantom status --json`

`phantom status --json` contract (current):

1. `version`
2. `firstRun`
3. `activeProject`
4. `installedModules`
5. `integrations`
6. `dataMode`
7. `permissionLevel`
8. `theme`

## Domain Layer

1. context management
2. module registry and lifecycle
3. agent swarm orchestration
4. artifact generation (PRD and future outputs)

## Integration Layer

1. MCP core contracts
2. adapter-specific configuration surfaces

## Storage Layer

1. config store
2. local context index store
3. future artifact store and audit log

## Cross-Cutting Concerns

1. permission policy
2. reliability gates
3. status-tagged documentation parity

## Data Flow (High-Level)

1. user command enters CLI
2. CLI routes to core service
3. core reads context/config/module state
4. core produces deterministic response/artifact
5. CLI/TUI renders result and writes output when applicable

## Architectural Constraints

1. local-first default behavior
2. explicit external action paths
3. deterministic behavior for all `Real` features
4. docs and implementation must remain synchronized

## Acceptance Criteria

1. architecture document reflects current code structure
2. includes current and target states explicitly
3. references installer and MCP as planned extensions
