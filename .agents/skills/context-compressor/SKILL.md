---
name: context-compressor
description: Auto-read and package the project structure and context at low token cost using Repomix AST compression and targeted exclusion patterns.
---

# Context Compressor & Low-Token Codebase Exploration

This skill provides procedures for understanding the codebase with minimal token expenditure, preventing context rot and high agent latency.

## Why Raw Dumps Fail
- A raw scan of this repo is **~1.8M tokens**.
- Large translation tables (`messages/*.json`) and mock databases (`data/products*.json`) consume hundreds of thousands of tokens without providing architectural value.

## 1. Quick Codebase Compression
To regenerate the compressed architectural skeleton of the workspace:
```bash
repomix
```
This uses [repomix.config.json](file:///home/pias/Downloads/im/cx-machinery-site/my-project/repomix.config.json) which:
- Strips function bodies using Tree-sitter AST compression (`--compress`).
- Ignores large JSON payloads, lockfiles, zip files, and static media.
- Compresses the codebase by **over 95%** down to `.agents/context/repomix-output.md`.

## 2. Inspecting Codebase Context
- Use `view_file` with line range slices on `.agents/context/repomix-output.md` to see exported interfaces, functions, and module boundaries.
- Never dump or read entire large JSON databases unless the specific prompt requires data migration.

## 3. Repomix MCP Server
Repomix is also registered as an MCP server in Antigravity (`repomix --mcp`).
- Can run dynamic queries, file estimations, and targeted searches directly without manual file preparation.
