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

---

## Entry 005
**Date:** 2026-04-13
**Task:** Task #52 — Configure Supabase Auth + create profiles table

**Prompt given to AI:**
Asked AI to walk me through creating a Supabase project and connecting it to the app.

**What the AI produced:**
Step-by-step guide for creating a Supabase project, getting API keys, and wiring them to the existing supabase.ts client via .env variables.

**What I changed/rejected and why:**
AI initially suggested hardcoding the Supabase URL and anon key directly in supabase.ts. Rejected this — used EXPO_PUBLIC_ environment variables instead to keep credentials out of the repo. Also caught that .env was not properly ignored by git and fixed the .gitignore before pasting real keys.

**What I learned:**
Always verify .gitignore covers .env before adding real credentials. The EXPO_PUBLIC_ prefix is required for Expo to expose env variables to the client bundle.

---

## Entry 006
**Date:** 2026-04-13
**Task:** Task #52 — Initial database schema

**Prompt given to AI:**
Asked AI to generate the database schema based on the user stories PDF.

**What the AI produced:**
An initial 2-table schema (profiles + violations). After reading the full user stories document, expanded it to 6 tables: profiles, violations, violation_types, sanctions, violation_sanctions, and appeals.

**What I changed/rejected and why:**
The first schema was too minimal — it didn't cover the violation types library, sanctions library, or appeals process which are all required by the user stories. Reviewed all 4 pages of the user stories document and pushed back on the AI to expand the schema accordingly.

**What I learned:**
Always read the full requirements before accepting a schema. A schema that looks complete for 1 user story may be missing 5 others.

---

## Entry 007
**Date:** 2026-04-13
**Task:** Task #54 — Build Login screen + role-based navigation guard

**Prompt given to AI:**
Asked AI to build the login screen based on the wireframe provided by the UX designer.

**What the AI produced:**
A login screen using emoji icons for the user, lock, and eye fields.

**What I changed/rejected and why:**
Rejected the emoji icons — they look unprofessional in a disciplinary management app. Replaced all emojis with @expo/vector-icons (Feather + Ionicons) to match the clean, minimal aesthetic of the wireframes. This is now the standard for all future screens.

**What I learned:**
AI defaults to emojis for quick icons. Always use a proper icon library for production-quality UI.

---

## Entry 008
**Date:** 2026-04-13
**Task:** Task #54 — Fix auth navigation bug

**Prompt given to AI:**
Reported that login button showed loading but did not navigate to the dashboard after successful authentication.

**What the AI produced:**
Multiple attempts using onAuthStateChange listener in the root layout and index.tsx. The listener approach kept failing because the component unmounted before the navigation fired.

**What I changed/rejected and why:**
Rejected the listener-only approach after 3 failed attempts. The fix was to handle navigation directly inside the login screen's handleLogin function — fetch the role immediately after signInWithPassword succeeds and call router.replace() right there. Same fix applied to logout in the officer dashboard. This is more predictable than relying on async listeners.

**What I learned:**
For navigation-critical events like login and logout, handle routing directly at the point of the action rather than relying on auth state listeners. Listeners are useful for session restoration on app open, but not reliable for immediate post-action navigation.

---

## Entry 009
**Date:** 2026-04-13
**Task:** Task #53 — Write RLS policies for all roles

**Prompt given to AI:**
Asked AI to generate RLS policies for all 6 tables based on the three roles: student, officer, and admin.

**What the AI produced:**
RLS policies covering SELECT, INSERT, and UPDATE permissions per role for all 6 tables.

**What I changed/rejected and why:**
Reviewed each policy against the user stories before running them. Confirmed that students should only see their own violations and appeals, officers should be able to read and write all violation data, and only admins should be able to modify the violation types and sanctions library. Saved the full SQL to docs/db/02_rls_policies.sql for team reference and version control.

**What I learned:**
RLS policies are the security layer of the entire app — getting them wrong means students could see other students' records. Always cross-check policies against the actual user stories, not just generic role assumptions.