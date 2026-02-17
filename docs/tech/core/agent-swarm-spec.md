# Agent Swarm Specification

Owner: PhantomPM Core + Agent Platform Teams  
Last Updated: 2026-02-13  
Status: Beta

## Current Implementation State

Implemented:

1. seven agent archetypes
2. parallel execution orchestration
3. consensus reducer and recommendation formatting
4. progress callback support

Limitation:

1. many outputs are simulation-driven and may include randomized confidence/verdict behavior

Reference: `packages/core/src/agents.ts`

## Target State

1. deterministic evidence-backed outputs
2. explicit provenance for claims
3. configurable weighting by query class
4. reproducible execution with optional seed/logging metadata

## Query Pipeline

1. classify query intent
2. select active agents
3. run agent analyses
4. normalize outputs to shared schema
5. aggregate consensus
6. generate recommendation + assumptions + uncertainty

## Output Schema

Per-agent:

1. verdict
2. confidence
3. summary
4. evidence items
5. assumptions

Global:

1. consensus tier
2. overall confidence
3. recommendation
4. per-agent trace

## Failure Handling

1. degraded mode if one or more agents fail
2. explicit warning if consensus quality is reduced
3. hard fail only when minimum quorum unavailable

## Acceptance Criteria

1. same input + same context yields stable outputs
2. confidence values tied to evidence quality, not random generation
3. failure states are visible to users and logs
