# PHANTOM — Project Development Guide

**Project:** PHANTOM PM Operating System
**Type:** TypeScript Monorepo (CLI + TUI + Modules)
**Status:** MVP Development (Phase 0)

---

## Quick Orientation

**What is PHANTOM?**
An open-source PM operating system for the terminal that gives any developer or PM "product management superpowers" through AI-powered agents and modular capabilities.

**Core Value Proposition:**
- Install in 1 line: `curl -fsSL phantom.pm/install | sh`
- Auto-understands your product (code + design + data)
- 7 AI agents analyze decisions in parallel
- 100% local-first (your data never leaves your machine)
- Modular system: install only what you need

**Technology Stack:**
- TypeScript 5+ (strict mode)
- Node.js 18+ (for CLI runtime)
- Turborepo (monorepo management)
- Commander.js (CLI framework)
- Ink (React-based TUI)
- Ollama / Anthropic / OpenAI (AI models)

---

## Architecture Overview

```
phantom/
├── packages/
│   ├── cli/          # Main CLI application (Commander.js)
│   ├── core/         # Core engine (context, agents, modules)
│   ├── tui/          # Terminal UI components (Ink/React)
│   ├── modules/      # Built-in modules (PRD, stories, etc.)
│   ├── mcp-server/   # MCP integration server
│   └── shared/       # Shared utilities
├── website/          # Next.js landing page + docs
├── docs/             # Documentation markdown files
└── scripts/          # Build/release scripts
```

---

## Critical Commands (Must Work)

### Development
```bash
npm install          # Install all dependencies
npm run build        # Build all packages
npm run dev          # Dev mode with watch
npm test             # Run all tests
npm run lint         # Lint all packages
```

### User Commands (After Install)
```bash
phantom --version
phantom --help
phantom init                                # Setup config
phantom context add <path>                  # Add project context
phantom prd generate "feature name"         # Generate PRD
phantom swarm "Should we add feature X?"    # Agent analysis
phantom dashboard                           # Interactive TUI
phantom install @phantom/module-name        # Install module
```

---

## Code Patterns & Standards

### TypeScript Standards

**All code must:**
- Use TypeScript strict mode (no `any` without justification)
- Export explicit interfaces for public APIs
- Include JSDoc comments for exported functions
- Use proper error handling (try/catch or Result types)

**Example:**
```typescript
// ✅ GOOD
interface PRDGeneratorOptions {
  featureName: string;
  context: ProductContext;
  template?: string;
}

/**
 * Generates a Product Requirements Document
 * @param options - Configuration for PRD generation
 * @returns Generated PRD markdown content
 */
export async function generatePRD(
  options: PRDGeneratorOptions
): Promise<string> {
  try {
    // Implementation
  } catch (error) {
    throw new PRDGenerationError(`Failed to generate PRD: ${error.message}`);
  }
}

// ❌ BAD
export function generatePRD(opts: any): any {
  // No types, no docs, no error handling
}
```

### File Naming
- Components: `PascalCase.tsx` (e.g., `Dashboard.tsx`)
- Utilities: `camelCase.ts` (e.g., `formatContext.ts`)
- Tests: Same name + `.test.ts` (e.g., `Dashboard.test.tsx`)
- Types: Same name + `.types.ts` (optional for complex types)

### Import Order
```typescript
// 1. External dependencies
import React from 'react';
import { Command } from 'commander';

// 2. Internal packages
import { Context } from '@phantom/core';
import { Dashboard } from '@phantom/tui';

// 3. Relative imports
import { formatPRD } from './formatters';
import type { PRDOptions } from './types';
```

---

## Component Patterns

