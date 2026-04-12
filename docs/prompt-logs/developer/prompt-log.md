# Prompt Log — prismic7 (Full-Stack Developer)

This log documents all AI assistance used during the project, per the Group Execution Guidelines requirement.

Each entry includes: the task, the prompt given, what the AI produced, what I changed and why, and what I learned.

---

## Entry Format

```
### Entry #N — YYYY-MM-DD
**Task:** Task name and issue number
**Prompt Given:** The exact prompt or a close summary of what I asked.
**AI Output:** What the AI generated (summary, not full paste).
**What I Changed:** What I accepted, rejected, or modified — and why.
**What I Learned / Decided:** Key takeaway or decision made as a result.
```

---

## Entry #1 — 2026-03-31

**Task:** Task #1 — Scaffold React Native project (Expo) & React Navigation

**Prompt Given:**
Asked AI to help scaffold a React Native Expo project with the following tech stack: Expo SDK 54, Expo Router, React Navigation, Supabase, NativeWind (Tailwind for RN), TypeScript. Provided the sprint board screenshot showing my assigned tasks.

**AI Output:**
- Generated `package.json` with all dependencies pinned to specific versions.
- Generated config files: `babel.config.js`, `metro.config.js`, `tailwind.config.js`, `tsconfig.json`, `app.json`.
- Generated folder structure: `app/`, `app/(officer)/`, `app/(student)/`, `src/lib/`, `src/context/`, etc.
- Generated placeholder screens: `app/_layout.tsx`, `app/index.tsx`, `app/login.tsx`, `app/(officer)/dashboard.tsx`.
- Generated `src/lib/supabase.ts` Supabase client singleton.

**What I Changed:**
- The initial `package.json` targeted Expo SDK 51 but `create-expo-app` had already scaffolded SDK 54 — had to reconcile version mismatches manually.
- NativeWind v2 was initially suggested but was incompatible with the PostCSS version bundled with Expo SDK 54. Tried multiple version combinations before landing on NativeWind v4 + Tailwind v3.4.3 with `react-native-reanimated` removed (not needed for scaffold).
- The project was initially inside OneDrive which caused file-locking errors (`EPERM`, `UNKNOWN: unknown error, read`). Moved the project to `C:\dev\` to resolve.
- Removed `global.css` import from `_layout.tsx` during debugging, then restored it once NativeWind was confirmed working.
- `App.tsx` and root `index.ts` were deleted since Expo Router uses `"main": "expo-router/entry"` as the entry point — keeping them caused the app to load the default template instead of our router.

**What I Learned / Decided:**
- Expo SDK 54 has stricter peer dependency requirements. Always use `--legacy-peer-deps` for this project.
- `node_modules` should never be inside OneDrive — causes file lock errors and slow installs. All future team members should clone to a local path (e.g., `C:\dev\`).
- NativeWind v4 requires `react-native-reanimated` but `babel-preset-expo` automatically loads it, which in turn requires `react-native-worklets`. Since we don't need animations in the scaffold, removing `react-native-reanimated` entirely resolved the bundling error.
- Decided to document this as ADR-001 since the version resolution involved real architectural tradeoffs.

---

## Entry #2 — _(next session)_

**Task:**
**Prompt Given:**
**AI Output:**
**What I Changed:**
**What I Learned / Decided:**
