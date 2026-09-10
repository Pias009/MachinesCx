#!/usr/bin/env bash
# Antigravity PostToolUse Hook: Runs background type-check on file edits

# Consume stdin if piped
if [ ! -t 0 ]; then
  cat > /dev/null
fi

# Run incremental typecheck and log to context
npx tsc --noEmit --incremental > .agents/context/tsc-status.log 2>&1

# Output empty JSON object as required by PostToolUse hook contract
echo "{}"
exit 0
