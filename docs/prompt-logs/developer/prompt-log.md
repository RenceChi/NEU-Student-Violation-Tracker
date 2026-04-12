# Developer Prompt Log — prismic7

---

## Entry 001
**Date:** 2026-04-12
**Task:** Task #31 — Initialize Expo scaffold and connect Supabase

**Prompt given to AI:**
Asked AI to help set up a React Native (Expo) project with Supabase, NativeWind, and Expo Router from scratch.

**What the AI produced:**
Step-by-step installation guide using `blank-typescript` template with manual dependency installation.

**What I changed/rejected and why:**
The `blank-typescript` template caused repeated React version conflicts (`react@19.1.0` vs `react-dom@19.2.x`). Rejected the manual approach after multiple failed attempts. Switched to the `tabs` template (`create-expo-app@latest . --template tabs`) which comes with Expo Router pre-configured and installs all dependencies at compatible versions automatically.

**What I learned:**
Always use `npx expo install` instead of `npm install` for Expo projects — it automatically resolves compatible versions. The `tabs` template is the correct starting point for Expo Router projects, not `blank-typescript`.

---

## Entry 002
**Date:** 2026-04-12
**Task:** Task #31 — Configure NativeWind and Babel

**Prompt given to AI:**
Asked AI for the correct `babel.config.js` for NativeWind v4 with Expo Router.

**What the AI produced:**
A babel config with `jsxImportSource: "nativewind"` and `plugins: ["nativewind/babel"]`.

**What I changed/rejected and why:**
This caused a `.plugins is not a valid Plugin property` error. After testing, stripped the config down to just `presets: ["babel-preset-expo"]` which resolved the bundling error. NativeWind v4 does not require the babel plugin when using the tabs template.

**What I learned:**
NativeWind v4 handles styling differently from v2 — the babel plugin approach is outdated. Always clear the cache with `--clear` when changing babel config.

---

## Entry 003
**Date:** 2026-04-12
**Task:** Task #32 — Set up folder structure

**Prompt given to AI:**
Asked AI for the correct folder structure for the project.

**What the AI produced:**
Suggested creating `/src/lib`, `/src/components`, `/src/types`, and `/docs` subfolders.

**What I changed/rejected and why:**
Kept the structure but adapted it to fit the team convention set by the PM — specifically moving `prompt-log.md` to `/docs/prompt-logs/developer/prompt-log.md` after the PM announced the new format to avoid merge conflicts.

**What I learned:**
Always check team announcements before committing folder structures. Individual files that everyone touches (like prompt logs) need to be namespaced per member.

---

## Entry 004
**Date:** 2026-04-12
**Task:** Task #33 — ADR-001

**Prompt given to AI:**
Asked AI to help write ADR-001 for the tech stack decision.

**What the AI produced:**
A markdown ADR covering React Native + Supabase with options considered and consequences.

**What I changed/rejected and why:**
Discovered the KM Analyst had already committed a more detailed `ADR-README.md` in `/docs/adr/` that included ADR-001 with fuller context and reasoning. Discarded the AI-generated file and used the existing one instead to avoid duplication.

**What I learned:**
Always check what teammates have already committed before creating new files. The existing ADR was more thorough because it was written with full team context.