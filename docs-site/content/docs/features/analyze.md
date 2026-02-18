+++
title = "Deep Task Analysis"
description = "Recursive task decomposition and complexity assessment"
weight = 30
+++

# Deep Task Analysis 🧠

Phantom's Deep Task Analysis engine allows you to break down complex, multi-layered goals into an actionable hierarchy of tasks. Inspired by high-performance engineering practices, it recursively decomposes challenges until they are small enough to be executed by a single agent.

## How it Works

When you provide a high-level goal, the **TaskMasterAgent** performs a multi-step analysis:

1.  **Decomposition**: Breaks the goal into 3-5 high-level subtasks.
2.  **Assessment**: Assigns a **Complexity Score** (1-10) to each subtask.
3.  **Assignment**: Recommends a specialized agent (e.g., `CoderAgent`, `ArchitectAgent`, `Researcher`) based on the task description.
4.  **Recursion**: If a subtask has a complexity score greater than **5**, the engine recursively triggers another round of decomposition for that specific node.

## Usage

Run the analysis from your terminal:

```bash
phantom task analyze "Build a cross-platform mobile app with auth and local sync"
```

### Output Visualization

The TUI provides a color-coded tree structure:
- 🔴 **Red (8-10)**: High complexity, requires deep design or further breakdown.
- 🟡 **Yellow (5-7)**: Medium complexity, ready for architectural planning.
- 🟢 **Green (1-4)**: Low complexity, ready for immediate execution.

## Key Benefits

- **Clearer Roadmapping**: Transform vague ideas into concrete steps.
- **Resource Optimization**: Know exactly which agent (or LLM) is best suited for each part of your project.
- **Risk Identification**: High-complexity "hotspots" are flagged early in the planning phase.
