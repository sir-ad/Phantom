# Security Policy

Owner: PhantomPM Security Team  
Last Updated: 2026-02-13  
Status: Beta

## Reporting a Vulnerability

Until private reporting channels are configured in the new GitHub repo, open an issue with minimal exploit detail and label it `security`.

If active exploitation is likely, avoid posting proof-of-concept details publicly.

## Scope

Security-sensitive areas include:

1. installer scripts and manifest parsing
2. config and secrets handling
3. MCP server input handling
4. integration connection and external actions

## Current Security Posture

1. local-first architecture is implemented
2. installer checksum verification is implemented
3. full keychain and encryption hardening remains `Planned`
