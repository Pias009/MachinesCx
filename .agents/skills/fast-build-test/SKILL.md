---
name: fast-build-test
description: Run the fastest possible incremental build checks, TypeScript compilation, and targeted test verification without slow production builds.
---

# Fast Build & Test Procedure

When verifying code in this Next.js/TypeScript project:

1. **Do NOT run `npm run build` for simple changes**:
   Full Next.js builds take 40-60 seconds and use heavy memory. Only run full build when the user explicitly requests production deployment testing or route statically generated validation.

2. **Step 1: Rapid Type Verification (2-4 seconds)**:
   ```bash
   npx tsc --noEmit --incremental
   ```
   If this exits with code 0, TypeScript types, imports, and JSX props are guaranteed valid.

3. **Step 2: Rapid Lint Check**:
   Instead of linting the entire project:
   ```bash
   npx eslint <path/to/changed_file.tsx> --max-warnings=0
   ```

4. **Step 3: Verification Script**:
   ```bash
   ./scripts/agent-verify.sh
   ```
   This script runs automatically on task termination via the `Stop` hook in `.agents/hooks.json`.

5. **Step 4: Local Dev Server Verification**:
   The dev server runs on port `3333` (`npm run dev`).
   Verify specific API routes or pages with `curl -s http://localhost:3333/api/...` or use `browser_subagent`.
