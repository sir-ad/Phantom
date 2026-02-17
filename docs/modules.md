# PHANTOM Modules

PHANTOM's power comes from its modular architecture. Each module adds specific PM superpowers to your workflow. Install only what you need.

## Module System

Modules are installed dynamically when first used or manually with the `install` command:

```bash
phantom install @phantom/module-name
```

List all available modules:

```bash
phantom modules
```

## Core Modules

### @phantom/prd-forge
**"I know PRDs."**

Generate comprehensive Product Requirements Documents from natural language.

```bash
phantom install @phantom/prd-forge
phantom prd create "Feature Name"
```

Features:
- AI-powered PRD generation
- Technical requirements inclusion
- UX wireframe descriptions
- Metrics framework integration

### @phantom/story-writer
**"I know user stories."**

Auto-generate user stories with acceptance criteria from PRDs or natural language.

```bash
phantom install @phantom/story-writer
phantom stories generate "Feature Description"
phantom stories from-prd ./prd-file.md
```

Features:
- INVEST criteria validation
- Story point estimation
- Sprint organization
- Edge case consideration

### @phantom/sprint-planner
**"I know velocity."**

AI-powered sprint planning with velocity tracking and capacity management.

```bash
phantom install @phantom/sprint-planner
phantom sprint plan --goal "Sprint Goal" --duration 14
phantom sprint retro --sprint ./sprint-data.json
```

Features:
- Capacity planning
- Burndown chart generation
- Sprint retrospectives
- Velocity tracking

### @phantom/competitive
**"I know your enemies."**

Monitor competitors, analyze market positioning, and track feature parity.

```bash
phantom install @phantom/competitive
phantom competitive analyze "Market Segment"
phantom competitive watch "Competitor Name"
```

Features:
- Competitor research
- SWOT analysis
- Market trend tracking
- Feature gap analysis

### @phantom/analytics-lens
**"I know the numbers."**

Connect to analytics platforms and surface actionable product insights.

```bash
phantom install @phantom/analytics-lens
phantom analytics dashboard
phantom analytics report --period "last quarter"
```

Features:
- Metric dashboard generation
- Trend analysis
- Insight extraction
- Recommendation engine

### @phantom/oracle
**"I know the future."**

Predictive intelligence — feature success prediction, Monte Carlo simulations, forecasting.

```bash
phantom install @phantom/oracle
phantom oracle predict "Feature Proposal"
phantom oracle simulate "Scenario"
```

Features:
- Success probability prediction
- Monte Carlo simulations
- Revenue forecasting
- Risk identification

### @phantom/figma-bridge
**"I know design."**

Connect Figma designs to PRDs, user stories, and development tasks.

```bash
phantom install @phantom/figma-bridge
phantom figma sync <file-key>
phantom figma analyze <file-key>
```

Features:
- Figma design syncing
- UX audit capabilities
- Design-to-dev mapping
- Component tracking

### @phantom/experiment-lab
**"I know the truth."**

Design and analyze A/B tests, feature experiments, and rollout strategies.

```bash
phantom install @phantom/experiment-lab
phantom experiment design "Hypothesis"
phantom experiment analyze <experiment-id>
```

Features:
- Experiment design
- Statistical significance calculation
- Result analysis
- Rollout strategy planning

### @phantom/ux-auditor
**"I know the user."**

Automated UX audits from screenshots with WCAG compliance checking.

```bash
phantom install @phantom/ux-auditor
phantom ux audit ./screenshots/
phantom ux score ./screenshot.png
```

Features:
- Automated UX auditing
- WCAG compliance checking
- Accessibility scoring
- Improvement recommendations

### @phantom/time-machine
**"I know the past."**

Version and compare product decisions over time, what-if analysis.

```bash
phantom install @phantom/time-machine
phantom timemachine snapshot
phantom timemachine compare <snapshot1> <snapshot2>
```

Features:
- Decision versioning
- Historical comparison
- What-if analysis
- Impact assessment

### @phantom/bridge
**"I know both worlds."**

Bidirectional PM ↔ Dev translation engine.

```bash
phantom install @phantom/bridge
phantom bridge translate "Business requirement"
phantom bridge spec <prd-id>
```

Features:
- PM-to-dev translation
- Technical specification generation
- Requirement clarification
- Implementation guidance

### @phantom/swarm
**"We know everything."**

Deploy 7 specialized PM agents to analyze any product question in parallel.

```bash
phantom install @phantom/swarm
phantom swarm "Product question"
```

Features:
- Multi-agent analysis
- Consensus building
- Confidence scoring
- Diverse perspective integration

## Installing Modules

### Automatic Installation

Modules are automatically installed when first used:

```bash
phantom prd create "New Feature"
# Automatically installs @phantom/prd-forge if not present
```

### Manual Installation

Install modules explicitly:

```bash
phantom install @phantom/prd-forge
phantom install @phantom/story-writer
phantom install @phantom/competitive
```

### Bulk Installation

Install multiple modules at once:

```bash
phantom install @phantom/prd-forge @phantom/story-writer @phantom/competitive
```

## Managing Modules

### List Installed Modules

```bash
phantom modules --installed
```

### Uninstall Modules

```bash
phantom uninstall @phantom/module-name
```

### Update Modules

```bash
phantom update @phantom/module-name
phantom update --all
```

## Creating Custom Modules

PHANTOM modules are standard Node.js packages with a specific structure. To create a custom module:

1. Follow the module template in the [phantom-modules](https://github.com/PhantomPM/phantom-modules) repository
2. Implement the required interfaces
3. Publish to npm or host privately
4. Install with `phantom install`

For detailed module development guidelines, see the [Module Development Guide](module-development.md).

## Community Modules

The PHANTOM community creates and maintains additional modules. Browse community modules at:

- [phantom-modules GitHub repository](https://github.com/PhantomPM/phantom-modules)
- npm search: `phantom-module-*`

Submit your own modules to the community repository to share with others.