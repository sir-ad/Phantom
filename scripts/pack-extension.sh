#!/usr/bin/env sh
set -e

echo "📦 Packaging Phantom Oracle (Chrome Extension)..."

# Ensure we are in the root
if [ ! -d "packages/chrome-extension" ]; then
  echo "Error: Must run from project root"
  exit 1
fi

cd packages/chrome-extension

# Simple extension, no build step needed
# If you add complex build steps later, add them here

cd ../..

# Zipping the source directory directly
RELEASE_ZIP="phantom-oracle-v3.1.0.zip"
rm -f "$RELEASE_ZIP"

if command -v zip >/dev/null 2>&1; then
  cd packages/chrome-extension
  zip -r "../../$RELEASE_ZIP" . -x "*.DS_Store*" "package.json" "README.md"
  cd ../..
  echo "✅ Created $RELEASE_ZIP"
  echo "   (Contains build artifacts ready for 'Load Unpacked')"
else
  echo "⚠️  'zip' command not found. Skipping zip creation."
fi
