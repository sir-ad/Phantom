+++
title = "Phantom Oracle"
description = "Context-aware philosophical calibration for developers"
weight = 40
+++

The **Phantom Oracle** is a universal agent interface that follows you across the web. It bridges the gap between your research in LLM chat interfaces (ChatGPT, Claude, Gemini) and your core product development lifecycle.

## The New Tab Experience

Oracle transforms your browser's "New Tab" page into a moment of focus and calibration. Instead of a blank screen, you see a **Philosophical Quote** tailored to your recent technical and creative challenges.

### Features

-   **Context Scrapers**: Automatically extracts context from active conversations on `chatgpt.com`, `claude.ai`, and `gemini.google.com`.
-   **Dynamic Calibration**: Analyzes the sentiment and topic of your research to surface relevant insights (e.g., Marcus Aurelius on persistence during debugging).
-   **Local-First Processing**: Context is sent to your local Phantom instance for analysis—your data never leaves your control.

## Installation

The Chrome Extension is currently in **Developer Preview**.

1.  **Build the Project**:
    ```bash
    cd packages/chrome-extension
    npm install
    npm run build
    ```
2.  **Load in Chrome**:
    -   Open `chrome://extensions/`
    -   Enable **Developer mode** (top right toggle).
    -   Click **Load unpacked**.
    -   Select the `packages/chrome-extension/dist` directory.

## Integration

The Oracle extension communicates directly with the Phantom local server. You must have the Phantom dashboard running for it to work:

```bash
phantom dashboard --extension-server
```

Once connected, your "New Tab" will begin reflecting the "vibe" of your active research, helping you maintain a high-level perspective during deep-work sessions.
