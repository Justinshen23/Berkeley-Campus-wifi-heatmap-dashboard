#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

REPO="Justinshen23/uc-berkeley-wifi-monitor"
REMOTE="github"

if ! git remote get-url "$REMOTE" >/dev/null 2>&1; then
  git remote add "$REMOTE" "git@github.com:${REPO}.git"
  echo "Added remote '$REMOTE' -> git@github.com:${REPO}.git"
else
  echo "Remote '$REMOTE' already set: $(git remote get-url "$REMOTE")"
fi

echo ""
echo "=========================================="
echo " STEP 1: Create the repo on GitHub (once)"
echo "=========================================="
echo ""
echo "  Open: https://github.com/new"
echo "  Owner: Justinshen23"
echo "  Name:  uc-berkeley-wifi-monitor"
echo "  Visibility: Public"
echo ""
echo "  IMPORTANT: Leave all checkboxes UNCHECKED"
echo "  (no README, no .gitignore, no license)"
echo ""
echo "  Click 'Create repository'"
echo ""
read -r -p "Press Enter AFTER you have created the empty repo..."

echo ""
echo "Pushing to GitHub..."
if git push -u "$REMOTE" main; then
  echo ""
  echo "Success: https://github.com/${REPO}"
  exit 0
fi

echo ""
echo "SSH push failed. Trying HTTPS (will prompt for GitHub login)..."
git remote set-url "$REMOTE" "https://github.com/${REPO}.git"
git push -u "$REMOTE" main
echo ""
echo "Success: https://github.com/${REPO}"
