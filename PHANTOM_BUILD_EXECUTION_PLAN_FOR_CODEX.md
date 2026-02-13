# PHANTOM Build Execution Plan for Codex CLI
## How to Actually Build This With Codex

---

## 🎯 Reality Check First

**The Vision:** 50+ pages of features, 40+ modules, full PM OS
**The Timeline:** 12+ weeks as currently scoped
**The Challenge:** Codex can't build all this at once

**Solution:** Phased execution with MVP-first approach

---

## 📊 Scope Breakdown

### Total Estimated Effort
- **Core Foundation:** 4 weeks
- **MVP Features:** 4 weeks  
- **Website + Docs:** 2 weeks
- **Advanced Features:** 8+ weeks (ongoing)

**Total:** 18+ weeks for full vision

---

## 🎯 Recommended Approach: MVP-First

### Phase 0: Proof of Concept (Week 1)
**Goal:** Something that works and can demo

**What to build:**
- Basic CLI that installs globally
- Simple TUI with Matrix theme
- Context discovery (codebase scanning)
- One module: PRD generation
- README with demo GIF

**Success criteria:**
- `npm install -g @phantompm/cli` works
- `phantom prd generate "feature name"` produces a PRD
- Can show it to people and get "wow" reaction

### Phase 1: Core Features (Weeks 2-5)
**Goal:** Actually useful for real PMs

**What to build:**
- Agent swarm system (7 agents)
- Natural language command parser
- 5 core modules (PRD, Stories, Sprint, Competitive, Analytics)
- MCP server for integrations
- First integration (VS Code or Claude Code)

**Success criteria:**
- `phantom "Should we add feature X?"` gives useful analysis
- Can integrate with at least one IDE/tool
- People start using it daily

### Phase 2: Website + Launch (Weeks 6-7)
**Goal:** Public launch ready

**What to build:**
- Landing page (phantom.pm)
- Documentation site
- Module marketplace
- One-line installer (curl | sh)
- Product Hunt assets

**Success criteria:**
- Website converts visitors to installs
- Docs answer common questions
- Install works on all platforms

### Phase 3: Ecosystem (Weeks 8+)
**Goal:** Community growth

**What to build:**
- More integrations (Slack, Linear, Figma)
- More modules (Oracle, Voice, etc.)
- Module SDK for community
- Enterprise features (optional)

---

## 🚀 How to Execute with Codex

### Setup Phase (Do This First)

**1. Create proper project structure**
```bash
mkdir phantom
cd phantom
npm init -y
git init
```

**2. Create AGENTS.md for the project**
```bash
# Copy the PHANTOM_AGENTS.md from this plan
# This tells Codex how PHANTOM should work
```

**3. Initialize monorepo**
```bash
# This is a single Codex prompt (see below)
```

---

## 📝 Codex Prompts by Phase

### PHASE 0 PROMPT (Week 1)

**Day 1: Project Setup**
```
Create a TypeScript monorepo for PHANTOM PM operating system with this structure:

packages/
  cli/          # Main CLI application
  core/         # Core engine (context, agents, modules)
  tui/          # Terminal UI components
  modules/      # Built-in modules
  shared/       # Shared utilities

Requirements:
- Use Turborepo for monorepo management
- TypeScript 5+ with strict mode
- ESLint + Prettier configured
- Vitest for testing
- Commander.js for CLI
- Ink for TUI (React-based terminal UI)

Setup these package.json scripts:
- npm run build       # Build all packages
- npm run dev         # Dev mode with watch
- npm run test        # Run all tests
- npm run lint        # Lint all packages

Initialize with proper .gitignore, tsconfig.json, and basic README.
```

**Day 2: CLI Foundation**
```
Build the basic CLI in packages/cli/:

1. Create src/index.ts with Commander.js setup
2. Implement these commands:
   - phantom --version
   - phantom --help
   - phantom init (creates ~/.phantom/config.json)
   - phantom config (shows current config)

3. Add Matrix-themed banner on startup:
   ░█▀█░█░█░█▀█░█▀█░▀█▀░█▀█░█▄█
   ░█▀▀░█▀█░█▀█░█░█░░█░░█░█░█░█
   ░▀░░░▀░▀░▀░▀░▀░▀░░▀░░▀▀▀░▀░▀

4. Use Chalk for colors (Matrix green: #00FF41)

Make it installable globally with:
npm install -g .
```

