# AntiGravity Agent Rulebook
## Building PHANTOM - Product Management OS

### Core Operating Principles

1. **Gather Context Before Acting**
   - Read existing modules before creating new ones
   - Find similar patterns: `ls packages/modules/`
   - Study successful modules: PRD Forge, Swarm
   - Understand the architecture deeply

2. **Build Incrementally**
   - One module at a time
   - Complete fully before moving to next
   - Test after every change
   - Commit when working

3. **Follow PHANTOM Patterns**
```typescript
   // Every module follows this structure:
   packages/modules/module-name/
   ├── src/
   │   ├── index.ts          // Public exports
   │   ├── analyzer.ts       // Core logic
   │   ├── types.ts          // TypeScript types
   │   └── analyzer.test.ts  // Tests alongside
   ├── package.json
   └── README.md
```

4. **Quality Gates (Non-Negotiable)**
```bash
   npm run build  # Must succeed
   npm test       # Must pass (80%+ coverage)
   npm run lint   # Must be clean
```

5. **Context Management**
   - Load only relevant files
   - Use sequential-thinking MCP for complex planning
   - Use memory MCP to remember decisions
   - Keep token budget efficient

6. **Decision Framework**
   - ✅ Decide autonomously: implementation details, bug fixes, tests
   - ❓ Ask for input: new dependencies, architecture changes, breaking changes

7. **Verification Loop**
   After EVERY change:
```
   Edit → Build → Test → Lint → Manual Check → Commit
```
   If any step fails → Debug → Fix → Retry

8. **Agent-to-Agent Communication**
   - When using sequential-thinking MCP: break down complex tasks first
   - When using brave-search MCP: research before implementing
   - When using memory MCP: store key decisions for later

9. **Code Quality Standards**
```typescript
   // ✅ GOOD
   export async function analyzeInterview(
     transcript: string
   ): Promise<InterviewInsights> {
     try {
       const ai = AIManager.getInstance();
       const insights = await ai.extractInsights(transcript);
       return validateInsights(insights);
     } catch (error) {
       throw new Error(`Analysis failed: ${error.message}`);
     }
   }

   // ❌ BAD
   export async function analyzeInterview(transcript) {
     return await ai.extractInsights(transcript);
   }
```

10. **Module Development Checklist**
    - [ ] Create module structure
    - [ ] Define TypeScript types
    - [ ] Implement core logic
    - [ ] Add comprehensive tests
    - [ ] Integrate with CLI
    - [ ] Update documentation
    - [ ] Verify all quality gates pass
    - [ ] Commit with clear message

### Task Breakdown Strategy

For complex features:
1. Use sequential-thinking MCP to decompose
2. Break into subtasks (each <200 lines)
3. Assign complexity score (1-10)
4. Execute lowest complexity first
5. Build up to complex tasks

Example breakdown:
```
Task: Build Interview Analyzer module

Subtasks:
1. [2] Create module structure and types
2. [4] Implement transcript parsing
3. [5] Integrate AI extraction logic
4. [3] Add theme clustering
5. [4] Build CLI command
6. [6] Add comprehensive tests
7. [2] Write documentation

Execute in order: 1 → 2 → 4 → 3 → 5 → 6 → 7
```

### Common Patterns in PHANTOM

**AI Integration:**
```typescript
import { AIManager } from '@phantom/core/ai';

const ai = AIManager.getInstance();
const result = await ai.complete(prompt, {
  temperature: 0.7,
  maxTokens: 2000,
});
```

**Context Usage:**
```typescript
import { ContextEngine } from '@phantom/core/context';

const context = ContextEngine.getInstance();
const projectContext = await context.getCurrentContext();
```

**CLI Command:**
```typescript
import { Command } from 'commander';

export function registerCommand(program: Command): void {
  program
    .command('interview')
    .description('Analyze customer interviews')
    .argument('<file>', 'Interview transcript')
    .action(async (file: string) => {
      // implementation
    });
}
```

### When Stuck

1. Read error message completely
2. Use brave-search MCP to research error
3. Check similar code in other modules
4. Use sequential-thinking MCP to plan fix
5. Try fix, verify, iterate
6. If stuck after 3 attempts: ask for help

### Success Metrics

- [ ] All 6 new modules working
- [ ] Tests passing (80%+ coverage)
- [ ] No TypeScript errors
- [ ] Clean linting
- [ ] Documentation complete
- [ ] CLI commands functional
- [ ] MCP integration tested

## 🔥 Gemini 3 Pro Optimization

### Prompt Engineering for Gemini

**Always start tasks with:**
```
You are an expert TypeScript developer building PHANTOM - a product management operating system.

Current task: [specific task]

Context:
- Project structure: [brief overview]
- Relevant files: [list key files]
- Pattern to follow: [reference existing module]

Requirements:
- Follow PHANTOM patterns exactly
- Add tests (80%+ coverage)
- Verify: build → test → lint
- Commit when working

Begin by reading existing code to understand patterns.
```

### Gemini-Specific Tips

1. **Use long context effectively**
   - Gemini 3 Pro has 2M token context
   - Load entire relevant codebase
   - Reference multiple modules for patterns

2. **Structured outputs**
```
   Generate response as JSON:
   {
     "analysis": "...",
     "approach": "...",
     "implementation": "...",
     "tests": "...",
     "verification": "..."
   }
```
