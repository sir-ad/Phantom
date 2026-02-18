#!/usr/bin/env sh
set -e

TARGET="../PhantomOracle"
SOURCE="packages/chrome-extension"

echo "🦅 Extracting Phantom Oracle to $TARGET..."

# Clean target
rm -rf "$TARGET"
mkdir -p "$TARGET"

# Copy files (careful with hidden files and exclusion)
echo "  ↳ Copying source files..."
cp -R "$SOURCE/" "$TARGET/"

# Clean up build artifacts and node_modules in the target to keep it source-only
echo "  ↳ Cleaning target..."
rm -rf "$TARGET/node_modules"
rm -rf "$TARGET/dist"
rm -rf "$TARGET/.turbo"

# Create a specialized README for the standalone product
echo "  ↳ Generating standalone README..."
cat > "$TARGET/README.md" <<EOF
# Phantom Oracle 🔮

> "The invisible force behind every great product."

Phantom Oracle is a Chrome Extension that transforms your "New Tab" page into a moment of philosophical calibration. It uses your **local Phantom context** to surface relevant quotes and insights based on your recent LLM interactions.

## Features
- **Context Awareness**: Reads active chats from ChatGPT, Claude, and Gemini.
- **Local Intelligence**: Processed securely by your local Phantom CLI.
- **Philosophical Injection**: Replaces noise with targeted wisdom.

## Setup

1. **Install Dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

2. **Build**:
   \`\`\`bash
   npm run build
   \`\`\`

3. **Load in Chrome**:
   - Go to \`chrome://extensions/\`
   - Enable **Developer Mode**
   - Click **Load Unpacked**
   - Select the \`dist/\` folder from this directory.

## Connection

Ensure your Phantom CLI is running the extension server:

\`\`\`bash
phantom dashboard --extension-server
\`\`\`

---
*Part of the [Phantom AI Operating System](https://github.com/sir-ad/Phantom)*
EOF

echo "✅ Extracted Phantom Oracle to $TARGET"
echo "   You can now initialize a new git repo there:"
echo "   cd $TARGET && git init && git add . && git commit -m 'Initial commit'"