**Day 3: Context Engine**
```
Build the context discovery system in packages/core/src/context/:

1. Create context.ts with:
   - scanDirectory(path): discovers project files
   - detectProjectType(): identifies language/framework
   - indexCodebase(): creates searchable index
   - saveContext(): stores in ~/.phantom/contexts/

2. Implement auto-discovery for:
   - Git repositories
   - package.json (Node.js)
   - requirements.txt (Python)
   - go.mod (Go)

3. Use simple in-memory storage for now (no vector DB yet)

4. Add CLI command:
   phantom context add <path>
   phantom context list
```

**Day 4: PRD Module**
```
Build the first module in packages/modules/prd/:

1. Create module structure:
   src/
     index.ts       # Module entry point
     generator.ts   # PRD generation logic
     template.ts    # PRD markdown template

2. PRD generator should:
   - Take a feature name as input
   - Use context from context engine
   - Generate markdown PRD with sections:
     - Overview
     - User Stories
     - Technical Requirements
     - Success Metrics
     - Implementation Plan

3. For now, use template-based generation (no AI yet)

4. Add CLI command:
   phantom prd generate "feature name"
   
Output should be saved to ./phantom-output/feature-name-prd.md
```

**Day 5: TUI Foundation**
```
Build basic TUI in packages/tui/:

1. Create React components using Ink:
   - Banner.tsx (Matrix-themed logo)
   - Dashboard.tsx (main interface)
   - StatusBar.tsx (shows context health)
   - CommandPrompt.tsx (interactive input)

2. Implement phantom dashboard command that shows:
   - Project context status
   - Available modules
   - Quick actions menu

3. Use Matrix color scheme:
   - Background: #0D1117
   - Primary: #00FF41 (Matrix green)
   - Secondary: #8B949E

4. Add keyboard shortcuts:
   - Ctrl+C: Exit
   - ?: Help
   - q: Quit
```

**Weekend: Integration & Demo**
```
1. Wire everything together:
   - CLI → Context Engine → PRD Module → TUI
   
2. Test the full flow:
   cd ~/my-project
   phantom init
   phantom context add .
   phantom prd generate "user authentication"
   
3. Create demo assets:
   - Record terminal GIF with asciinema
   - Write basic README with installation steps
   - Add screenshots
   
4. Tag as v0.1.0-alpha
```

---

### PHASE 1 PROMPTS (Weeks 2-5)

**Week 2: Agent Swarm Foundation**
```
Build the agent system in packages/core/src/agents/:

1. Create AgentOrchestrator class that:
   - Manages 7 agent types (Strategist, Analyst, Builder, Designer, Researcher, Communicator, Operator)
   - Runs agents in parallel
   - Aggregates their outputs
   - Produces unified recommendations

2. For MVP, each agent uses:
   - Simple heuristics (no AI yet)
   - Context from context engine
   - Predefined analysis patterns

3. Implement phantom swarm command:
   phantom swarm "Should we add dark mode?"
   
   Output shows:
   - Each agent's perspective
   - Consensus decision
   - Confidence score
   - Recommended next steps

4. Use progress spinners (Ora library) to show agents working
```

**Week 3: AI Integration**
```
Add AI model support in packages/core/src/ai/:

1. Create ModelRouter class that supports:
   - Ollama (local)
   - Anthropic Claude API
   - OpenAI GPT API
   - Custom OpenAI-compatible endpoints

2. Implement configuration:
   phantom config set-model ollama
   phantom config set-model claude --api-key sk-ant-...

3. Update agents to use AI models:
   - Pass context + prompt to model
   - Parse structured responses
   - Handle errors gracefully

4. Add model testing:
   phantom config test-model
```