### CLI Commands
```typescript
// packages/cli/src/commands/prd.ts

import { Command } from 'commander';
import { generatePRD } from '@phantom/modules/prd';

export function createPRDCommand(): Command {
  return new Command('prd')
    .description('Generate Product Requirements Documents')
    .command('generate <feature>')
    .option('-o, --output <path>', 'Output file path')
    .action(async (feature, options) => {
      // 1. Validate inputs
      if (!feature) {
        console.error('Feature name is required');
        process.exit(1);
      }
      
      // 2. Load context
      const context = await loadContext();
      
      // 3. Execute
      const prd = await generatePRD({ featureName: feature, context });
      
      // 4. Output
      await savePRD(prd, options.output);
      console.log(`✓ PRD generated: ${options.output}`);
    });
}
```

### TUI Components (Ink)
```typescript
// packages/tui/src/components/Dashboard.tsx

import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';

interface DashboardProps {
  context: ProductContext;
}

export function Dashboard({ context }: DashboardProps) {
  const [status, setStatus] = useState('idle');
  
  return (
    <Box flexDirection="column" padding={1}>
      {/* Header */}
      <Box borderStyle="round" paddingX={2}>
        <Text color="green">PHANTOM Dashboard</Text>
      </Box>
      
      {/* Status */}
      <Box marginTop={1}>
        <Text>Context Health: {context.health}%</Text>
      </Box>
      
      {/* Actions */}
      <Box marginTop={1}>
        <Text dimColor>Press 'h' for help</Text>
      </Box>
    </Box>
  );
}
```

### Core Services
```typescript
// packages/core/src/context/context-manager.ts

export class ContextManager {
  private contexts: Map<string, ProductContext> = new Map();
  
  /**
   * Adds a new context from a project path
   */
  async addContext(path: string): Promise<ProductContext> {
    // 1. Validate path exists
    if (!await exists(path)) {
      throw new Error(`Path does not exist: ${path}`);
    }
    
    // 2. Scan and analyze
    const files = await scanDirectory(path);
    const projectType = detectProjectType(files);
    
    // 3. Create context
    const context: ProductContext = {
      id: generateId(),
      path,
      type: projectType,
      files,
      createdAt: Date.now()
    };
    
    // 4. Store
    this.contexts.set(context.id, context);
    await this.saveContext(context);
    
    return context;
  }
  
  /**
   * Retrieves context by ID
   */
  getContext(id: string): ProductContext | undefined {
    return this.contexts.get(id);
  }
}
```

---

## Module System Pattern

Every module follows this structure:

```typescript
// packages/modules/prd/src/index.ts

import { defineModule } from '@phantom/core';

export default defineModule({
  // Metadata
  name: '@phantom/prd',
  version: '1.0.0',
  description: 'Generate Product Requirements Documents',
  quote: 'I know PRDs',
  
  // Capabilities
  commands: [
    {
      name: 'generate',
      description: 'Generate a PRD',
      handler: async (args, context) => {
        // Implementation
      }
    }
  ],
  
  // Permissions
  permissions: {
    filesystem: ['read', 'write'],
    network: [],
    integrations: []
  },
  
  // Configuration schema
  config: {
    template: {
      type: 'string',
      default: 'standard',
      description: 'PRD template to use'
    }
  }
});
```

---

## Testing Requirements

### Unit Tests
```typescript
// packages/core/src/context/context-manager.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { ContextManager } from './context-manager';

describe('ContextManager', () => {
  let manager: ContextManager;
  
  beforeEach(() => {
    manager = new ContextManager();
  });
  
  it('adds context from valid path', async () => {
    const context = await manager.addContext('/path/to/project');
    
    expect(context).toBeDefined();
    expect(context.path).toBe('/path/to/project');
    expect(context.id).toBeTruthy();
  });
  
  it('throws error for invalid path', async () => {
    await expect(
      manager.addContext('/nonexistent')
    ).rejects.toThrow('Path does not exist');
  });
});
```

### Testing Coverage
- All exported functions need unit tests
- Critical paths need integration tests
- CLI commands need end-to-end tests
- Aim for >80% coverage on new code

---

## Design System (Matrix Theme)

