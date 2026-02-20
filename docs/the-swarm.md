# The Swarm: Multi-Agent Architecture

Phantom is not a single chatbot. It is a **Super Intellect** composed of a highly orchestrated Swarm of autonomous agents. When you issue a high-level command, the Swarm dissects it, parallelizes the workload, and returns a compiled, deterministic result.

## Why a Swarm? (The YC Ethos)
To move fast, you must parallelize. A single agent generates linear, often myopic output. A Swarm introduces debate, specialized context injection, and structural validation. 

### The Core Nodes
1. **The Synthesizer Agent:** Reads the raw input (voice or text), extracts the core problem, and builds the semantic Knowledge Graph.
2. **The Architect Agent:** Ingests the Synthesizer's graph and drafts the PRD (Product Requirements Document) leveraging SOTA models like `deepseek-r1`.
3. **The UX Agent:** Reads the PRD and automatically generates the styling/layout code (React + Tailwind) using `claude-3.7-sonnet`.
4. **The Executor Agent:** Validates the generated artifacts against enterprise constraints.

## Using the Swarm

The Swarm is natively integrated into the `chat` and `task` CLI commands, as well as the Matrix UI Canvas.

```bash
# Instruct the swarm to build a feature end-to-end
npx @phantom-pm/cli@latest task "We need a GDPR compliant cookie banner. Build the PRD and the UI mockup."
```

Behind the scenes, the terminal will light up as multiple agents spawn, communicate via an internal event bus, and yield the finalized `CookieBanner.tsx` and `PRD_CookieBanner.md`.

## The Rowboat (Memory Graph)
The Swarm is only as smart as its context. 
Phantom uses a **Semantic Knowledge Graph** (internally dubbed "Rowboat"). Instead of isolated vector chunks, the Swarm maps relationships:
`[User Feedback in Slack] -> [Related Jira Ticket] -> [Resulting PRD Section]`

When you ask the Swarm to modify a feature, it traverses this graph to ensure you don't break a requirement requested by a key enterprise client three months ago.
