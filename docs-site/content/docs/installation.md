+++
title = "Installation"
+++

---
sidebar_position: 3
title: Installation
---

# Installation

Phantom supports macOS, Linux, and Windows (via WSL2). Choose the method that suits you.

## One-Line Installer (Recommended)

Downloads the latest release binary and installs it to your system PATH.

```bash
curl -fsSL https://raw.githubusercontent.com/sir-ad/Phantom/main/scripts/install.sh | sh
```

**What it does:**
1. Detects your OS and architecture (macOS Arm/Intel, Linux x64).
2. Downloads the latest release tarball from GitHub Releases.
3. Extracts the `phantom` binary to `~/.phantom/bin/`.
4. Adds `~/.phantom/bin` to your PATH (via `.bashrc` / `.zshrc`).

### Upgrading

```bash
curl -fsSL https://raw.githubusercontent.com/sir-ad/Phantom/main/scripts/install.sh | sh -s -- --upgrade
```

### Uninstalling

```bash
rm -rf ~/.phantom
# Remove the PATH entry from your shell RC file
```

---

## npm Global Install

If you have Node.js 18+ installed:

```bash
npm install -g phantom-pm
```

This installs the `phantom` command globally.

### Upgrading via npm

```bash
npm update -g phantom-pm
```

---

## Docker

For isolated environments or CI/CD pipelines:

```bash
docker pull phantompm/phantom:latest
docker run -it \
  -e OPENAI_API_KEY="sk-..." \
  phantompm/phantom:latest
```

To use Ollama from Docker, mount the host's Ollama socket:

```bash
docker run -it \
  --network host \
  phantompm/phantom:latest
```

---

## Build from Source

For contributors or custom builds:

```bash
git clone https://github.com/sir-ad/Phantom.git
cd phantom
npm install
npm run build
```

Run locally:

```bash
node packages/cli/dist/index.js
```

Or link globally:

```bash
npm link packages/cli
phantom --version
```

---

## System Requirements

| Requirement | Minimum | Recommended |
|------------|---------|-------------|
| Node.js | 18.0.0 | 20.x LTS |
| RAM | 512 MB | 2 GB (for local Ollama models) |
| Disk | 50 MB | 500 MB (with Ollama models) |
| OS | macOS 12+, Ubuntu 20.04+, WSL2 | macOS 14+, Ubuntu 22.04+ |

## Post-Installation

After installing, configure your AI providers:

```bash
phantom config setup
```

This walks you through setting API keys for OpenAI, Anthropic, Gemini, and GitHub OAuth.
