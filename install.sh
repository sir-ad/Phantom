#!/bin/bash

# PHANTOM OS - Universal One-Line Installer
# "The invisible force behind every great product."

set -e

echo "🎭 Initializing Phantom OS Installer..."

# 1. Check for Node.js
if ! command -v node >/dev/null 2>&1; then
    echo "❌ Node.js not found. Please install Node.js (v18+) first."
    exit 1
fi

# 2. Check for NPM
if ! command -v npm >/dev/null 2>&1; then
    echo "❌ NPM not found."
    exit 1
fi

echo "🚀 Installing @phantom-pm/cli globally..."
npm install -g @phantom-pm/cli --quiet

echo "✅ Phantom OS installed successfully!"
echo "👉 Run 'phantom --help' to get started."
echo "👉 Or run 'phantom dev' to boot the Matrix UI."

# (Optional) Verify installation
phantom --version
