# Decision Log

> **Project:** Student Violation Knowledge Management System
> **Team:** Group 3 | Section: 3BSCS-2 | AY: 2025-2026
> **Maintained by:** Project Manager (RenceChi)
> **Rule:** Any decision affecting the whole team's direction, tech, or scope must be logged here.

---

## Entry #1 — Tech Stack Selection

| Field | Details |
|---|---|
| **Date** | 04/01/2026 |
| **Decision Made** | Use React Native (Expo) + Supabase as the full application stack |
| **Status** | Decided |
| **Who Was Consulted** | All 5 members (confirmed at kickoff) |

### Context
We are building a cross-platform mobile KMS for the university's
disciplinary process. The system must run on both iOS and Android,
connect to a real-time database, and be deployable within an 8-week
academic timeline with a 5-person team that includes non-specialist
members.

### Options Considered

| Option | Pros | Cons |
|---|---|---|
| **React Native + Expo (chosen)** | Single codebase for iOS & Android; Expo simplifies build/deploy; large community; familiar JS syntax for the team | Requires learning Expo-specific APIs |
| React Native (bare workflow) | Full native control | Complex setup; no Expo Go for rapid testing |
| Flutter + Firebase | Strong UI toolkit | Team has zero Dart experience; steeper learning curve for 8-week timeline |

### Decision
We selected **React Native with Expo** for the frontend and **Supabase**
for the backend/database/auth.

**Rationale (KM-aligned):** Supabase's PostgreSQL database and Row Level
Security (RLS) directly supports the KMS requirement for structured
knowledge storage with role-based access. Officers, admins, and students
each require different views of the same violation data — this maps
cleanly to the SECI model's principle of controlled knowledge
dissemination. Expo's cross-platform capability ensures field officers
can access the system on any device, supporting the Externalization
phase of SECI (capturing tacit knowledge in the field).

### Consequences
- **Easier:** Rapid prototyping via Expo Go; built-in Supabase Auth
  removes need to build login from scratch; real-time subscriptions
  available for live violation updates.
- **Harder:** Team must learn Supabase's RLS policy syntax; Expo managed
  workflow has limitations for certain native modules if needed later.

---

## Entry #2 — KM Framework Selection (SECI Model)

| Field | Details |
|---|---|
| **Date** | 04/08/2026 |
| **Decision Made** | Adopt the SECI Model as the official KM framework for the project |
| **Status** | Decided |
| **Who Was Consulted** | All 5 members (presented by KM Analyst Jax-rgb at Week 1 standup) |

### Context
The project is evaluated as a Knowledge Management System, not just a
CRUD application. The team needed to select a formal KM framework to
justify design decisions, guide feature development, and satisfy the
academic rubric's KM Conceptual Report requirement. The KM Analyst
(Jax-rgb) was tasked during the Discovery Phase to research and
recommend a framework.

### Options Considered

| Option | Fit for This Project | Decision |
|---|---|---|
| **SECI Model — Nonaka & Takeuchi (chosen)** | Directly maps to the violation system's knowledge flow: officers capture tacit knowledge (Externalization), it is stored and combined (Combination), shared with stakeholders (Socialization), and applied to future cases (Internalization) | ✅ Selected |
| Cynefin Framework | Better suited for decision-making under complexity; less applicable to structured data capture | ❌ Not selected |
| Bloom's Taxonomy | Educational framework; not designed for organizational knowledge management systems | ❌ Not selected |

### Decision
We adopted the **SECI Model** as the KM framework for the Student
Violation Knowledge Management System.

**Rationale:** The SECI model's four phases map directly to our
system's features and user roles:

| SECI Phase | System Feature | Role |
|---|---|---|
| Socialization | Authentication & Appeal Process | All roles — establishes who shares knowledge with whom |
| Externalization | Record Student Violation | Discipline Officer — converts tacit judgment into a structured record |
| Combination | Violation Library, View History, Generate Reports | Admin — aggregates and codifies institutional knowledge |
| Internalization | Assign Sanctions | Officer / Admin — applies policy knowledge to a real case |

