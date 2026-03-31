# Architecture Decision Records

This folder contains all Architecture Decision Records (ADRs) for the NEU Student Violation Tracker.

An ADR documents a significant technical decision — what was chosen, why, and what the consequences are. These are required deliverables for the Full-Stack Developer role.

---

## ADR Index

| # | Title | Status | Date |
|---|---|---|---|
| 001 | Tech Stack Selection | Decided | 2026-03-31 |
| 002 | _(next decision)_ | — | — |

---

## ADR Template

Copy this block for each new decision:

```
---
## ADR-XXX: [Short Title]

**Date:** YYYY-MM-DD
**Status:** Decided / Revisited / Superseded

### Context
What problem were you solving? What constraints or requirements drove this decision?

### Options Considered
1. Option A — brief description
2. Option B — brief description
3. Option C — brief description

### Decision
What you chose and the primary reason why.

### Consequences
**Easier:** What does this decision make easier?
**Harder:** What does this decision make harder or introduce as a tradeoff?
---
```

---

## ADR-001: Tech Stack Selection

**Date:** 2026-03-31
**Status:** Decided

### Context
The team needed to select a tech stack for a cross-platform mobile app that digitizes the NEU student violation form. The app needs to support two user roles (Officer and Student), work on both iOS and Android, connect to a backend with authentication and a database, and be buildable by a small team within an 8-week sprint.

### Options Considered
1. **React Native (Expo) + Supabase** — managed React Native toolchain with a BaaS (Backend as a Service) for auth and database.
2. **Flutter + Firebase** — Google's cross-platform framework with Firebase as the backend.
3. **React Native CLI + custom Node.js backend** — bare React Native with a manually built Express/Node backend and PostgreSQL.

### Decision
Chose **React Native (Expo) SDK 54 + Supabase** with the following supporting libraries:
- **Expo Router** for file-based navigation (reduces boilerplate, integrates with React Navigation)
- **NativeWind v4** for Tailwind CSS-style utility class styling in React Native
- **TypeScript** for type safety across the codebase

Primary reasons:
- Expo simplifies iOS/Android builds without needing Xcode/Android Studio for development.
- Supabase provides Auth, PostgreSQL database, and real-time subscriptions in one platform with a generous free tier.
- The team has prior exposure to React, reducing the learning curve.
- Expo Router's file-based routing matches the team's web development mental model.

### Consequences
**Easier:**
- Cross-platform development from a single codebase.
- Supabase handles auth, row-level security, and DB migrations — no need to build a backend from scratch.
- NativeWind allows designers familiar with Tailwind to read and contribute to styling.
- Expo Go enables instant device testing without native builds.

**Harder:**
- NativeWind v4 has known compatibility issues with certain Expo SDK versions — required careful version pinning.
- Expo managed workflow limits some native module access (acceptable for this project's scope).
- Supabase free tier has usage limits that may require upgrading for production.

---

## ADR-002: _(Reserve for next major decision)_

**Date:** —
**Status:** —

_Fill in when the next architectural decision is made (e.g., state management approach, offline support strategy, deployment platform)._
