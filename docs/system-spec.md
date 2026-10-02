# SubCadence System Specification

## 1. Project Overview
**SubCadence** is a pedagogy-first BJJ academy management and mat-side pacing SaaS. It differentiates itself from generic gym software by integrating constraints-led curriculum design, node-based tactical flows, and a distance-optimized mat timer with automated audio ducking.

## 2. Tech Stack
* **Framework:** Next.js (App Router)
* **Language:** TypeScript (Strict typing required)
* **Styling:** Tailwind CSS (Dark theme default: slate-900/950 backgrounds, emerald/cyan/indigo/amber accents)
* **Icons:** `lucide-react`
* **Database & Auth:** Supabase (PostgreSQL)
* **Deployment:** Vercel

## 3. Core Architectural Rules (AI Instructions)
When generating or refactoring code for this project, adhere strictly to the following rules:

1. **Modular Architecture:** The main `app/page.tsx` file is purely a state controller and Supabase sync engine. All UI rendering must be extracted into dedicated component files inside `app/components/` (e.g., `MatTimerView.tsx`, `LessonBuilderView.tsx`). Never add new inline UI blocks to `page.tsx`.
2. **Supabase Client Instantiation:** Use the centralized client in `lib/supabaseClient.ts` for database operations rather than initializing new clients inside individual components.
3. **Supabase Query Syntax:** Supabase `@supabase/postgrest-js` queries return an object `{ data, error }`. **Never chain `.catch()` to Supabase queries.** It causes TypeScript Error 2551. Handle errors by checking the returned `error` object.
4. **Data Merging Engine:** Do not hard-overwrite local arrays with Supabase fetch results. Always merge remote data with local fallback/prebaked data (e.g., `BASELINE_WARMUPS`, `PREBAKED_LESSONS` from `app/data/curriculumData.ts`) using ID deduplication to ensure the UI never crashes on empty database tables.
5. **Defensive Rendering:** Always use fallback empty strings or arrays (e.g., `(p.className || '').toLowerCase()`) when filtering or mapping data to prevent silent crashes from malformed remote database rows.
6. **API Routes:** AI generation functions must strictly hit the `/api/generate-lesson` and `/api/chat-assistant` App Router endpoints.

## 4. Hardware & Browser API Integrations
* **Audio Ducking:** Uses the native `AudioContext` (Web Audio API) to create sine-wave tones (400Hz start, 550Hz rest). It directly manipulates the `HTMLAudioElement.volume` property to duck local music to 20% for 2.2 seconds during tones.
* **Screen Wake Lock:** Uses `navigator.wakeLock.request('screen')` to prevent the tablet/phone display from dimming or locking while the `isActive` timer state is true.
* **Audio Resiliency:** Includes an event listener on `visibilitychange` and `focus` to resume the `AudioContext` state, bypassing iOS/Chrome background throttling.

## 5. Database Schema (Supabase)
Currently implemented tables (Public schema):
* `instructors`: `id`, `username`, `password`, `name`, `email`, `role`, `rank`, `bio`
* `lessons`: `id`, `class_name`, `concept`, `age_group`, `belt_rank`, `total_duration_minutes`, `tags` (string[]), `warm_up` (jsonb), `flow` (jsonb), `drills` (jsonb), `live_rounds` (jsonb), `is_public`, `author_id`, `author_name`
* `flow_routines`: `id`, `title`, `concept`, `starting_position`, `round_count`, `round_time_seconds`, `rest_time_seconds`, `nodes` (jsonb), `is_public`
* `warmup_presets`: `id`, `warm_up_name`, `type`, `description`, `game_rules`, `constraints`, `goals`, `round_count`, `round_time_seconds`, `rest_time_seconds`, `is_custom`
* `schedules`: `id`, `date_str`, `time`, `title`, `age_group`, `duration_minutes`, `assigned_instructor_id`, `assigned_lesson_id`, `post_class_notes`, `modifications_suggested`

*(Note: Future iterations will introduce an `academy_id` column across all tables enforced by Row-Level Security for multi-tenant SaaS scaling).*

## 6. Project Structure
```text
grappling-app/
├── app/
│   ├── api/
│   │   ├── chat-assistant/
│   │   │   └── route.ts
│   │   └── generate-lesson/
│   │       └── route.ts
│   ├── components/
│   │   ├── CalendarView.tsx
│   │   ├── CurriculumHubView.tsx
│   │   ├── FlowChainsView.tsx
│   │   ├── LessonBuilderView.tsx
│   │   ├── MatTimerView.tsx
│   │   ├── Navigation.tsx
│   │   └── SearchableLessonPicker.tsx
│   ├── data/
│   │   └── curriculumData.ts
│   ├── layout.tsx
│   ├── page.tsx
│   └── types.ts
├── docs/
│   ├── backlog.md
│   ├── modular-current.md
│   ├── monolith-reference.md
│   └── system-spec.md
└── lib/
    └── supabaseClient.ts