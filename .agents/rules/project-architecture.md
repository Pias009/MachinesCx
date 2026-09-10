---
trigger: model_decision
description: Architecture overview and directory layout for cx-machinery-site Next.js project.
---

# Project Architecture & Directory Layout

- **Framework**: Next.js 14 (App Router) + TypeScript + Tailwind CSS.
- **Port**: 3333 (`npm run dev`).
- **Dev Server**: `npm run dev` (running on port 3333).

## Key Paths
- `app/[locale]/`: Multilingual public customer-facing routes (internationalized via `next-intl`).
- `app/cx-ops-x7k9q2/`: Admin portal shell and sub-panels (login, inquiries, invite, analytics, settings).
- `app/api/`: Backend API routes (Admin auth, Inquiries, Image uploads, AI Chatbot).
- `components/`: UI components (GSAP animations, Three.js 3D viewers, catalog displays).
- `lib/`: Business logic, authentication helpers (`adminAuth.ts`, `adminCredentials.ts`), MongoDB connection (`mongoose`), AI orchestrators (`gemini.ts`, `groq.ts`).
- `models/`: Mongoose schema models (`AdminUser.ts`, `Inquiry.ts`, `ChatSession.ts`).
- `.agents/context/repomix-output.md`: Tree-sitter compressed AST map of the entire codebase (~85k tokens vs 1.8M tokens raw).

## Verification Guidelines
- Run `npx tsc --noEmit --incremental` for instant type safety verification (< 3s).
- Verify Stop hook passes using `./scripts/agent-verify.sh`.
