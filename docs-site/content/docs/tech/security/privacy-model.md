+++
title = "Privacy Model"
+++

# Security and Privacy Model

Owner: PhantomPM Security Team  
Last Updated: 2026-02-13  
Status: Beta

## Security Posture

PHANTOM defaults to local-first operation and explicit control of external actions.

## Current Implementation State

1. local config storage exists
2. permission level field exists in config
3. no fully enforced encryption/keychain/audit system yet

## Target State

1. encrypted sensitive data at rest
2. OS keychain-backed secret storage
3. enforceable action permission policies
4. structured local audit log

## Data Classification

1. public/non-sensitive metadata
2. project-sensitive context data
3. credentials/secrets

## Control Requirements

1. credentials stored in keychain abstraction
2. context store access constrained to explicit paths
3. external integrations require explicit consent
4. secure defaults on first run

## Threat Model (v1)

Primary concerns:

1. accidental leakage via logs or external calls
2. local credential exposure
3. over-privileged integrations

Mitigations:

1. redaction in logs
2. least-privilege integration scopes
3. explicit opt-in for external features

## Claims Policy

No public claim of completed encryption/keychain protections without implementation and tests.

## Acceptance Criteria

1. security-sensitive docs match implementation state
2. all secret-handling paths have clear storage behavior
3. permission model documented and testable
