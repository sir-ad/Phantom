+++
title = "Install"
+++

# Installation

Phantom runs on macOS, Linux, and Windows (via WSL2).

## Option 1: One-Line Installer (Recommended)

Installs the latest release binary to your system.

```bash
curl -fsSL https://raw.githubusercontent.com/sir-ad/Phantom/main/scripts/install.sh | sh
```

To upgrade later:
```bash
curl -fsSL https://raw.githubusercontent.com/sir-ad/Phantom/main/scripts/install.sh | sh -s -- --upgrade
```

## Option 2: npm Global Install

If you have Node.js 18+ installed:

```bash
npm install -g phantom-pm
```

## Option 3: Docker

Ideal for isolated environments or server deployments.

```bash
docker pull phantompm/phantom:latest
docker run -it -e OPENAI_API_KEY=sk-... phantompm/phantom:latest
```

## Option 4: Build from Source

For contributors or customized builds.

```bash
git clone https://github.com/sir-ad/Phantom.git
cd phantom
npm install
npm run build

# Link globally
npm link packages/cli
```

## Post-Installation

Once installed, run the setup wizard to configure your AI providers:

```bash
phantom config setup
```
