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

---

## Entry 010
**Date:** 2026-05-02
**Task:** Task #55 — Build UI for managing violation types & sanctions (Story 2)

**Prompt given to AI:**
Asked AI to build the Violation Types and Sanctions CRUD screens based on the hi-fi wireframes, using Supabase, NativeWind v4, and the existing profiles/auth setup.

**What the AI produced:**
Two separate screens — `library.tsx` and `sanctions.tsx` — with full CRUD, role-gated add/edit/delete buttons, search and filter panels, and severity-colored cards.

**What I changed/rejected and why:**
The initial import used `useAuth` from a non-existent `AuthContext` file. Had to first create `src/lib/context/AuthContext.tsx` to provide session and profile.role across screens. Also discovered NativeWind v4 styles were not applying — traced the issue to a missing `metro.config.js` with `withNativeWind` and a missing `global.css` import in the root layout. Fixed both. Later merged sanctions into `library.tsx` as a tabbed interface to match the updated hi-fi design.

**What I learned:**
NativeWind v4 requires three things to work: correct babel preset, `metro.config.js` with `withNativeWind`, and `global.css` imported in the root layout. Missing any one of these causes silent styling failures. Always set up the full NativeWind pipeline before building UI.

---

## Entry 011
**Date:** 2026-05-02
**Task:** Task #55 — Fix RLS infinite recursion on profiles table

**Prompt given to AI:**
App threw "infinite recursion detected in policy for relation profiles" when opening the Library screen.

**What the AI produced:**
Identified that the "Officers can view all profiles" SELECT policy was querying the `profiles` table inside a policy on `profiles` itself, causing infinite recursion.

**What I changed/rejected and why:**
The first suggested fix used `auth.jwt()` to read the role claim — this didn't work because role is stored in the profiles table, not in the JWT. The second suggestion using `auth.users.raw_user_meta_data` also failed. The correct fix was to drop the recursive policy entirely and replace all SELECT policies on profiles with a single `auth.uid() IS NOT NULL` policy — any authenticated user can read profiles, which is safe given the data stored (name, role, section).

**What I learned:**
Never write an RLS policy on a table that queries the same table to check permissions — it will always recurse. For role-based access on the profiles table specifically, use JWT claims or a simpler auth.uid() check instead of a subquery back to profiles.

---

## Entry 012
**Date:** 2026-05-02
**Task:** Task #55 — Fix duplicate rows in sanctions and violation_types

**Prompt given to AI:**
Sanctions screen showed 14 items instead of 7. Asked AI to diagnose the cause.

**What the AI produced:**
First suggested the duplication was a React double-render issue and recommended an `active` guard in useEffect. Then identified the real cause: Supabase `ALL` policies overlapping with `SELECT` policies — admins matched both policies and received each row twice.

**What I changed/rejected and why:**
The `active` guard in useEffect was correct and kept — it prevents double-fetching in React 19 strict mode. But it didn't fix the duplication. The actual fix was splitting the `ALL` policy for admins into separate INSERT, UPDATE, and DELETE policies, removing the overlap with the existing `SELECT` policy. Also ran a dedup query on the sanctions table itself (`DISTINCT ON`) after discovering the seed data had been inserted twice.

**What I learned:**
Supabase `ALL` policies include SELECT, so combining them with a separate SELECT policy causes each row to be returned twice for users who match both. Always use operation-specific policies (INSERT/UPDATE/DELETE) rather than ALL when a SELECT policy already exists for the same table.

---

## Entry 013
**Date:** 2026-05-02
**Task:** Task #55 — Rebuild Library UI to match updated hi-fi design

**Prompt given to AI:**
UX designer provided an updated hi-fi showing a significantly different card layout — clean white cards with no left border, linked sanctions chips, three-dot menus, updated modals with segmented controls and a junction table for violation-sanction links.

**What the AI produced:**
Rebuilt `library.tsx` with the new card design, ViolationModal with Link Sanctions chip selector, SanctionModal with segmented Recommended For control, yellow FAB with label, and Supabase queries joining `violation_type_sanctions` for linked sanctions and `profiles` for updater name.

**What I changed/rejected and why:**
Required a new junction table (`violation_type_sanctions`) and two new columns (`updated_by` on both `violation_types` and `sanctions`). Wrote and ran the SQL before the AI rebuilt the UI. Also added `ActionSheetIOS` for the three-dot menu on iOS to match native patterns — kept `Alert` as the Android fallback since there's no native action sheet equivalent.

**What I learned:**
When the UX changes significantly mid-sprint, it's faster to identify the schema changes first and run them before touching the UI code. Trying to build UI against a missing table wastes time.

---

## Entry 014
**Date:** 2026-05-02
**Task:** Task #56, #57, #58 — Create student_violations table + Record Violation form

**Prompt given to AI:**
Asked AI to write the SQL for the `student_violations` table with foreign keys to `profiles` and `violation_types`, and to build the Record Violation screen matching the hi-fi wireframe.

**What the AI produced:**
SQL for `student_violations` with RLS policies, and a full `record.tsx` screen with student search (debounced), violation type picker with auto-assigned severity, date/time fields, location, description with character counter, evidence upload placeholder, animated success banner, and Supabase insert on submit.

**What I changed/rejected and why:**
The initial version placed `useRouter()` outside the component function, which is a React hooks violation. Moved it inside `RecordViolation()`. Also wired the back button to `router.back()` after noticing it had no `onPress` handler. The record screen is accessed via a FAB on the Violations tab rather than as a standalone tab — updated `_layout.tsx` to hide `record` from the nav and added `reports.tsx` as a placeholder for the Reports tab.

