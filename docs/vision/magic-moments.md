# Magic Moments

Owner: PhantomPM Vision Team  
Last Updated: 2026-02-13  
Status: Planned

## Purpose

Define signature user experiences that communicate PHANTOM value quickly.

This is a vision and design document. Use `docs/status/*` for implementation state.

## Moment 1: First Command Confidence

Scenario:

1. user installs PHANTOM
2. user asks a product question in natural language
3. PHANTOM produces a recommendation with structured rationale

Success signal:

1. user says "this is already useful" within first 5 minutes

## Moment 2: PM-to-Dev Bridge Clarity

Scenario:

1. user expresses high-level PM intent
2. PHANTOM returns technical tasks, acceptance criteria, and delivery risks

Success signal:

1. engineering can begin implementation without additional translation meetings

## Moment 3: Context Compression

Scenario:

1. user points PHANTOM at repository + docs + screenshots
2. PHANTOM summarizes product state and top risks

Success signal:

1. user recovers project context in under 10 minutes after context switch

## Moment 4: Decision Stack in One Pass

Scenario:

1. user asks "Should we build X now?"
2. PHANTOM returns:
   - opportunity assessment
   - expected impact
   - effort estimate
   - risks
   - recommendation

Success signal:

1. a decision can be made in a single review cycle

## Persona-Based Moments

## Solo Founder

Pain:

1. no dedicated PM bandwidth
2. fragmented prioritization

Moment target:

1. weekly plan and feature specs generated with minimal overhead

## Startup PM

Pain:

1. repetitive stakeholder updates
2. roadmap + sprint synchronization burden

Moment target:

1. one command produces stakeholder-ready report + team-ready task framing

## Product Engineer

Pain:

1. unclear product intent behind technical asks

Moment target:

1. feature request includes user value, metrics, and acceptance criteria immediately

## Enterprise Product Lead

Pain:

1. cross-team coordination and portfolio visibility

Moment target:

1. shared portfolio view with dependencies and risk tiers

## Demo Composition Rules

1. demos should show complete loop: question -> analysis -> artifacts -> actions
2. include an explicit `Demo Mode` label when data is illustrative
3. avoid fabricated claims of production integrations if not implemented

## Instrumentation Metrics

1. time-to-first-artifact
2. recommendation acceptance rate
3. iteration count before final scope lock
4. follow-up question rate after initial answer
