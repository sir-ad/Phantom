+++
title = "Release Manifest Schema"
+++

# Release Manifest Schema

Owner: PhantomPM Platform Team  
Last Updated: 2026-02-13  
Status: Beta

## Endpoint

`https://phantom.pm/releases/manifest.json`

## Current Implementation State

1. Manifest template exists at `releases/manifest.template.json`.
2. Installer scripts parse and validate manifest contract fields.
3. Public manifest endpoint deployment is still pending.

## Target State

Manifest drives installer decisions and integrity checks.

## Schema (v1)

```json
{
  "schema_version": "1.0",
  "version": "1.0.0",
  "published_at": "2026-02-13T00:00:00Z",
  "assets": [
    {
      "platform": "darwin-arm64",
      "asset_url": "https://.../phantom-darwin-arm64.tar.gz",
      "sha256": "<hex>",
      "signature": "<base64-or-reference>",
      "size_bytes": 12345678
    }
  ],
  "fallback": {
    "npm_package": "@phantompm/cli",
    "minimum_node": "18.0.0"
  }
}
```

## Required Fields

1. `schema_version`
2. `version`
3. `assets[].platform`
4. `assets[].asset_url`
5. `assets[].sha256`
6. `assets[].signature`

## Validation Rules

1. `schema_version` must be supported by installer
2. asset URLs must use HTTPS
3. sha256 must be lowercase hex string length 64
4. version must be SemVer-compatible
5. unknown required fields for supported version should fail fast

## Interface Contract (Install Path)

The install endpoint contract requires these fields to be available for asset selection and validation:

1. `version`
2. `platform`
3. `asset_url`
4. `sha256`
5. `signature`

## Compatibility

1. installer supports major schema version 1
2. minor extensions allowed with backward-compatible semantics

## Acceptance Criteria

1. manifest parser rejects invalid/incomplete payloads
2. installer can deterministically select asset from manifest
