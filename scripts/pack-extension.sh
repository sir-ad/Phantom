#!/usr/bin/env sh
set -e

echo "📦 Packaging Phantom Oracle (Chrome Extension)..."

# Ensure we are in the root
if [ ! -d "packages/chrome-extension" ]; then
  echo "Error: Must run from project root"
  exit 1
fi

cd packages/chrome-extension

echo "  ↳ Installing dependencies..."
npm install --silent

echo "  ↳ Building..."
npm run build

cd ../..

echo "  ↳ Zipping artifact..."
RELEASE_ZIP="phantom-oracle-v2.0.0.zip"
rm -f "$RELEASE_ZIP"

# Check if zip command exists
if command -v zip >/dev/null 2>&1; then
  # Zip just the dist folder content so unzipping gives the files ready to load
  cd packages/chrome-extension/dist
  zip -r "../../../$RELEASE_ZIP" .
  cd ../../..
  echo "✅ Created $RELEASE_ZIP"
  echo "   (Contains build artifacts ready for 'Load Unpacked')"
else
  echo "⚠️  'zip' command not found. Skipping zip creation."
fi
