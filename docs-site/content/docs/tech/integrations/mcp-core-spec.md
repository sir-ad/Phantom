+++
title = "Mcp Core Spec"
+++


Owner: PhantomPM Integrations Team  
Last Updated: 2026-02-13  
Status: Beta

## Goal

Define PHANTOM as a local MCP provider with stable, versioned capabilities for coding agents and IDE clients.

## Current Implementation State

1. MCP server package exists at `packages/mcp-server`.
2. Stdio server path is available via `phantom mcp serve`.
3. Tool contracts implemented: `context.add`, `context.search`, `prd.generate`, `swarm.analyze`, `bridge.translate_pm_to_dev`.
4. Integration data model exists in config layer.

## Target State

A local MCP core service with:

1. capability discovery
2. tool execution
3. resource retrieval
4. permission-aware behavior

## Initial Capability Surface

Tools:

1. `context.add`
2. `context.search`
3. `prd.generate`
4. `swarm.analyze`
5. `bridge.translate_pm_to_dev`

Resources:

1. active project summary
2. installed modules summary
3. capability matrix snapshot

## Tool Contract Shape

Each tool request includes:

1. `tool`
2. `arguments`
3. `request_id`

Each response includes:

1. `request_id`
2. `status`
3. `result`
4. `errors[]` when applicable

## Initial Tool Input/Output Contracts

1. `context.add`
   - input: `path`, optional `mode`
   - output: `stats` with files/types/languages/health
2. `context.search`
   - input: `query`, optional `limit`
   - output: `matches[]` with path, snippet, and type
3. `prd.generate`
   - input: `title`, optional `scope`, optional `constraints[]`
   - output: `prd_id`, `markdown`, optional `output_path`
4. `swarm.analyze`
   - input: `question`, optional `context_scope`, optional `agents[]`
   - output: `consensus`, `confidence`, `agent_reports[]`
5. `bridge.translate_pm_to_dev`
   - input: `pm_intent`, optional `product_constraints`
   - output: `technical_tasks[]`, `acceptance_criteria[]`, `risks[]`

## Permission Model

1. default allow for local read actions
2. explicit policy checks for external side effects
3. denial responses include remediation guidance

## Observability

1. request duration metrics
2. error class counts
3. adapter-level success/failure counters

## Acceptance Criteria

1. MCP capability listing is deterministic
2. tool responses conform to documented schema
3. permission denials are explicit and auditable
