# Metrics and KPI Framework

Owner: PhantomPM PM + Analytics Team  
Last Updated: 2026-02-13  
Status: Real

## North Star

Accelerate high-quality product decisions and execution with less coordination overhead.

## KPI Layers

## Acquisition and Activation

1. Install conversion rate
   - definition: installs / install CTA interactions
2. Time to first successful command (TTFSC)
   - definition: time from install completion to first successful command execution
3. Time to first artifact (TTFA)
   - definition: time from install to first generated PRD/report artifact

## Product Value

1. Weekly active operators
2. Commands per active user
3. Artifact generation frequency
4. Decision-to-action completion rate

## Reliability and Trust

1. CLI command success rate
2. Build/test gate pass rate
3. Docs truth consistency score
4. User-reported trust score (qualitative pulse)

## Integration Adoption

1. Integration scan usage rate
2. Integration connect success rate
3. Integration doctor pass rate
4. Adapter usage by ecosystem target

## Website Funnel

1. Landing -> install command copy rate
2. Install page -> successful onboarding conversion
3. Docs visits to active usage correlation

## Security and Privacy

1. percentage of users on local-only model configuration
2. permission prompts per session (quality proxy)
3. audit log completeness rate (when available)

## KPI Targets (v1)

1. install conversion: > 15% from qualified visits
2. TTFSC: <= 120 seconds
3. TTFA: <= 10 minutes
4. command success: > 99% on core flows
5. integration connect success: > 90% on supported targets

## Instrumentation Principles

1. privacy-first collection strategy
2. no sensitive product context in telemetry payloads
3. event schemas versioned and documented
4. explicit opt-in when required

## Review Cadence

1. weekly: acquisition, activation, reliability
2. biweekly: value and integration metrics
3. monthly: strategy and roadmap adjustment decisions
