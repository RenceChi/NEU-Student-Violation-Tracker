# Standup Note — Week 1

**Date:** April 4, 2026
**Facilitator:** Clark Lawrence T. Ching (Project Manager)
**Attendees:** Clark Lawrence T. Ching, Frinz Hughwie Bautista, Precy S. Baguio, Jacques Carigma, Zyrus C. Velasco
**Next standup:** [Insert Date of Week 2 standup]

---

## Member Updates

### Clark Lawrence T. Ching— Project Manager
- **Completed:** Created repo, assigned roles, sent kickoff message, and set branch protection rules. Reviewed initial PRs for KM Analyst and UX/UI Designer.
- **This week:** Finalize Decision Log Entry #1 and #2. Help resolve QA's blocker regarding missing user stories. Monitor branch creation and prompt logs for all members.
- **Blockers:** None

### Frinz Hughwie Bautista — Full-Stack Dev
- **Completed:** Scaffolded React Native (Expo) project, installed and configured React Navigation, and set up the core folder structure (`app/navigation`, `screens`, `context`, `lib`).
- **This week:** - #9 Initialize Expo (React Native) & connect Supabase
  - #10 Set up repo folders (`/src`, `/tests`) & root docs
  - #11 Write ADR #1 (React Native + Supabase stack)
  - #12 Open Draft PR for Repo Scaffold to the `dev` branch
- **Blockers:** NativeWind v4 metro config has a known Windows/Node 24 incompatibility. Downgraded to Node 20, but still actively resolving the issue.

### Precy S. Baguio — UX/UI Designer (Frontend)
- **Completed:** Created initial low-fidelity mobile wireframes for 5 screens (Login, Main Dashboard, Record Student Violation, View Violation History, and Manage Violation Types & Sanctions Library). Initialized `prompt-log.md` in `/docs/wireframes/` and opened a PR.
- **This week:** Finalize the wireframes and ensure KM annotations are included.
- **Blockers:** Waiting for the KM Analyst to define and confirm the final KM flows before wireframes can be officially signed off.

### Jacques Carigma — KM Analyst
- **Completed:** Finished tasks 13-16. Updated the SECI model mapping to include Authentication as User Story #7. Drafted `km-conceptual-report.md` and initialized `prompt-log.md`.
- **This week:** Finalize `km-conceptual-report.md` (expand to 4-6 pages, add APA citations, update table features) based on PM feedback. Proceed with next KM tasks.
- **Blockers:** None

### Zyrus C. Velasco — QA & Docs Lead
- **Completed:** Set up the `docs/` folder structure.
- **This week:** Review Acceptance Criteria (AC) for the current sprint.
- **Blockers:** Missing/incomplete user stories. Cannot finish AC review until the final user stories are fully documented.

---

## Team Decisions Made This Standup

| # | Decision | Owner |
|---|---|---|
| 1 | Approved React Native (Expo) + Supabase as the core tech stack (ADR #1 incoming). | Frinz (Dev) |
| 2 | Confirmed SECI as the KM framework. Authentication will be treated as the foundational cross-cutting layer enabling SECI. | Jacques (KM) |
| 3 | Prompt logs will be saved in specific sub-folders to prevent GitHub merge conflicts. | PM & QA |

---

## Open Blockers / Action Items

| Item | Assigned To | Due |
|---|---|---|
| **Resolve UI Blocker:** Finalize KM flows so Precy can finish the wireframe annotations. | Jacques & Precy | April 5,2026 |
| **Resolve QA Blocker:** Finalize and document the official User Stories so Zyrus can write Acceptance Criteria and Test Cases. | PM & Zyrus | April 5, 2026 |
| **Resolve Dev Blocker:** Fix NativeWind Metro config issue to unblock the main Repo PR. | Frinz | April 8, 2026 |
| All members must ensure their `prompt-log.md` is committed to their respective branch. | Everyone | April 5, 2026 |

---

## GitHub Health Check (PM fills this out)

- [✓] All 5 members have created their feature branch
- [✓] All 5 members have at least 1 commit this week
- [✓] GitHub Projects board updated with Week 1 tasks
- [✓] No direct commits to `main` or `dev`