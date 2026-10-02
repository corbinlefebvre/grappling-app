---
description: "Enforce SubCadence architectural constraints from docs/system-spec.md"
globs: "app/**/*.{ts,tsx}"
alwaysApply: true
---

# SubCadence Architectural Invariants
- Read `docs/system-spec.md` before applying edits to `app/`.
- Verify all imported types originate from `app/types.ts`.
- Verify static fallback datasets are imported from `app/data/curriculumData.ts`.
- Ensure new views implement distinct components within `app/components/` and accept props via typed interfaces.
- Never use `.catch()` on Supabase PostgREST query builders; check returned error objects directly.
- Ensure `app/page.tsx` acts solely as a controller and sync layer with no inline view bodies.