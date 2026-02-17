# Launch Runbook

Owner: PhantomPM GTM Team  
Last Updated: 2026-02-13  
Status: Planned

## Purpose

Coordinate launch execution with clear ownership, timing, and fallback actions.

## T-7 Days

1. freeze launch scope
2. run docs truth consistency check
3. validate install flow on supported platforms
4. verify website route and metadata health

## T-2 Days

1. prepare launch posts and media assets
2. perform dry-run of install demo
3. prepare incident response channels

## Launch Day Checklist

1. deploy website
2. verify install endpoint live and hash-valid
3. publish launch announcements
4. monitor conversion and error dashboards hourly

## Incident Protocol

Severity 1:

1. installer broken or command bootstrap failure
2. immediate rollback to prior known-good release
3. pinned status notice on website/docs

Severity 2:

1. non-blocking integration failure
2. publish workaround in troubleshooting docs
3. patch in next hotfix window

## Post-Launch (Day 1-7)

1. summarize onboarding friction points
2. prioritize hotfixes
3. publish transparent changelog and roadmap updates

## Acceptance Criteria

1. launch ownership and contacts documented
2. rollback steps tested and time-bounded
3. daily launch report produced for first week
