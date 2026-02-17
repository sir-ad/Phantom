# Demo vs Real Behavior Map

Owner: PhantomPM Core Team  
Last Updated: 2026-02-13  
Status: Real

This document prevents trust erosion by explicitly separating deterministic production behavior from scripted/demonstration behavior.

## Policy

1. `Demo Mode` must be explicitly labeled in output, docs, or UI.
2. User docs (`docs/user/*`) describe real behavior first.
3. Vision docs may include cinematic transcripts, but they must not be presented as current production behavior unless status is `Real`.

## Current Mapping

| Area | Real Today | Demo/Simulated Today | Gap to Close |
|---|---|---|---|
| Context ingest | File traversal, type detection, basic stats | N/A | Add persistent embedding index and semantic relevance scoring. |
| PRD generation | Markdown PRD template generation | Advanced context-aware PRD claims | Add context-driven generation and PRD lifecycle store. |
| Swarm analysis | Parallel agent execution framework | Verdict/confidence/details randomized | Replace with deterministic model-backed analysis pipeline. |
| Screen audit | TUI renderers and report format | Example issue payloads, static audits | Add image parser and rule engine/vision model pipeline. |
| Health dashboard | UI layout and data model | Static sample metrics/integrations | Wire to real runtime/system/model telemetry. |
| Docs generation | Command shell exists | Prints simulated file list | Implement artifact generator writing files. |
| Integrations | Config storage and initial command surfaces | Full tool sync and API actions | Implement auth flows + provider adapters + action engine. |

## Command-Level Truth

| Command | Current Execution Mode | Notes |
|---|---|---|
| `phantom context add <path>` | Real | Indexing happens now. |
| `phantom prd create "Title"` | Real/Beta | File output is real, content depth is template-level. |
| `phantom swarm "Question"` | Demo Mode | Parallel pipeline real, recommendation content simulated. |
| `phantom screen analyze <path>` | Demo Mode | Renders example analysis payload. |
| `phantom screen audit <dir>` | Demo Mode | Renders example aggregate UX audit. |
| `phantom health` | Demo Mode | Uses static default data. |
| `phantom docs generate` | Demo Mode | Does not write artifacts yet. |

## Required Labeling Changes

1. Any command currently in demo mode should output a first-line label:
   - `Demo Mode: This output uses simulated/example data.`
2. Website demo section must include a clear label where outcomes are illustrative.
3. README examples must avoid implying deterministic factual analysis where current implementation is simulated.

## Conversion Plan to Real

1. Swarm:
   - deterministic prompts
   - result provenance per agent
   - confidence from evidence, not random values
2. Screen analysis:
   - parse real inputs
   - apply auditable rule checks
   - attach issue evidence references
3. Health:
   - source from runtime metrics and real integration checks
4. Docs generation:
   - write files to project path
   - define output schema and versioning
