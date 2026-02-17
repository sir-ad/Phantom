# Install Script Design

Owner: PhantomPM Platform Team  
Last Updated: 2026-02-13  
Status: Beta

## Current Implementation State

Installer implementation exists in repository:

1. `scripts/install.sh`
2. `scripts/install.ps1`

Production endpoint wiring (`phantom.pm/install`) and release hosting are not deployed yet.

## Target State

Two scripts:

1. POSIX shell installer (`install` endpoint)
2. PowerShell installer (`install.ps1` endpoint)

## POSIX Flow

1. strict shell mode and failure trap
2. detect OS and architecture
3. fetch release manifest
4. resolve platform asset URL and expected checksum
5. download asset to temp directory
6. verify checksum
7. unpack and install binary
8. ensure PATH availability
9. install shell completions where supported
10. run `phantom doctor`

## PowerShell Flow

Equivalent behavior with Windows conventions:

1. install path under user profile
2. PATH update using user environment variables
3. hash validation using `Get-FileHash`

## Error Handling Model

Each stage emits:

1. stage name
2. failure reason
3. recommended remediation command

Fatal classes:

1. unsupported platform
2. manifest fetch failure
3. checksum mismatch
4. insufficient permissions for target install path

## Logging

1. default concise output
2. optional verbose mode via env var
3. no sensitive values printed

## Security Notes

1. script must not execute untrusted downloaded code before hash validation
2. script must pin manifest schema version and reject unknown mandatory fields

## Acceptance Criteria

1. scripted install flow reproducible in CI containers/VMs
2. failure classes map to user-facing troubleshooting entries
