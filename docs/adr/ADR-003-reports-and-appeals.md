# ADR-003 — Reports Dashboard & Appeals Workflow

**Date:** 2025-05-10
**Status:** Decided
**Author:** Full-Stack Developer (prismic7)

---

## Context

Two major features were scoped for Build Phase 2:

1. **Reports Dashboard** — Admins need aggregated visibility into violation trends. The feature must respect the existing role boundary: only `admin` can access reports; officers cannot.

2. **Appeals Workflow** — Students need a structured way to contest violations. Officers and admins need a review interface to respond, approve, or reject. The KM framework requires that appeal decisions and their rationale be recorded and visible — not just verbally communicated.

Both features required decisions around **data fetching strategy**, **role-gating**, and **UI rendering** given React Native / Expo constraints.

---

## Decision 1 — Reports: Client-side aggregation vs. Supabase RPC

### Options Considered

| Option | Description | Trade-offs |
|--------|-------------|-----------|
| **A — Client-side aggregation (chosen)** | Fetch raw rows filtered by date range, compute counts in JS | Simple, no DB migration needed |
| **B — Supabase RPC / DB Functions** | PostgreSQL functions returning pre-aggregated data | Faster at scale, but overkill for current volume |
| **C — Third-party chart library (Victory / Recharts)** | Dedicated charting lib for visualizations | Large dependency; Victory Native has known Expo compatibility issues |

### Decision

**Option A — Client-side aggregation with native bar rendering.**

Current data volume (single school) does not justify server-side aggregation. One Supabase query filtered by `date_of_incident >= sinceStr` returns everything needed; JS reduces it into counts by severity, category, violation type, and month. Bars are rendered as native `View` components with percentage-based widths — no chart library, no extra dependency.

### Consequences

- **Easier:** New breakdown dimensions just need a new reduce pass over the same data.
- **Harder:** Will slow down at thousands of records. Revisit with Supabase RPC at that point.
- **Role gate:** Tab hidden via `href: isAdmin ? undefined : null` in `_layout.tsx`. Export button also gated by `profile.role`.

---

## Decision 2 — Appeals: Separate table vs. embedding in `student_violations`

### Options Considered

| Option | Description | Trade-offs |
|--------|-------------|-----------|
| **A — Separate `appeals` table (chosen)** | FK to `student_violations`, stores reason, explanation, status, officer notes, reviewed_by, reviewed_at | Clean separation; violation record stays immutable |
| **B — Add appeal columns to `student_violations`** | Embed appeal fields directly in the violations table | Simpler schema, but conflates the factual incident record with the appeal process |
| **C — Supabase Edge Function** | Server-side appeal submission with validation | Better for complex rules; unnecessary overhead now |

### Decision

**Option A — Dedicated `appeals` table.**

Keeping appeals as a first-class entity allows both the student (My Appeals tab) and officer (review queue) to query independently. The violation record stays immutable as the factual record of the incident; the appeal is a distinct process on top.

### Consequences

- **Easier:** Student and officer screens query the same table with different filters. Approval auto-updates both the appeal status and the parent violation status (`overturned`) in a two-step write.
- **Harder:** Requires joining across two tables on every render (handled via Supabase nested select).
- **Enforcement gap:** One-appeal-per-violation is currently UI-only (`hasAppeal` flag). A DB-level unique constraint on `(violation_id, student_id)` should be added in a future migration.

---

## Decision 3 — Appeals Status Flow

### Options Considered

| Option | Description |
|--------|-------------|
| **A — pending → under_review → approved / rejected (chosen)** | Officers must acknowledge before deciding |
| **B — pending → approved / rejected directly** | Officers can decide immediately, skipping intermediate state |

### Decision

**Option A — Linear flow with `under_review` intermediate state.**

The `under_review` status signals to the student that their appeal has been seen and is being actively considered — directly reducing uncertainty. The student-facing `ProgressStep` component maps each status to a visual timeline step, implementing the KM principle of transparent, externalized knowledge. "Mark Under Review" is shown only on `pending` appeals; "Approve" and "Reject" are always available to allow fast-tracking.

### Consequences

- Approved appeals auto-update the parent violation to `overturned`, propagating immediately to the student's Violations tab.
- Rejected appeals leave the violation status as `appealed`, preserving the original record.

---

## Summary

| Decision | Chosen | Reason |
|----------|--------|--------|
| Reports aggregation | Client-side JS reduce | Current scale; simpler than server-side SQL |
| Reports visualization | Native `View` bars | No chart lib; avoids Expo compatibility issues |
| Appeals storage | Separate `appeals` table | Clean separation of violation record vs. appeal |
| Appeals status flow | Linear with `under_review` | Student transparency; KM visibility principle |

---

## References

- `app/(officer)/report.tsx`
- `app/(officer)/appeals.tsx`
- `app/(student)/appeals.tsx`
- `components/SubmitAppealModal.tsx`
- `User_Roles_and_Rights.txt` — role access matrix