# Context Engine Specification

Owner: PhantomPM Core Team  
Last Updated: 2026-02-13  
Status: Real

## Current Implementation State

Implemented:

1. recursive file indexing
2. extension-based type classification
3. language detection for known extensions
4. simple query search over path/content
5. aggregate context statistics and health score

Reference: `packages/core/src/context.ts`

## Current Limitations

1. in-memory map storage only
2. no persistent embedding index
3. limited semantic relevance ranking
4. large-file content skip threshold is fixed

## Target State

1. persistent index store with incremental updates
2. semantic retrieval path for richer context grounding
3. configurable file limits and ignore policies
4. richer metadata extraction for artifacts

## Public Contract

Primary operations:

1. `addPath(path)`
2. `getStats()`
3. `search(query)`
4. `clear()`

## Data Model

Entry fields:

1. id
2. type (`code|document|image|design|data`)
3. absolute and relative paths
4. metadata including size, extension, modified time, language, lines

## Performance Targets

1. index medium repository (<5k files) in acceptable local time
2. keep memory footprint bounded by configurable limits

## Acceptance Criteria

1. deterministic indexing for same input set
2. search returns stable results for repeated query
3. ignore rules consistently applied
