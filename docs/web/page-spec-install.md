# Page Spec: Install

Owner: PhantomPM Web Team  
Last Updated: 2026-02-13  
Status: Planned

## Goal

Make installation deterministic and debuggable for supported platforms.

## Sections

1. Primary command block (`curl | sh`)
2. OS tabs: macOS, Linux, Windows
3. fallback methods (`npm`, package managers)
4. verification command (`phantom --version`)
5. first command suggestions
6. troubleshooting quick links

## Content Requirements

1. exact commands must be copy-safe
2. expected output examples clearly labeled
3. platform caveats documented

## Instrumentation

1. event: `install_copy_primary`
2. event: `install_copy_fallback`
3. event: `install_docs_troubleshoot_click`

## Acceptance Criteria

1. all install snippets tested in validation matrix
2. fallback flow documented with prerequisites
3. troubleshooting links map to real user docs
