# Contributing to Phantom

We love contributions! Phantom is open source (MIT) and built by product people, for product people.

## Getting Started

1.  **Fork the repo** on GitHub.
2.  **Clone your fork**:
    ```bash
    git clone https://github.com/YOUR_USERNAME/Phantom.git
    cd Phantom
    ```
3.  **Install dependencies**:
    ```bash
    npm install
    ```
4.  **Build the project**:
    ```bash
    npm run build
    ```

## Development Workflow

-   **Run CLI locally**: `npm run phantom` (linked to `packages/cli/dist/index.js`)
-   **Run tests**: `npm run test`
-   **Format code**: `npm run format`

## Project Structure

This is a monorepo managed by npm workspaces:

-   `packages/core`: The brain (AI, Context, Logic)
-   `packages/cli`: The terminal interface
-   `packages/mcp-server`: The MCP implementation
-   `packages/modules`: Functional plugins
-   `packages/tui`: UI components for the terminal
-   `packages/integrations`: Connectors for external tools

## Pull Request Guidelines

1.  Keep PRs focused on a single feature or fix.
2.  Add tests for new functionality.
3.  Follow the existing code style (Prettier/ESLint are configured).
4.  Update documentation if you change behavior.

## Adding a New Module

Want to add a new capability? Create a new module in `packages/modules/src/`.
See `prd-forge.ts` for an example of how to structure a module.