### Colors
```typescript
export const colors = {
  // Background
  bgPrimary: '#0D1117',
  bgSecondary: '#161B22',
  bgTertiary: '#21262D',
  
  // Text
  textPrimary: '#E6EDF3',
  textSecondary: '#8B949E',
  textMuted: '#6E7681',
  
  // Brand
  matrixGreen: '#00FF41',
  phantomOrange: '#FF6B35',
  cyberBlue: '#00D4FF',
  neonRed: '#FF2D55'
} as const;
```

### Typography
```typescript
// Use these for CLI output
export const fonts = {
  display: 'JetBrains Mono',  // For logo/banners
  mono: 'monospace',           // For code/commands
  body: 'system-ui'            // For regular text
};
```

### ASCII Art (Logo)
```typescript
export const PHANTOM_LOGO = `
░█▀█░█░█░█▀█░█▀█░▀█▀░█▀█░█▄█
░█▀▀░█▀█░█▀█░█░█░░█░░█░█░█░█
░▀░░░▀░▀░▀░▀░▀░▀░░▀░░▀▀▀░▀░▀
`;
```

---

## Common Pitfalls (Avoid These)

### ❌ DON'T: Over-engineer early
```typescript
// BAD: Creating complex abstractions before proving they're needed
class AbstractModuleFactoryBuilder {
  // 200 lines of code nobody needs yet
}

// GOOD: Simple, direct implementation
function loadModule(name: string) {
  return import(`../modules/${name}`);
}
```

### ❌ DON'T: Use `any` without justification
```typescript
// BAD
function processData(data: any): any {
  return data.map((item: any) => item.value);
}

// GOOD
function processData(data: DataItem[]): string[] {
  return data.map(item => item.value);
}
```

### ❌ DON'T: Ignore errors
```typescript
// BAD
async function loadConfig() {
  const data = await fs.readFile('config.json');
  return JSON.parse(data);  // What if it fails?
}

// GOOD
async function loadConfig(): Promise<Config> {
  try {
    const data = await fs.readFile('config.json', 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    throw new ConfigLoadError(`Failed to load config: ${error.message}`);
  }
}
```

### ❌ DON'T: Make breaking changes lightly
```typescript
// BAD: Changing command syntax without migration path
phantom prd create  →  phantom prd generate  // Users' scripts break!

// GOOD: Support both, deprecate old
phantom prd create    # Still works, shows deprecation warning
phantom prd generate  # New preferred syntax
```

---

## Configuration Management

### User Config Location
```
~/.phantom/
├── config.json          # Main configuration
├── contexts/            # Saved project contexts
│   ├── project-1.json
│   └── project-2.json
├── modules/             # Installed modules
└── cache/              # Temporary cache
```

### Config Schema
```typescript
interface PhantomConfig {
  version: string;
  model: {
    provider: 'ollama' | 'claude' | 'openai' | 'custom';
    name: string;
    apiKey?: string;
    endpoint?: string;
  };
  contexts: {
    active?: string;
    recent: string[];
  };
  modules: {
    installed: string[];
  };
  preferences: {
    theme: 'matrix' | 'minimal';
    autoUpdate: boolean;
  };
}
```

---

## Error Handling Strategy

### Error Types
```typescript
// Base error class
export class PhantomError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'PhantomError';
  }
}

// Specific error types
export class ContextNotFoundError extends PhantomError {
  constructor(contextId: string) {
    super(
      `Context not found: ${contextId}`,
      'CONTEXT_NOT_FOUND',
      { contextId }
    );
  }
}

export class ModuleInstallError extends PhantomError {
  constructor(moduleName: string, reason: string) {
    super(
      `Failed to install module ${moduleName}: ${reason}`,
      'MODULE_INSTALL_FAILED',
      { moduleName, reason }
    );
  }
}
```

### Error Display
```typescript
// User-friendly error output
export function displayError(error: Error): void {
  console.error(chalk.red('✗ Error:'), error.message);
  
  if (error instanceof PhantomError && error.details) {
    console.error(chalk.dim('Details:'), error.details);
  }
  
  if (process.env.DEBUG) {
    console.error(chalk.dim('Stack:'), error.stack);
  }
  
  console.error(chalk.dim('\nRun with DEBUG=* for more information'));
}
```

