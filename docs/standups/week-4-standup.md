Standup Note — Week 4
Date: April 17, 2026
Facilitator: Clark (Project Manager)
Attendees: Clark, Frinz Hughwie Bautista, Precy S. Baguio, Jacques Carigma, Zyrus Velasco
Next standup: April 24, 2026

## Member Updates

**Clark — Project Manager**
* **Completed:** Assigned Week 3 tickets and confirmed Dev foundations.
* **This week:** Review and approve `feat/auth` and `feat/violation-library` PRs. Conduct mid-week check-in with UX/UI for 3 hi-fi screens, check QA has started TC-01, move board cards from In Progress to In Review, file Week 4 standup, and write Decision Log Entry #4 if scope changes arise.
* **Blockers:** None.

**Frinz Hughwie Bautista — Full-Stack Dev**
* **Completed:** Auth foundation and Violation Library setup.
* **This week:** Branch to `feat/violation-record` to build the officer violation form with validation and auto-severity logic. Branch to `feat/violation-history` to build the reverse-chronological history screen with filters and RLS. Begin `feat/sanctions` table schema setup.
* **Blockers:** Waiting on HIFI-04 and HIFI-05 designs.

**Precy S. Baguio — UX/UI Designer**
* **Completed:** Figma library initialized; Login and Dashboard screens designed.
* **This week:** Design HIFI-03 (Violation library), HIFI-04 (Record violation form), HIFI-05 (Violation history), and HIFI-06 (Assign sanctions). Post Figma view-only link in GitHub and export all screens as PNG to docs.
* **Blockers:** None.

**Jacques Carigma — KM Analyst**
* **Completed:** Mapped Socialization and Combination phases for Week 3 features.
* **This week:** Document Record Violation (Externalization) and View History (Combination) rationales. Write KM narratives for user story files, review the violation form design to ensure knowledge capture, and update the prompt log.
* **Blockers:** None.

**Zyrus Velasco — QA Lead**
* **Completed:** Executed Auth and Library test cases and filed initial bugs.
* **This week:** Write TC-03 (Record violation) and test student blocks, required fields, and auto-severity. Write TC-04 (View history) and test RLS logic and filters with real seeded data. File any new bugs found.
* **Blockers:** Cannot test TC-03 until `feat/violation-record` is merged.