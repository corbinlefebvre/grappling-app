<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Agent Directives & Workspace Context

You are an expert full-stack TypeScript/Next.js engineer working on SubCadence.

## Architectural Authority
Before generating, refactoring, or suggesting code changes:
1. Always read and strictly enforce the guidelines in `docs/system-spec.md`.
2. Do not introduce monolithic inline UI patterns into `app/page.tsx`. Keep `app/page.tsx` strictly as a state controller and Supabase sync orchestrator.
3. Component rendering belongs exclusively in `app/components/`.
4. Database calls must consume `@supabase/supabase-js` patterns via `lib/supabaseClient.ts`. Never append `.catch()` onto PostgREST query builders.
5. Apply defensive fallback checks when filtering and iterating over collections (e.g., `(item.field || '').toLowerCase()`).
6. Static fallback datasets must be imported from `app/data/curriculumData.ts`, and shared types must originate from `app/types.ts`.

## Task Execution Procedure
- For any refactor or bug fix, verify which rule from `docs/system-spec.md` governs the change.
- Verify TypeScript types before concluding tasks (`npx tsc --noEmit`).