### Consequences
- **Easier:** Every feature now has a documented KM justification that
  satisfies the academic rubric. The KM Analyst has a clear structure
  for the Conceptual Report.
- **Harder:** The team must ensure the app's design reflects SECI
  principles — not just functionally but in the user experience. The
  UX/UI Designer must coordinate with the KM Analyst before finalizing
  screen layouts.

---

## Entry #3 — Build Sprint 1 Scope Confirmation

| Field | Details |
|---|---|
| **Date** | 04/15/2026 |
| **Decision Made** | Confirm feature scope, build order, story points, and branch assignments for Build Sprint 1 (Weeks 3–5) |
| **Status** | Decided |
| **Who Was Consulted** | All 5 members (confirmed at Week 3 kickoff standup) |

### Context
The team completed the Kickoff and Discovery phases (Weeks 1–2),
including repository scaffolding, SECI framework confirmation,
lo-fi wireframes for the 3 HIGH-priority screens, and initial user
story documentation. Six user stories were drafted during the
pre-academic Agile phase:

| User Story | Original Priority | Story Points |
|---|---|---|
| Record Student Violation | HIGH | 8 pts |
| View Student Violation History | MEDIUM | 5 pts |
| Generate Violation Reports | LOW | 6 pts |
| Assign Sanctions / Penalties | MEDIUM | 7 pts |
| Manage Violation Types & Sanctions Library | HIGH | 8 pts |
| Student Violation Appeal Process | LOW | 6 pts |

Before coding began, the team identified a critical gap:
**Authentication was not included in any of the original user
stories** but is a required technical dependency for every other
feature. Without knowing who is logged in, the system cannot
enforce role-based access for any screen, cannot auto-record
which officer filed a violation, and cannot apply RLS policies
to protect student data. The team formally decided to add
Authentication as Feature 1 of Sprint 1 and to defer the two
LOW-priority features to Sprint 2.

---

### Decision 3.1 — Add Authentication as Sprint 1 Feature 1

| Option | Outcome |
|---|---|
| **Add auth to Sprint 1 (chosen)** | All features have working role gates from day one. No rework required later. |
| Build auth in a later sprint | Every feature built before auth has no role protection and requires rewriting. |

**Decision:** Authentication & Role-Based Access was added as
Feature 1 of Build Sprint 1 with an estimated **~5 story points**.

**KM Rationale (SECI — Socialization):** Authentication establishes
the trust boundary for the entire KMS. The SECI model's Socialization
phase requires that knowledge sharing occurs within defined, trusted
relationships. Without role-based access, the system cannot enforce
who captures knowledge (Officers via Externalization), who manages
the knowledge base (Admins via Combination), or who receives
knowledge (Students in read-only mode). Auth is therefore not just
a technical requirement — it is the structural foundation of the
system's KM architecture.

---

### Decision 3.2 — Confirm Sprint 1 Build Order

The following sequential build order was locked based on hard
database and functional dependencies between features:

| Order | Feature | Story Points | Priority | SECI Phase | Branch |
|---|---|---|---|---|---|
| 1 | Authentication & role-based access | ~5 pts | New | Socialization | `feat/auth` |
| 2 | Manage violation types & sanctions library | 8 pts | HIGH | Combination | `feat/violation-library` |
| 3 | Record student violation | 8 pts | HIGH | Externalization | `feat/violation-record` |
| 4 | View student violation history | 5 pts | MEDIUM | Combination | `feat/violation-history` |
| 5 | Assign sanctions / penalties | 7 pts | MEDIUM | Internalization | `feat/sanctions` |

**Total Sprint 1 Story Points: ~33 pts across Weeks 3–5**

**Why this exact order:**

- **Feature 2 needs Feature 1:** The violation library is an
  Admin-only screen. The role-based navigation guard (built in
  auth) must exist before any role-gated screen can render.

- **Feature 3 needs Features 1 + 2:** The Record Violation form
  needs a logged-in officer's ID (from auth) to auto-record who
  filed the case, and needs a populated `violation_types` dropdown
  (from the library) to select a violation type. If either is
  missing, the form cannot be submitted.

