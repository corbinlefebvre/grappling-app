# Modular Architecture Reference

This document describes the current modular architecture of the SubCadence application following the migration from the monolithic `Page.tsx`.

## Architecture Overview

```
app/
├── api/
│   ├── chat-assistant/
│   │   └── route.ts            # Gemini AI endpoint for conversational coach & actions
│   └── generate-lesson/
│       └── route.ts            # Gemini AI endpoint for structured lesson generation
├── components/
│   ├── CalendarView.tsx        # Academy Schedule & Pacing with debriefs & modifications
│   ├── CurriculumHubView.tsx   # Concept lessons & warmup games catalog with tagging
│   ├── FlowChainsView.tsx      # Tactical submission/counter sequence studio & library
│   ├── LessonBuilderView.tsx   # Constraints-led lesson planner with pacing budget
│   ├── MatTimerView.tsx        # Responsive Mat HUD, round timer, and music deck
│   ├── Navigation.tsx          # Top navigation bar, mobile drawer, and session status
│   └── SearchableLessonPicker.tsx # Dropdown modal picker with age & belt filter chips
├── data/
│   └── curriculumData.ts       # Baseline taxonomy, seeds, and 624-lesson generator
├── types.ts                    # Central TypeScript interfaces and data contracts
├── globals.css                 # Tailwind CSS styles and theme variables
├── layout.tsx                  # Root layout, viewport config, and PWA manifest link
└── page.tsx                    # Top-level state coordinator, modals, and route switch
lib/
└── supabaseClient.ts           # Supabase client singleton
public/
└── manifest.json               # Progressive Web App manifest
```

## Key Modules & Responsibilities

### 1. `app/types.ts`
Central domain models for the entire application:
- `Instructor` & `UserRole`: Academy staff roster and role permissions (`owner`, `manager`, `instructor`, `assistant`).
- `FlowRoutine` & `FlowNode`: Dynamic multi-stage technique transitions and trigger-response pairs.
- `WarmUp`: General dynamic movement or game-based constraints warmups.
- `Drill`: Positional mini-games with explicit constraints, primary win condition, and reset triggers.
- `LessonPlan`: Complete curriculum plan binding warmup, optional flow chain, drills, and live sparring rounds.
- `ClassTemplate`: Academy class types with default durations.
- `ScheduledClass`: Calendar scheduled classes with assigned instructor, lesson plan, and post-class debrief notes.
- `ChatMessage`: AI assistant message history with interactive `actionPayload` (`POPULATE_LESSON`, `CREATE_CONCEPT`).
- `WeeklyTaxonomy`: 26-week curriculum taxonomy model.

### 2. `app/data/curriculumData.ts`
- `SIX_MONTH_TAXONOMY`: 26-week systematic taxonomy spanning 6 core grappling lineages (Roger Gracie, Gordon Ryan, Marcelo Garcia, Bernardo Faria, John Danaher, Lachlan Giles).
- `generateSixMonthsCurriculum()`: Generates 624 complete, mat-ready lesson plans across 4 age profiles (Tiny Champs 3-6, Youth 7-12, Adults Fundamentals, and Masters Dilemmas).
- `BASELINE_CONCEPTS`: 8 standard academy core systems.
- `BASELINE_WARMUPS`: 3 dynamic and game-based warmup presets.
- `BASELINE_FLOWS`: 2 complete multi-stage flow chains (Closed Guard Triple Threat, Chest-to-Chest Passing).
- `INITIAL_INSTRUCTORS_SEED` & `INITIAL_CLASS_TEMPLATES_SEED`: Baseline staff and schedule templates.

### 3. `app/components/`
- **`MatTimerView.tsx`**: Large high-contrast mat timer with round counts, work/rest intervals, automatic phase progression, audio tones, and music player controls.
- **`LessonBuilderView.tsx`**: Constraints-led lesson planner with real-time class pacing budget bar, tag manager, and "AI Black Belt Suggest" integration.
- **`CurriculumHubView.tsx`**: Searchable and filterable curriculum catalog organized by core concept, with collapsible groups and warmup game cards.
- **`FlowChainsView.tsx`**: Flow Chain Architect studio for designing multi-node grappling chains with edit, delete, and mat-launch actions.
- **`CalendarView.tsx`**: Week-by-week calendar with template selector, date anchors, lesson assignment, and persistent class debrief & modification notes.
- **`Navigation.tsx`**: Responsive header with mobile drawer, quick links, music toggle, bell settings trigger, and user profile badge.
- **`SearchableLessonPicker.tsx`**: Search input with quick-filter chips for Age Group and Belt Rank.

### 4. `app/page.tsx`
The primary state coordinator:
- Manages cross-view state: `plans`, `schedule`, `flowLibrary`, `warmUpPresets`, `classTemplates`, `coreConcepts`, `currentInstructor`.
- Manages application-wide dialog modals:
  - Audio & Bell Controls Modal (`isAudioModalOpen`)
  - Class Templates Manager Modal (`isTemplateManagerOpen`)
  - Add / Schedule Class Modal (`isAddClassModalOpen`)
  - Add New Warm-Up Game Modal (`isNewWarmUpModalOpen`)
  - Add New Concept Modal (`isNewConceptModalOpen`)
  - Instructor Authentication Modal (`isLoginModalOpen`)
  - User Roster Edit Modal (`isUserModalOpen`)
- Coordinates hardware screen wake lock (`navigator.wakeLock`) during active rounds.
- Handles AI integrations for lesson building (`/api/generate-lesson`) and consultant chat (`/api/chat-assistant`).
