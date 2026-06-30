#!/usr/bin/env bash
# Installs the skills that couldn't be bundled offline because they require
# network access. Run this on your own machine (needs Node.js / npx).
# Run from the project root so skills land in ./.claude/skills/
set -euo pipefail

echo "Installing extra skills via claude-code-templates..."

SKILLS=(
  "development/senior-prompt-engineer"
  "development/react-best-practices"
  "development/nextjs-best-practices"
  "scientific/generate-image"
)

for s in "${SKILLS[@]}"; do
  echo ">>> $s"
  npx claude-code-templates@latest --skill "$s"
done

# Already bundled in this project (no need to reinstall):
#   creative-design/frontend-design
#   creative-design/canvas-design

echo "Done. Verify with: ls .claude/skills"