**Week 4: Core Modules**
```
Build 4 more modules in packages/modules/:

1. story-writer/
   - Converts features to user stories
   - Generates acceptance criteria
   - Estimates story points

2. sprint-planner/
   - Analyzes backlog
   - Prioritizes using RICE scoring
   - Suggests sprint scope

3. competitive/
   - Tracks competitors
   - Analyzes feature gaps
   - Generates comparison matrices

4. analytics/
   - Connects to analytics platforms
   - Generates insights
   - Visualizes trends in terminal

Each module follows same pattern as PRD module.
Add install system: phantom install @phantom/module-name
```

**Week 5: MCP Integration**
```
Build MCP server in packages/mcp-server/:

1. Implement MCP protocol support:
   - Tools: context.add, prd.generate, swarm.analyze
   - Resources: project context, modules list
   - Prompts: PM templates

2. Create server executable:
   phantom mcp-server --stdio

3. Write adapter for first integration (choose one):
   - Claude Code (MCP native)
   - VS Code (via extension)
   - Cursor (MCP support)

4. Document integration setup in README
```

---

### PHASE 2 PROMPTS (Weeks 6-7)

**Week 6: Website Foundation**
```
Build landing page in website/:

1. Initialize Next.js 14 app:
   npx create-next-app@latest website
   
2. Create pages:
   - app/page.tsx (homepage)
   - app/install/page.tsx
   - app/docs/page.tsx

3. Implement components:
   - Hero with install command
   - Terminal demo (animated)
   - Feature grid
   - Integration logos

4. Use Tailwind with Matrix theme:
   - Copy color scheme from design doc
   - Matrix rain background effect
   - Monospace fonts (JetBrains Mono)

5. Deploy to Vercel:
   vercel --prod
```

**Week 7: Documentation Site**
```
Build docs in website/app/docs/:

1. Setup MDX support for documentation
2. Create doc pages:
   - Getting Started
   - Installation
   - Quick Start
   - CLI Commands
   - Module Guide
   - Integration Guide

3. Implement docs layout:
   - Sidebar navigation
   - Table of contents
   - Search functionality

4. Add code examples with syntax highlighting
5. Create module marketplace page
```

---

## 🎯 Execution Strategy

### How to Use These Prompts with Codex

**Option A: Sequential Execution**
```bash
# Start Codex in your phantom/ directory
codex --enable skills

# Give it the AGENTS.md first
Read the PHANTOM_AGENTS.md file I'll provide

# Then execute phase by phase
Execute "PHASE 0 PROMPT - Day 1: Project Setup"

# Wait for completion, verify it works, then:
Execute "PHASE 0 PROMPT - Day 2: CLI Foundation"

# Continue through all prompts sequentially
```

**Option B: Planning First**
```bash
codex --enable skills

# Use the plan-mode skill
$plan-mode

Create a detailed implementation plan for PHANTOM Phase 0 based on:
- The prompts in PHANTOM_BUILD_PLAN.md
- The requirements in PHANTOM_AGENTS.md
- Focus on deliverable working code

# Review the plan, then:
Execute the plan step by step
```

**Option C: Iterative with Verification**
```bash
# For each prompt:
codex

Execute this task: [paste Day 1 prompt]

# After completion:
Verify the code works by running:
- npm install
- npm run build
- npm test

# If it works:
Continue to next task: [paste Day 2 prompt]

# If not:
Debug and fix the issues before continuing
```

---

## ⚠️ Critical Success Factors

### 1. Don't Skip Verification
After each prompt, actually run the code:
- Does it compile?
- Do tests pass?
- Does the CLI command work?
- Can you demo it?

### 2. Keep Scope Tight
Resist the urge to add "just one more feature"
Each phase should produce something demoable

### 3. Document As You Go
Update README after each phase with:
- What works
- How to use it
- Known limitations

### 4. Git Commits After Each Prompt
```bash
git add .
git commit -m "feat: complete Day 1 - project setup"
git tag v0.0.1
```

### 5. Test in Clean Environment
After Phase 0, try installing on a fresh machine:
```bash
# Clone repo
git clone https://github.com/you/phantom
cd phantom
npm install
npm run build
npm install -g .

# Does it work?
phantom --version
```

---

## 📊 Tracking Progress

### Milestone Checklist