- **Feature 4 needs Features 1 + 3:** The violation history screen
  needs real violation records in the database to display, and needs
  RLS (set up in auth) to enforce that students only see their
  own records.

- **Feature 5 needs Features 2 + 3:** Sanctions are assigned to
  existing recorded violations and drawn from the sanctions library.
  Both must be fully built and seeded before sanctions can be tested.

---

### Decision 3.3 — Defer Two Features to Build Sprint 2

| Feature | User Story | Story Points | Reason for Deferral |
|---|---|---|---|
| Generate violation reports | US-06 | 6 pts | Requires real, populated violation data in the database. Testing against empty Sprint 1 tables produces no meaningful results. Building during Sprint 1 also risks Sprint 1 schema changes breaking report queries mid-build. |
| Student violation appeal process | US-07 | 6 pts | Depends on both violations (US-03) and sanctions (US-05) being fully stable. Half-built appeal logic committed to `dev` risks breaking Sprint 1 integration testing in Week 5. |

**Total deferred story points: 12 pts (Build Sprint 2, Weeks 5–6)**

These tickets are labeled **"Sprint 2 — Do Not Start"** on the
GitHub Projects board and assigned to the Sprint 2 milestone.
No team member may begin work on these features until the PM
confirms the Sprint 1 end-of-Week-5 gate is closed.

---

### Decision 3.4 — Member Branch and Role Assignments

| Member | GitHub | Branch(es) | Sprint 1 Deliverable |
|---|---|---|---|
| RenceChi | PM | `docs/pm`, `docs/standups`, `docs/decision-log` | Sprint board management, PR approvals, standup notes weeks 3–5, Decision Log entries |
| prismic7 | Dev | `feat/auth` → `feat/violation-library` → `feat/violation-record` → `feat/violation-history` → `feat/sanctions` | All 5 feature branches; one PR per feature to `dev` |
| Jax-rgb | KM Analyst | `docs/km-sprint1` | SECI rationale per feature, KM narrative in each US file, KM Conceptual Report draft |
| pwecii | UX/UI | `docs/wireframes-hifi` | Hi-fi wireframes for all 6 Sprint 1 screens; Figma view-only link posted in issue |
| ZyCallado | QA Lead | `docs/qa-sprint1` | Test cases TC-01 through TC-05; Sprint 1 QA summary report |

---

### Sprint 1 Gate Summary

The PM (RenceChi) enforces the following gates at standup. If a
gate is not met, the blocker must be escalated the same day.

| Gate | Pass Condition | Owner |
|---|---|---|
| End of Week 3 | `feat/auth` and `feat/violation-library` PRs raised. Dev demos all 3 role logins live in Expo Go. Seed data confirmed in `violation_types` (min. 5 types). | RenceChi |
| Mid Week 4 | UX/UI has Login + Record Violation hi-fi screens done. Dev has started `feat/violation-record`. QA has TC-01 written and filed. | RenceChi |
| End of Week 5 | All 5 feature PRs merged to `dev`. No open critical bugs. All 5 members have 3+ commits. All board cards marked Done. `dev` branch is stable. | RenceChi |

### Consequences

**Easier because of this decision:**
- prismic7 has an unambiguous, dependency-ordered build sequence.
- ZyCallado tests each feature as it lands — not everything in Week 5.
- RenceChi has concrete gate conditions to enforce, not just
  general "how's it going" standup check-ins.
- Every build decision maps to a SECI phase, satisfying the
  academic KM justification requirement.

**Harder because of this decision:**
- 33 story points in 3 weeks is a heavy load for one developer.
  If auth runs over in Week 3, it cascades into every feature.
  PM must do mid-week check-ins during Week 3, not just standup.
- The `violation_types` table must be seeded before Feature 3
  can be built or tested. This is a Definition of Done item on
  the library ticket and a QA verification checkpoint at the
  Week 3 gate — not optional.

---

