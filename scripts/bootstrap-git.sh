#!/usr/bin/env sh
set -eu

REMOTE_URL="${1:-git@github.com:sir-ad/phantom.git}"
BRANCH="${2:-main}"

if ! command -v git >/dev/null 2>&1; then
  echo "git is required" >&2
  exit 1
fi

if [ ! -d ".git" ]; then
  git init
fi

if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  git checkout "$BRANCH"
else
  git checkout -b "$BRANCH"
fi

git add .
if ! git diff --cached --quiet; then
  git commit -m "feat: phantom launch-ready foundation"
fi

if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$REMOTE_URL"
else
  git remote add origin "$REMOTE_URL"
fi

echo "Remote configured: $REMOTE_URL"
echo "Next: git push -u origin $BRANCH"