**Phase 0 (Week 1):**
- [ ] Day 1: Monorepo structure exists and builds
- [ ] Day 2: CLI commands work globally
- [ ] Day 3: Can discover and index a project
- [ ] Day 4: Can generate a basic PRD
- [ ] Day 5: TUI dashboard displays
- [ ] Weekend: Full demo flow works

**Phase 1 (Weeks 2-5):**
- [ ] Week 2: Swarm analysis produces output
- [ ] Week 3: AI integration works with at least Ollama
- [ ] Week 4: 5 core modules installed and working
- [ ] Week 5: MCP server can be called from one tool

**Phase 2 (Weeks 6-7):**
- [ ] Week 6: Website live at phantom.pm
- [ ] Week 7: Docs complete and searchable

---

## 🚨 When Things Go Wrong

### Common Issues and Solutions

**Issue: Codex produces code that doesn't compile**
```bash
# Don't continue! Fix first:
codex

The code you generated has TypeScript errors.
Here are the errors: [paste errors]
Please fix them.
```

**Issue: Scope creep in responses**
```bash
# Remind Codex to stay focused:
codex

That's too much. Just implement [specific part] for now.
We'll add [other features] later.
```

**Issue: Lost context mid-phase**
```bash
# Restart with context:
codex resume --last

We're working on PHANTOM Phase 0, Day 3.
We've completed:
- Day 1: Monorepo setup ✓
- Day 2: Basic CLI ✓

Now continue with Day 3: Context Engine
```

**Issue: Dependencies broken**
```bash
# Clean install:
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 🎯 Next Steps After MVP

Once Phase 0-2 are complete:

1. **User Testing**
   - Give to 5 real PMs
   - Watch them use it
   - Fix obvious issues

2. **Public Beta**
   - Post to Hacker News
   - Get GitHub stars
   - Build community

3. **Iterate Based on Feedback**
   - Most requested features first
   - Bug fixes take priority
   - Keep it simple

4. **Grow Ecosystem**
   - Enable community modules
   - Add more integrations
   - Build marketplace

---

## 💡 Pro Tips

### For Working with Codex

1. **One prompt at a time**
   - Don't paste all prompts at once
   - Verify each step works
   - Commit after each success

2. **Be specific about tech stack**
   - "Use TypeScript not JavaScript"
   - "Use Ink not blessed"
   - "Use Commander.js not yargs"

3. **Provide examples**
   - Show the desired output format
   - Give example commands
   - Reference similar tools

4. **Set constraints**
   - "Keep it under 200 lines"
   - "No external API calls yet"
   - "Use only Node.js stdlib"

5. **Ask for tests**
   - "Include unit tests"
   - "Add integration test"
   - "Test error cases"

---

## 🎬 Final Reality Check

**Can Codex build all of PHANTOM?**
- ✅ Yes, but not in one go
- ✅ Yes, with proper phase breakdown
- ✅ Yes, if you verify at each step
- ❌ No, if you expect it to "just work" without guidance

**Realistic timeline:**
- Phase 0 (MVP): 1 week with Codex + your verification
- Phase 1 (Core): 4 weeks with Codex + your testing
- Phase 2 (Launch): 2 weeks with Codex + your polish
- Total: 7 weeks to launchable product

**What you need to do:**
- Guide Codex with clear prompts
- Verify code actually works
- Test in real scenarios
- Fix bugs Codex can't see
- Make product decisions
- Write docs Codex can't write

**Bottom line:** Codex can write 90% of the code, but you need to orchestrate, verify, and polish.

---

## 📦 Ready to Start?

### Immediate Next Steps

1. **Create the project**
   ```bash
   mkdir phantom
   cd phantom
   ```

2. **Start Codex with the right context**
   ```bash
   codex --enable skills
   ```

3. **Give it the AGENTS.md**
   ```bash
   # First create PHANTOM_AGENTS.md from the next file
   # Then in Codex:
   Read PHANTOM_AGENTS.md and use it as context for all my requests
   ```

4. **Execute Phase 0, Day 1**
   ```bash
   Execute the "Day 1: Project Setup" prompt from PHANTOM_BUILD_PLAN.md
   ```

5. **Verify and iterate**
   ```bash
   npm run build
   # Does it work? Continue. Broken? Fix first.
   ```

**Let's build PHANTOM! 🚀**