**What I learned:**
React hooks must always be called inside the component function — never at the module level. `useRouter`, `useAuth`, `useState` etc. called outside a component will crash at runtime, not compile time, making the error harder to catch.

---

## Entry 015
**Date:** 2026-05-02
**Task:** Task #54 — Redesign Login screen to match refined hi-fi (EduGuard branding)

**Prompt given to AI:**
UX designer provided a refined login screen hi-fi with dark navy top section, EduGuard branding, shield icon, amber "SCHOOL DISCIPLINARY MANAGEMENT" subtitle, and a clean white form card below.

**What the AI produced:**
Rebuilt `login.tsx` matching the hi-fi — navy header with shield icon and EduGuard/amber subtitle, white form card with amber-accented input icons, inline "Forgot Password?" link, Login button with arrow icon, compliance footer note, and amber "VERIFIED SYSTEM" badge.

**What I changed/rejected and why:**
Kept the existing auth logic (signInWithPassword + role fetch + router.replace) unchanged since it was already working correctly. Only the visual layer was replaced. Verified the import path for supabase.ts matched the existing file structure before replacing.

**What I learned:**
When redesigning a screen that already has working logic, isolate the visual changes from the logic changes. Replacing only the JSX/styles while keeping the handlers intact avoids reintroducing bugs that were already fixed.

---

## Entry 016
**Date:** 2026-05-02
**Task:** Tasks #59, #60 — Violation History UI + Supabase fetch queries with RLS

**Prompt given to AI:**
Asked AI to build the Violation History screen based on the updated hi-fi wireframes, with role-aware views for officers and students, search, filter chips, stats row, and Supabase fetch queries respecting RLS.

**What the AI produced:**
A `history.tsx` screen with a FlatList, role-gated views (officer sees all violations with student names, student sees only their own with a profile card), stats row (Total/Open/Resolved), search bar, filter chips (All/By Date/By Type/By Severity), violation cards with severity and status badges, and a FAB + "Record New Violation" banner for officers.

**What I changed/rejected and why:**
The Supabase query used joined selects with aliases (`student:profiles!student_id`, `recorder:profiles!recorded_by`) which required casting the result as `any` due to TypeScript limitations with multi-join Supabase responses. Accepted this tradeoff — the data is correct at runtime even if TypeScript can't infer the shape. Also fixed the router.push pathname to use `as any` to bypass Expo Router's strict pathname type checking for dynamic routes.

**What I learned:**
When querying the same foreign table twice with different foreign key relationships (e.g. profiles via student_id and profiles via recorded_by), Supabase requires explicit hints using the `!column_name` syntax. TypeScript won't infer the shape of these joined results — casting to `any` is the pragmatic solution when the data structure is verified at runtime.

---

## Entry 017
**Date:** 2026-05-02
**Task:** Tasks #61, #62 — Assign Sanctions UI + Supabase update function

**Prompt given to AI:**
Asked AI to build the Assign Sanction screen and Violation Detail screen matching the hi-fi, with sanction checklist, penalty period, notify student toggle, and Supabase insert into violation_sanctions + status update on student_violations.

**What the AI produced:**
`violation/[id].tsx` — full detail screen with all violation fields, evidence placeholders, assigned sanctions display, and role-gated action buttons (Assign Sanction for officers, Submit Appeal for students). `violation/assign-sanction.tsx` — sanction checklist with recommended-for badges, penalty period date inputs, notify student toggle, and handleAssign that inserts into violation_sanctions and updates violation status to resolved.

**What I changed/rejected and why:**
The violation subfolder required its own `_layout.tsx` with a Stack navigator — without it, Expo Router treated the violation screens as tabs and displayed them in the bottom nav bar as broken entries with down-arrow icons. Added `violation/_layout.tsx` with a headerless Stack and added `<Tabs.Screen name="violation" options={{ href: null }} />` to the officer layout to hide it from the tab bar. Also fixed the back button in `record.tsx` to use `router.replace("/(officer)/history")` instead of `router.back()` — the latter was navigating to the home dashboard because the record screen was pushed from the FAB rather than from within the history stack.

**What I learned:**
In Expo Router, any folder inside a tabs group is automatically treated as a tab unless explicitly hidden. Always add `href: null` for nested Stack routes inside a tabs layout. Additionally, `router.back()` follows the navigation stack — if a screen was opened from outside the expected flow, back() won't go where you expect. Use `router.replace()` with an explicit path for predictable navigation.

---

## Entry 018
**Date:** 2026-05-02
**Task:** Tasks #59-62 — Fix nav bar and routing issues

**Prompt given to AI:**
Reported that the bottom nav bar showed broken tabs with down-arrow icons for the violation detail routes, and that the Reports tab showed a down-arrow instead of the bar chart icon.

**What the AI produced:**
Instructions to create `violation/_layout.tsx`, add `violation` to hidden tabs in the officer layout, and rename `report.tsx` to `reports.tsx` to match the tab screen name.

**What I changed/rejected and why:**
All three fixes were straightforward. The violation layout fix resolved the broken tabs immediately. The reports icon issue was purely a filename mismatch — Expo Router couldn't find `reports.tsx` because the file was named `report.tsx`, causing it to render a fallback tab with a down-arrow icon. Renamed the file and it resolved instantly.

**What I learned:**
Expo Router is filename-driven — the screen name in `<Tabs.Screen name="reports">` must exactly match the filename `reports.tsx`. A single character difference causes silent routing failures that are hard to diagnose without checking the file explorer carefully.