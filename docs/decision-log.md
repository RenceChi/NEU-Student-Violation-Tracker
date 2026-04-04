> **Project:** Student Violation Knowledge Management System
> **Team:** Group 3 | Section: 3BSCS-2 | AY: 2025-2026
> **Maintained by:** Project Manager
> **Rule:** Any decision affecting the whole team's direction, tech, or scope must be logged here.

---

## Entry #1 — Tech Stack Selection

| Field | Details |
|---|---|
| **Date** | 04/01/2026] |
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
