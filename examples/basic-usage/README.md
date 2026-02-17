# Basic PHANTOM Usage Examples

This directory contains practical examples of how to use PHANTOM for common product management tasks.

## Example 1: Complete Feature Development Workflow

### 1. Initialize Project Context

```bash
# Add your project to PHANTOM's context engine
phantom context add ../my-web-app

# Check context status
phantom context status
```

### 2. Generate Product Requirements Document

```bash
# Create a PRD for user authentication
phantom prd create "User Authentication System" \
  --technical \
  --ux \
  --metrics \
  --out ./prds/auth-system.md

# List generated PRDs
phantom prd list
```

### 3. Create User Stories

```bash
# Generate user stories from the feature description
phantom stories generate "User authentication with email and OAuth support" \
  --count 8 \
  --output ./stories/auth-stories.md

# Or generate stories from the PRD
phantom stories from-prd ./prds/auth-system.md \
  --sprints 2
```

### 4. Plan Sprints

```bash
# Plan the implementation sprint
phantom sprint plan \
  --goal "Implement User Authentication" \
  --duration 14 \
  --velocity 21 \
  --backlog ./stories/auth-stories.md
```

### 5. Get Expert Advice

```bash
# Ask the agent swarm for recommendations
phantom swarm "Should we implement two-factor authentication in the first release?"

# Get analysis on technology choices
phantom swarm "Which authentication method is more secure: JWT or session-based?"
```

### 6. Integration with AI Tools

```bash
# The MCP integration works automatically with supported tools
# No additional commands needed - PHANTOM integrates invisibly
```

## Example 2: Competitive Analysis

### 1. Install Competitive Analysis Module

```bash
phantom install @phantom/competitive
```

### 2. Analyze Market Position

```bash
# Analyze competitors in your space
phantom competitive analyze "Project management software" \
  --depth comprehensive

# Watch a specific competitor
phantom competitive watch "Notion"
```

## Example 3: Analytics Integration

### 1. Install Analytics Module

```bash
phantom install @phantom/analytics-lens
```

### 2. Generate Insights

```bash
# Generate a dashboard
phantom analytics dashboard \
  --period "last 30 days" \
  --categories "user-engagement,revenue,performance"

# Create a detailed report
phantom analytics report \
  --period "last quarter" \
  --focus "user retention"
```

## Example 4: Module Development Workflow

### 1. Browse Available Modules

```bash
# See what's available
phantom modules

# See what's installed
phantom modules --installed
```

### 2. Install Specific Modules

```bash
# Install multiple modules at once
phantom install @phantom/prd @phantom/stories @phantom/competitive

# Install with specific versions
phantom install @phantom/prd@2.1.0
```

### 3. Update Modules

```bash
# Update specific module
phantom update @phantom/prd

# Update all modules
phantom update --all
```

## Example 5: Configuration Management

### 1. Interactive Setup

```bash
# Run the configuration wizard
phantom config setup
```

### 2. Direct Configuration

```bash
# Set AI provider
phantom config set primaryModel.provider openai
phantom config set primaryModel.model gpt-4-turbo-preview

# Set API keys (prefer environment variables in production)
phantom config set apiKeys.openai YOUR_API_KEY_HERE
```

### 3. Check Configuration

```bash
# View all configuration
phantom config env

# Get specific values
phantom config get primaryModel.provider
```

## Example 6: Integration Management

### 1. Discover Integrations

```bash
# Scan for available integrations
phantom integrate scan

# Check integration health
phantom integrate doctor
```

### 2. Connect to Tools

```bash
# Connect to specific tools
phantom integrate connect cursor
phantom integrate connect vscode
```

## Example 7: System Health and Maintenance

### 1. Health Checks

```bash
# Run comprehensive health check
phantom doctor

# Check runtime health
phantom health

# View status
phantom status
```

### 2. System Information

```bash
# Show version
phantom --version

# Show help
phantom --help
```

### 3. Nudges and Suggestions

```bash
# Get intelligent suggestions
phantom nudge

# Refresh suggestions
phantom nudge --refresh
```

## Example 8: Advanced Workflows

### 1. Simulation and Planning

```bash
# Run a product scenario simulation
phantom simulate "Launching a new feature in a competitive market"

# Plan quarterly roadmap
phantom roadmap plan --quarter Q2 --focus "User Growth"
```

### 2. Collaboration Features

```bash
# Share context with team members
phantom context export --format json > team-context.json

# Import shared context
phantom context import team-context.json
```

## JSON Output Examples

Many PHANTOM commands support JSON output for programmatic use:

```bash
# Get swarm analysis as JSON
phantom swarm "Should we expand to mobile?" --json

# Get context search results as JSON
phantom context search "authentication" --limit 5 --json

# Get module information as JSON
phantom modules --installed --json
```

## Environment Setup

For production use, set environment variables instead of storing API keys in config:

```bash
# Set in your shell profile (.bashrc, .zshrc, etc.)
export OPENAI_API_KEY="your-openai-key"
export ANTHROPIC_API_KEY="your-anthropic-key"
export PHANTOM_HOME="/custom/path"  # Optional
```

## Common Patterns

### Daily Workflow

```bash
# Morning check-in
phantom status
phantom nudge
phantom health

# Work on current tasks
phantom context add .
phantom stories generate "Improve user onboarding"
```

### Weekly Planning

```bash
# Weekly review
phantom products
phantom integrate doctor
phantom sprint retro --sprint last-week.json

# Plan upcoming work
phantom sprint plan --goal "Next sprint goals" --duration 10
```

### Monthly Analysis

```bash
# Competitive analysis
phantom competitive analyze "our market segment"

# Performance review
phantom analytics report --period "last month"
```

## Troubleshooting

### Common Issues

1. **AI Provider Connection Errors**
   ```bash
   # Check configuration
   phantom config env
   
   # Test connectivity
   phantom doctor
   ```

2. **Module Installation Failures**
   ```bash
   # Clear cache and retry
   phantom config clear --api-keys
   phantom install @phantom/module-name
   ```

3. **Context Indexing Issues**
   ```bash
   # Re-index project
   phantom context add --force ./my-project
   ```

### Getting Help

```bash
# General help
phantom --help

# Command-specific help
phantom prd --help
phantom stories --help

# View documentation
phantom docs
```

## Next Steps

After trying these examples:

1. Explore the [full CLI reference](../../docs/cli.md)
2. Learn about [module development](../../docs/module-development.md)
3. Understand [MCP integration](../../docs/mcp.md)
4. Review [security best practices](../../docs/security.md)
5. Join our [community Discord](https://discord.gg/phantom)

For more advanced examples, see the other directories in this examples folder.