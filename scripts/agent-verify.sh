#!/usr/bin/env bash
# Antigravity Stop Hook: Verifies TypeScript types before allowing task completion

# Consume stdin if piped
if [ ! -t 0 ]; then
  cat > /dev/null
fi

# Run incremental typecheck
OUTPUT=$(npx tsc --noEmit --incremental 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  # Sanitize output for JSON string
  CLEAN_MSG=$(echo "$OUTPUT" | head -n 15 | tr '\n' ' ' | sed 's/"/\\"/g')
  echo "{\"decision\":\"continue\",\"reason\":\"TypeScript compilation failed. Errors: $CLEAN_MSG\"}"
  exit 0
else
  echo "{\"decision\":\"allow\"}"
  exit 0
fi
