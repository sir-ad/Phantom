# The Matrix Boot Sequence: Installation Guide

Forget cloning. Forget compiling. Phantom operates with YC-level speed.

We have engineered a **1-Click No Clone** architecture that pulls the pre-compiled OS directly into your environment. It drops a hidden `.phantom` directory into your host machine and natively wraps it in a Node gateway.

## Step 1: Initialize the Boot Sequence

Phantom is published directly to the Global NPM Registry. You don't need to install anything permanently. You can stream the installer locally.

Open your terminal and execute the boot sequence:

```bash
npx @phantom-pm/cli@latest boot
```

### What happens here?
1. Phantom detects your host OS.
2. It reaches out to the GitHub Releases API.
3. It downloads the `phantom-web-ui.zip` (the Matrix UI artifact).
4. It unzips it securely into `~/.phantom/web`.

*No Node.js build steps. No Webpack compilation. Just pure, standalone static intelligence.*

## Step 2: Ignite the Server

With the Matrix downloaded, you must boot the local Gateway.

```bash
npx @phantom-pm/cli@latest server
```

The Server daemon will boot. It instantly:
- Mounts the static UI out of `~/.phantom/web`.
- Express-routes the Core AI interactions (Anthropic, DeepSeek, OpenAI).
- Connects the SQLite Persistence graph (`~/.phantom/phantom.db`).

Open [http://localhost:3333](http://localhost:3333) in your browser.
**The Matrix is awake.**

---

## Fallback: The Engineer's Path
If you are a developer looking to contribute to the Swarm or execute the compiler manually:

```bash
git clone https://github.com/sir-ad/Phantom.git
cd Phantom
npm install

# Build the ecosystem topographically
npm run build

# Start the Next.js Developer Server natively
npm run dev
```
