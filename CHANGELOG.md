# Changelog

All notable changes to the Phantom OS project will be documented in this file.

## [3.0.0] - 2026-02-20

### 🚀 major Features
- **The "Matrix" UI:** Complete overhaul of the frontend with a terminal-inspired, neon-green "Codex" aesthetic.
- **OS Edge Nodes:** Distributed agent architecture allowing Phantom to break out of the browser and interact with the local OS (screenshots, mouse control).
- **Semantic Knowledge Graph:** Upgraded context engine from vector search to a full product knowledge graph (ingests Jira, Slack, Notion).
- **Universal SOTA Model Routing:** Native support for `DeepSeek-R1`, `Claude 3.7 Sonnet`, `Gemini 2.5 Pro`, and `o3-mini`.
- **Autonomous Swarms:** Multi-agent workflows for automated PRD generation, story writing, and competitive analysis.
- **One-Line Universal Installer:** Bash script for instant ecosystem deployment.

### 🛠️ Fixed
- Resolved circular dependencies between `@phantom-pm/core` and `@phantom-pm/memory`.
- Fixed topological build order in monorepo for stable CI/CD.
- Corrected malformed template literals and regex flags in `@phantom-pm/agent-communicator`.
- Pruned 300MB+ of legacy code (dashboard, extension v1, etc.).

### 🔒 Security & Infra
- **Trusted Publishing:** Migrated to OIDC/Provenace based NPM publishing.
- **GitHub Pages:** Automated deployment for the Phantom landing page.
- **Agent Sandbox:** Robust `.antigravityignore` and `.gitignore` to protect internal strategy documents.

---
*There is only context.*