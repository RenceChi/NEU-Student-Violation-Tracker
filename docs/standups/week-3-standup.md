Standup Note — Week 3
Date: April 10, 2026
Facilitator: Clark (Project Manager)
Attendees: Clark, Frinz Hughwie Bautista, Precy S. Baguio, Jacques Carigma, Zyrus Velasco
Next standup: April 17, 2026

## Member Updates

**Clark — Project Manager**
* **Completed:** Scaffolded Sprint 1 board, locked feature scope, and scheduled weekly deliverables.
* **This week:** Post all Sprint 1 GitHub Issues to the board, assign all tickets with names/due dates, set Sprint 1 milestone, label Reports/Appeals as "Sprint 2", confirm Dev has started `feat/auth`, write Decision Log Entry #3, and file Week 3 standup note.
* **Blockers:** None currently; monitoring Dev start.

**Frinz Hughwie Bautista — Full-Stack Dev**
* **Completed:** Scaffolded React Native (Expo) and set up folder structures. 
* **This week:** Configure Supabase Auth, create profiles table with RLS policies, build Login screen and role-based navigation guard on `feat/auth`. Branch to `feat/violation-library` to create tables, seed data, and build Admin CRUD screens. Write ADR #2 for Supabase Auth.
* **Blockers:** Needs finalized colors/typography from UX/UI for the Login screen.

**Precy S. Baguio — UX/UI Designer**
* **Completed:** Low-fidelity wireframes approved.
* **This week:** Set up Figma file with shared color palette and fonts. Agree on primary styles, design HIFI-01 (Login screen), design HIFI-02 (Role dashboards), and coordinate with KM Analyst on SECI flow alignment. 
* **Blockers:** None.

**Jacques Carigma — KM Analyst**
* **Completed:** SECI framework conceptually selected and logged.
* **This week:** Finalize KM Conceptual Report section on SECI mapping. Document how Auth maps to Socialization and Violation Library maps to Combination. Coordinate with UX/UI on screen flows and review Dev's DB schema to confirm it supports KM objectives.
* **Blockers:** None.

**Zyrus Velasco — QA Lead**
* **Completed:** Reviewed Acceptance Criteria for Sprint 1.
* **This week:** Write TC-01 (Auth) test cases including valid login, invalid credentials, and session persistence. Write TC-02 (Violation library) CRUD test cases, including deletion blocks. File bugs as GitHub Issues and assign to Dev.
* **Blockers:** Cannot execute TC-01 until Dev merges `feat/auth`.