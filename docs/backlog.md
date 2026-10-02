# SubCadence Product Backlog

## 1. Completed (Active in Current Build)
* **Mat Timer & Screen Engine:** Dual-interval timer with audio ducking, screen wake lock, and distance-optimized HUD.
* **Music Deck:** Local file playlist manager with smooth 2.2s audio ducking during bells.
* **Responsive Shell:** Collapsible navigation and adaptive vertical stacking.
* **Lesson Plan Builder:** Dynamic pacing budget calculator against class duration targets, structured constraint inputs.
* **Curriculum Hub:** Pre-baked 6-month taxonomy, searchable lesson library, inline lineage categories.
* **Tactical Flow Studio:** Node-by-node sequence builder linking technique states, reactions, and cues.
* **Academy Calendar:** Date-anchored schedule view, searchable lesson combobox, persistent debrief notes.
* **Remote Persistence:** Basic Supabase synchronization for public lessons, flows, schedules, and warm-ups.

---

## 2. High Priority (Immediate Next Sprints)
**Supabase Authentication & Session Management**
* *Story:* As an academy owner, I need to log in securely so my data is protected.
* *Acceptance:* Hardcoded credentials removed. `supabase.auth.signInWithPassword()` implemented. Unauthenticated routes redirect to login.

**Dynamic Multi-Tenant Isolation**
* *Story:* As a SaaS provider, I need strict tenant boundaries so gym owners only see their own data.
* *Acceptance:* Remove hardcoded fallback academy ID. All Supabase queries tie to the active user's `academy_id`. Row-Level Security (RLS) policies enforce strict separation.

**Direct AI Action Dispatch in Chat**
* *Story:* As an instructor, I want the AI to automatically populate lesson plans based on our chat.
* *Acceptance:* App consumes `CREATE_CONCEPT` and `POPULATE_LESSON` payloads from `/api/chat-assistant` for one-tap UI insertion.

---

## 3. Medium-High Priority (Member Management & Mat Operations)
**Active Student Roster & Demographics**
* *Story:* As a gym manager, I need a directory of active students to manage contact and demographic info.
* *Acceptance:* Student table created. UI supports search, emergency contacts, and medical/waiver flags.

**Family Groups Management**
* *Story:* As a parent, I need my kids' accounts linked to mine for shared billing and contact management.
* *Acceptance:* Family unit view implemented linking parent/guardian accounts to children.

**Attendance Tracker**
* *Story:* As an instructor, I need to check students into class rapidly.
* *Acceptance:* Quick check-in interface linked to calendar slots. Attendance history logs per student.

**Belt & Stripe Promotion Tracker**
* *Story:* As a head coach, I need to know who is eligible for promotion based on mat time.
* *Acceptance:* Rank progression logging by program (Kids, Gi, No-Gi). Dashboard flags students hitting minimum time-in-grade and attendance thresholds.

---

## 4. Medium Priority (Billing, Subscriptions & Tiers)
**SubCadence Subscription Tiers & Feature Gating**
* *Story:* As the platform owner, I need to restrict features based on the academy's payment plan.
* *Acceptance:* Middleware tier-checking implemented:
  1. *Free Tier:* Standalone Mat Timer and core movements.
  2. *Lesson Planner Tier:* Lesson Builder, Custom Drills, Tactical Flow Studio.
  3. *Calendar Tier:* Academy Schedule, Class Templates, Pacing Engine.
  4. *Student Profile Tier:* Roster, Family Groups, Attendance, Promotions.
  5. *Full Gym Running Tier:* Complete suite including student billing integration.

**Student Accounts & Payment Processing (Full Gym Tier)**
* *Story:* As a gym owner, I need to bill my students automatically via credit card or ACH.
* *Acceptance:* Stripe Connect integration. Member portal for self-serve payment details. Display active plans, recurring dates, and overdue statuses on student profiles.

---

## 5. Low Priority (Post-Beta & Hardening)
**Full Self-Serve Academy Onboarding**
* *Story:* As a new customer, I want to sign up and provision my academy without manual intervention.
* *Acceptance:* Public registration workflow provisions tenant record and allows instructor invites.

**Offline PWA Service Worker (`sw.js`)**
* *Story:* As an instructor with bad gym Wi-Fi, I need the timer and day's schedule to work offline.
* *Acceptance:* App shell, static assets, and local storage cached for offline functionality.

**Mat Timer Keyboard Shortcuts & iOS Audio Tuning**
* *Story:* As a coach, I need physical hotkeys to manage the timer from a distance.
* *Acceptance:* Global hotkeys (`Space`, `R`, `S`, arrows) mapped. `navigator.audioSession.type = "ambient"` implemented for iOS background audio compliance.