---

## Performance Considerations

### Startup Time
- Target: <500ms from command to first output
- Lazy load heavy dependencies
- Cache expensive operations
- Use async/await properly

### Memory Usage
- Target: <100MB for typical operations
- Stream large files instead of loading entirely
- Clear caches after operations
- Use worker threads for CPU-intensive tasks

---

## Security & Privacy

### Data Privacy Rules
```typescript
// ✅ GOOD: Local-only by default
const context = await scanLocalDirectory('/path');

// ❌ BAD: Sending data without consent
await sendToServer(context);  // Never do this!

// ✅ GOOD: Explicit opt-in for external calls
if (config.telemetry.enabled) {
  await sendAnonymousMetrics();
}
```

### API Key Storage
```typescript
// ✅ GOOD: Use OS keychain
import keytar from 'keytar';

await keytar.setPassword('phantom', 'anthropic_api_key', apiKey);

// ❌ BAD: Plain text in config
config.apiKey = 'sk-ant-1234...';  // Never!
```

---

## Workflow for New Features

### 1. Plan First
- Read existing code to understand patterns
- Identify which packages are affected
- Consider backwards compatibility

### 2. Write Tests First (TDD)
- Create failing test
- Implement feature
- Verify test passes

### 3. Implement Incrementally
- Small, focused commits
- One logical change per commit
- Test after each change

### 4. Documentation
- Update README if user-facing
- Add JSDoc for exported functions
- Update CHANGELOG

### 5. Verification
```bash
npm run build   # Must succeed
npm test        # Must pass
npm run lint    # Must be clean
```

---

## Git Workflow

### Commit Messages
```bash
# Format: type(scope): message

feat(cli): add phantom dashboard command
fix(context): handle symlinks correctly
docs(readme): update installation instructions
test(core): add tests for ContextManager
chore(deps): update dependencies
```

### Branching
```bash
main           # Production-ready
develop        # Integration branch
feature/xyz    # Feature branches
fix/bug-name   # Bug fix branches
```

---

## When to Ask for Help

### Ask When:
- Requirements are ambiguous
- Multiple valid approaches exist
- Breaking changes are considered
- Security implications unclear
- Need to choose between dependencies

### Don't Ask When:
- Following established pattern
- Standard implementation
- Covered by this guide
- Simple bug fix

---

## Meta-Reminders

**You are building a tool for Product Managers and developers.**

- Keep the CLI fast and responsive
- Make error messages helpful, not cryptic
- Prioritize user experience over code elegance
- Every feature should have a clear "why"
- Documentation is as important as code

**This is open source:**
- Code will be read by many people
- Make it educational and clear
- Leave good examples for contributors
- Think about maintainability

**MVP first, polish later:**
- Ship working features quickly
- Get user feedback early
- Iterate based on real usage
- Don't over-optimize prematurely

---

## Success Criteria

After each phase, these should work:

**Phase 0 (Week 1):**
- [ ] `phantom --version` shows version
- [ ] `phantom init` creates config
- [ ] `phantom context add .` discovers project
- [ ] `phantom prd generate "feature"` creates PRD file
- [ ] `phantom dashboard` shows interactive TUI

**Phase 1 (Weeks 2-5):**
- [ ] `phantom swarm "question"` gives analysis
- [ ] Can use Ollama or Claude for AI
- [ ] 5 modules installable and working
- [ ] MCP server responds to tool calls

**Phase 2 (Weeks 6-7):**
- [ ] Website live and accessible
- [ ] Docs answer common questions
- [ ] One-line installer works

---

## Final Reminders

- **Build incrementally** — Don't try to do everything at once
- **Test frequently** — Catch issues early
- **Stay focused** — Stick to the current phase's scope
- **Ask questions** — When genuinely unclear
- **Ship working code** — Perfection comes later

**PHANTOM is about giving PM superpowers. Keep that goal in mind with every decision.**