## Entry #4 — Sprint 1 Close & Build Sprint 2 Activation
 
| Field | Details |
|---|---|
| **Date** | 05/08/2026 |
| **Decision Made** | Formally close Build Sprint 1, acknowledge two pending deliverables as in-progress, and activate Build Sprint 2 (Weeks 5–6) |
| **Status** | Decided |
| **Who Was Consulted** | All 5 members (confirmed at Week 5 standup) |
 
### Context
Build Sprint 1 covered Weeks 3–5 and targeted 5 features across
33 story points. By the end of Week 5, all 5 feature branches had
been developed and the core application functionality was
substantially complete. Two deliverables were still in progress
at the time of this entry:
 
| Deliverable | Owner | Status |
|---|---|---|
| TC-01 through TC-05 — Sprint 1 test cases + QA summary report | ZyCallado | In progress — expected same day |
| KM Conceptual Report — full SECI framework documentation | Jax-rgb | In progress — expected same day |
 
The team made the formal decision to proceed with closing Sprint 1
and activating Sprint 2 rather than holding the entire sprint open
for two documentation deliverables that do not block any Sprint 2
development work. Both deliverables are expected to be committed
to the `dev` branch the same day as this entry.
 
---
 
### Decision 4.1 — Formally Close Build Sprint 1
 
**Sprint 1 completion status at close:**
 
| Feature | Branch | Status |
|---|---|---|
| Authentication & role-based access | `feat/auth` | ✅ Merged to `dev` |
| Manage violation types & sanctions library | `feat/violation-library` | ✅ Merged to `dev` |
| Record student violation | `feat/violation-record` | ✅ Merged to `dev` |
| View student violation history | `feat/violation-history` | ✅ Merged to `dev` |
| Assign sanctions / penalties | `feat/sanctions` | ✅ Merged to `dev` |
| Hi-fi wireframes — all 6 Sprint 1 screens | `docs/wireframes-hifi` | ✅ Committed (pwecii) |
| SECI rationale — Sprint 1 features | `docs/km-sprint1` | ✅ Committed (Jax-rgb) |
| KM Conceptual Report | `docs/km-sprint1` | 🔄 In progress — due today |
| Test cases TC-01 to TC-05 + QA report | `docs/qa-sprint1` | 🔄 In progress — due today |
 
**Notable discoveries during Sprint 1 development:**
 
1. **"Save Draft" feature added to Record Violation screen** — The
   UX/UI Designer (pwecii) included a Save Draft button on the
   Record Violation screen (visible in the hi-fi wireframes) which
   was not in the original US-03 acceptance criteria. The Dev
   (prismic7) implemented this. The PM has flagged this for
   ZyCallado to add a test case (TC-03 addendum) and for the
   user story file US-03 to be updated with this AC.
2. **"Submit Appeal" button visible in Sprint 1 UI** — The
   Violation Details screen (hi-fi wireframe Image 9) already
   renders a Submit Appeal button, which is a Sprint 2 feature
   (US-07). The decision was made to render this button in a
   disabled / "coming soon" state during Sprint 1 to avoid QA
   flagging it as a broken feature before Sprint 2 builds it.
3. **Audit trail and Case Progression timeline implemented** —
   The library screens show a "Last edited by [name]" audit trail
   and the Violation Details screen shows a Case Progression
   timeline (Incident Reported → Investigation Started →
   Sanction Proposed). These were not explicitly in the original
   user stories but are strong KM artifacts. Jax-rgb has been
   asked to document both in the KM Conceptual Report as
   evidence of knowledge governance (Combination phase).
---
 
### Decision 4.2 — Activate Build Sprint 2
 
**Decision:** Build Sprint 2 is formally activated effective
today (05/08/2026) covering Weeks 5–6.
 
| Feature | User Story | Story Points | SECI Phase | Branch |
|---|---|---|---|---|
| Generate violation reports | US-06 | 6 pts | Combination → Externalization | `feat/reports` |
| Student violation appeal process | US-07 | 6 pts | Socialization | `feat/appeals` |
 
