# Product Hunt Runbook

Owner: PhantomPM GTM Team  
Last Updated: 2026-02-13  
Status: Planned

## Objective

Launch PHANTOM on Product Hunt with a trustworthy narrative: bold vision plus explicit `Real/Beta/Planned` status.

## Pre-Launch Checklist

1. Repo public at `github.com/sir-ad/phantom`
2. CI passing (`.github/workflows/ci.yml`)
3. Install path tested with:
   - `npm run release:local`
   - `npm run installer:test-local`
4. Website locally verifiable:
   - `npm run website:dev`
5. Demo scripts labeled `Demo Mode` where applicable

## Launch Assets

1. Thumbnail: PHANTOM ASCII + “Open Source PM OS”
2. Gallery:
   - one-line install
   - swarm analysis output
   - MCP tool listing
   - integrations scan/doctor
3. 60-second demo video
4. First comment draft:
   - problem statement
   - local-first + open-source positioning
   - direct install and GitHub links

## Launch Day Timeline (PT)

1. 06:00 publish Product Hunt listing
2. 06:10 post launch thread on X/LinkedIn
3. 06:20 post GitHub release notes
4. Hourly:
   - monitor install errors/issues
   - answer PH comments
   - update FAQ in docs as needed

## Metrics

1. PH upvotes
2. GitHub stars
3. install command copy rate (website)
4. successful first-run rate (`phantom --version` + `phantom doctor`)

## Incident Protocol

1. If installer breaks:
   - switch primary install call-to-action to npm fallback
   - pin issue in repo with workaround
2. If MCP/integration flow breaks:
   - mark affected path `Beta` in docs and listing copy immediately
