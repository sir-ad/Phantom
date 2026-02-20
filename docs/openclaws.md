# OpenClaws: The Hands of the Intellect

Intelligence without agency is just a book. Phantom has hands. 

We realized that outputting text-based PRDs in a terminal was only solving 50% of the Product Management bottleneck. The other 50% is visual verification, competitive analysis, and QA validation. 

Enter **OpenClaws**.

## What is OpenClaws?
OpenClaws is the autonomous execution layer of Phantom OS. It allows the Super Intellect to break out of the terminal and directly interact with browsers and host operating systems.

### 1. The Browser Agent (Visual Traversal)
If you tell Phantom, *"Check if our marketing site's CTA is rendering correctly on mobile,"* it does not guess.
- It spins up a headless Playwright instance.
- It actively navigates to your staging URL.
- It parses the DOM tree into semantic tokens.
- It captures a visual screenshot and processes it via `gpt-4o` or `claude-3.7-sonnet`.
- It returns the deterministic truth to your Matrix Canvas.

### 2. The OS Edge Node (Gateway Intelligence)
We drew immense inspiration from the architectures of `PicoClaw`. The Cloud is often disjointed from local reality. Phantom bridges this gap.

The OS Edge Node is a lightweight WebSocket client that runs natively on your machine during a `phantom server` session. It grants the central Swarm the ability to:
- Capture desktop screenshots (for contextual UI feedback).
- Execute precise X/Y coordinate mouse clicks (leveraging Anthropic's emerging Computer Use algorithms).
- Read deeply nested local configuration files without requiring explicit CI/CD integration.

## Invoking OpenClaws
OpenClaws routing is handled automatically by the Swarm if a tool call requires physical world interaction. 

For manual intervention:
```bash
# Ask OpenClaws to visually audit a living page
npx @phantom-pm/cli@latest chat "Open up https://phantom.pm and tell me if the nav bar is broken."
```

*Note: OpenClaws requires an active `phantom server` daemon running in the background to access Playwright binaries and localized Edge Node ports.*
