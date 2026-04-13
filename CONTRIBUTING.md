# Contributing to NEU Student Violation Tracker

## Branch Strategy

- `main` — protected. No direct commits. Merged via PR only.
- `dev` — integration branch. All feature branches merge here first.
- `feature/task-N-short-description` — your working branch per task.

## Workflow

1. Pick up your assigned task from the GitHub Projects board.
2. Create a feature branch from `dev`:
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feature/task-N-description
   ```
3. Work on your changes. Commit often with descriptive messages.
4. Push your branch and open a Pull Request into `dev`.
5. Request a review from at least one other member.
6. Once approved, merge into `dev`.

## Commit Message Format

```
type: short description #issue-number

Examples:
feat: add login screen UI #6
fix: resolve student search autocomplete bug #12
chore: update dependencies
docs: add ADR for Supabase decision
```

Types: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`

## Pull Request Rules

- Every PR must reference its GitHub Issue (e.g., `Closes #6`).
- PR description must include: what changed, why, and how to test it.
- At least one team member must review before merging.
- Do not merge your own PR without a review.

## Prompt Log Requirement

Every member must maintain a `prompt-log.md` in their branch documenting all AI assistance used. See the Group Execution Guidelines for the required format.

## File Structure Conventions

- Screens go in `app/` (Expo Router convention).
- Reusable components go in `src/components/`.
- Supabase queries go in `src/lib/`.
- TypeScript types go in `src/types/`.