**Total Sprint 2 Story Points: 12 pts**
 
The "Sprint 2 — Do Not Start" labels have been removed from
tickets US-06 and US-07 on the GitHub Projects board. Both
tickets have been moved into the Sprint 2 milestone and assigned
to prismic7 for development.
 
**Build order for Sprint 2:**
Reports (US-06) must be completed and its PR merged before
Appeals (US-07) begins. This keeps QA testing sequential and
prevents two unfinished features from conflicting on the `dev`
branch simultaneously.
 
---
 
### Decision 4.3 — Sprint 2 Member Assignments
 
| Member | GitHub | Sprint 2 Branch(es) | Deliverable |
|---|---|---|---|
| RenceChi | PM | `docs/decision-log`, `docs/standups` | Sprint 2 board management, PR approvals (feat/reports + feat/appeals), standup notes weeks 5–6, Decision Log entries #5–7 |
| prismic7 | Dev | `feat/reports`, `feat/appeals` | Build Reports feature then Appeals feature sequentially |
| Jax-rgb | KM Analyst | `docs/km-sprint2` | SECI rationale for US-06 + US-07, complete final KM Conceptual Report |
| pwecii | UX/UI | `docs/wireframes-hifi` | Design HIFI-07 (Reports), HIFI-08 (Appeal form), HIFI-09 (Officer review screen) |
| ZyCallado | QA Lead | `docs/qa-sprint2` | TC-06 (Reports), TC-07 (Appeals), full end-to-end regression all 7 features, final project QA report |
 
---
 
### Decision 4.4 — Feature Freeze Date Confirmed
 
The feature freeze is scheduled for the **end of Week 6**. After
that date, no new features or schema changes may be committed to
`dev`. Week 7 is Polish Week (bug fixes + UI cleanup only) and
Week 8 is Deployment + Oral Defense.
 
Any feature not merged to `dev` by end of Week 6 is considered
out of scope for the final submission and will be documented as
a known limitation in the project's README and oral defense.
 
---
 
### Sprint 2 Gate Summary
 
| Gate | Pass Condition | Owner |
|---|---|---|
| Start of Week 5 | All Sprint 1 documentation PRs (KM Report + QA report) committed. Sprint 2 milestone activated on board. | RenceChi |
| End of Week 5 | `feat/reports` PR raised and under QA review. HIFI-07 to HIFI-09 exported by pwecii. TC-06 written by ZyCallado. | RenceChi |
| End of Week 6 | All 7 features merged to `dev`. Full regression complete. All 9 hi-fi screens committed. KM Conceptual Report finalized. Feature freeze declared. | RenceChi |
 
### Consequences
 
**Easier because of this decision:**
- Closing Sprint 1 now despite two in-progress docs keeps the
  team's momentum and does not block prismic7 from starting
  Sprint 2 development immediately.
- The two in-progress deliverables (KM Report + QA report) are
  documentation only — they do not affect the stability of the
  `dev` branch or Sprint 2 code.
- Sprint 2 scope is small (12 pts, 2 features) which gives the
  team enough runway to also complete Polish Week and prepare
  for oral defense within the remaining timeline.
**Harder because of this decision:**
- ZyCallado carries the heaviest Sprint 2 workload: TC-06,
  TC-07, full 7-feature regression, and the final project QA
  report — all within 2 weeks. PM must check in mid-Week 6,
  not just at standup.
- The "Save Draft" addition to US-03 and the Sprint 2 Appeal
  button visible in Sprint 1 UI both need immediate follow-up
  actions from ZyCallado (test cases) and the Dev (disabled
  state) before Sprint 2 testing begins.

---

## Entry #5 — *(Reserved — Sprint 2 Close)*

> To be filed at the end of Week 6 when all 7 features are
> merged and the feature freeze is declared.

---

## Entry #6 — *(Reserved — Feature Freeze / Polish Week)*

> To be filed at the start of Week 7.

---

## Entry #7 — *(Reserved — Deployment)*

> To be filed at the end of Week 8 after final merge to `main`
> and oral defense completion.