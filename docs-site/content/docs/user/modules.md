+++
title = "Modules"
+++

# Modules Guide

Owner: PhantomPM User Docs Team  
Last Updated: 2026-02-13  
Status: Real

## Module System Status

- built-in module registry: `Real`
- install/uninstall state persistence: `Real`
- remote marketplace distribution: `Planned`

## Browse Modules

```bash
phantom modules
```

## Install a Module

```bash
phantom install @phantom/prd-forge
phantom install @phantom/oracle
```

## Current Behavior

1. install validates against built-in registry
2. module state saved in local config
3. module install view rendered in TUI

## Module Naming

Use `@phantom/<module-name>` format.

Examples:

1. `@phantom/prd-forge`
2. `@phantom/story-writer`
3. `@phantom/sprint-planner`

## Roadmap Note

Community module SDK and external marketplace are planned capabilities.
