**Project:** Student Violation Knowledge Management System

**Team:** Group 3 | Section: 3BSCS-2 | AY: 2025-2026

**Maintained by:** Project Manager

**Rule:** Any decision affecting the whole team's direction, tech, or scope must be logged here.

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
## Entry #2 — Adoption of the SECI Knowledge Management Framework

| Field | Details |
|---|---|
| **Date** | April 10, 2026 |
| **Decision Made** | Adopt the SECI Model (Socialization, Externalization, Combination, Internalization) as the core Knowledge Management framework for the Student Violation Tracker. |
| **Status** | Decided |
| **Who Was Consulted** | All members (Presented by KM Analyst: Jacques Carigma) |

### Context & Problem
To meet the academic requirements of the capstone, the system cannot just be a simple database or administrative log; it must actively manage and generate *knowledge*. We needed a structured academic framework to guide how the app captures tacit knowledge (like a teacher's behavioral observations) and turns it into explicit knowledge (like school-wide analytics).

### Rationale for Decision
Jacques (KM Analyst) evaluated the SECI model and presented it during the Week 1 Standup. The team agreed to adopt it because it perfectly maps to our current feature scope:
* **Externalization:** Submitting detailed violation reports with context.
* **Combination:** Generating dashboards and school policies from explicit records.
* **Internalization:** Allowing users to search and review past histories.
* **Socialization:** Facilitating threaded discussions between teachers/counselors.
* **Crucial Addition:** The team also agreed that Authentication (User Story #7) will act as the foundational security layer that enables safe, role-based participation across all four SECI phases. 

### Impact & Next Steps
* **KM Analyst:** Will expand this framework mapping into the mandatory 4-6 page Conceptual Report with APA citations.
* **UX/UI Designer:** Will explicitly annotate the wireframes to show how specific screens support these SECI phases (e.g., labeling the discussion board as "Socialization").
* **Developer & QA:** Will ensure the role-based authentication is built and tested as a prerequisite to access any of these KM features.
---
