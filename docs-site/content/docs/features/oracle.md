+++
title = "Phantom Oracle"
description = "Context-aware philosophical calibration for developers"
weight = 40
+++


The **Phantom Oracle** is a universal agent interface that follows you across the web. It bridges the gap between your research in LLM chat interfaces (ChatGPT, Claude, Gemini) and your core product development lifecycle.

## The New Tab Experience

Oracle transforms your browser's "New Tab" page into a moment of focus and calibration. Instead of a blank screen, you see a **Philosophical Quote** tailored to your recent technical and creative challenges.

### Features

- **Context Scrapers**: Automatically extracts context from active conversations on `chatgpt.com`, `claude.ai`, and `gemini.google.com`.
- **Dynamic Calibration**: Analyzes the sentiment and topic of your research to surface relevant insights.
- **Local-First Processing**: Context is sent to your local Phantom instance for analysis—your data never leaves your control.

## Installation

1.  Navigate to `packages/chrome-extension`.
2.  Run `npm install && npm run build`.
3.  Open Chrome Extensions (`chrome://extensions`).
4.  Enable **Developer Mode**.
5.  Click **Load Unpacked** and select the `packages/chrome-extension/dist` folder.

## Integration

The Oracle extension communicates directly with the Phantom local server. Ensure your Phantom backend is running:

```bash
phantom dashboard --extension-server
```

Once connected, your "New Tab" will begin reflecting the "vibe" of your active research, helping you maintain a high-level perspective during deep-work sessions.
