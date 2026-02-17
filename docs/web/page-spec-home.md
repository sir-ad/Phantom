# Page Spec: Home

Owner: PhantomPM Web Team  
Last Updated: 2026-02-13  
Status: Planned

## Goal

Drive install command copy and move users into first success path.

## Sections

1. Hero:
   - value proposition
   - primary install CTA
2. Live terminal demo:
   - clearly marked if demo mode
3. "How it works" flow
4. Feature grid with status tags
5. Integration proof section
6. Social/open-source proof
7. Final CTA block

## Content Requirements

1. primary CTA uses canonical command string
2. links to install and quickstart docs
3. includes trust links: capability matrix and security page

## Instrumentation

1. event: `home_install_copy`
2. event: `home_docs_click`
3. event: `home_demo_interaction`

## Acceptance Criteria

1. install CTA visible above fold on desktop and mobile
2. no unsupported claims without status tags
3. all primary links resolve to valid routes
