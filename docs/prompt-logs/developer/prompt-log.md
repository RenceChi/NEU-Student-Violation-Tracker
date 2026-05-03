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
**Date:** 2026-05-03
**Task:** fix/ui-fixes — Build Officer Dashboard (index.tsx)

**Prompt given to AI:**
Asked AI to build a full Officer Dashboard to replace the bare placeholder that only had "Officer Dashboard" text and a logout button.

**What the AI produced:**
A complete dashboard with EduGuard branding header, role label (ADMINISTRATOR / DISCIPLINE OFFICER), greeting, 4 stat cards (Total, Pending, This Week, Severe) pulled live from Supabase, Quick Actions row, and a Recent Violations list with severity dots, status badges, and time-ago labels.

**What I changed/rejected and why:**
The initial version used `router.push()` for all Quick Action buttons including tab screens (History, Library, Reports). This caused a back arrow to appear on those screens because `push` creates a stack entry. Changed all tab screen navigation to `router.navigate()` and kept `router.push()` only for `/(officer)/record` which is a proper stack screen that should have a back button.

**What I learned:**
`router.push()` always creates a stack entry and adds a back arrow. For tab screens, use `router.navigate()` instead — it switches tabs without pushing to the stack.

---

## Entry 017
**Date:** 2026-05-03
**Task:** fix/ui-fixes — Build Violation History screen (history.tsx)

**Prompt given to AI:**
Asked AI to build a full Violation History screen to replace the placeholder that only showed "Violation History" text.

**What the AI produced:**
A full list screen with expandable violation rows showing student info, violation type, severity stripe, status badges, incident details, recorder name, and location. Status filter pills (All/Pending/Resolved/Appealed) in the header, severity filter pills below search bar, pull-to-refresh, and a FAB to record new violations.

**What I changed/rejected and why:**
Found a stale closure bug — `fetchViolations` was defined outside the `useEffect` and closed over `statusFilter` and `severityFilter` at definition time. Rapid filter changes would fetch with stale values. Fixed by rewriting the fetch as `doFetch(status, severity, silent)` that takes filters as arguments, and calling it explicitly from both `useEffect` and the `handleRefresh` function.

**What I learned:**
Functions that close over React state inside `useEffect` capture the state value at the time of definition, not at the time of execution. When filters change rapidly, the stale closure fetches with the wrong values. Always pass current state explicitly as function arguments when the function is called from multiple places.

---

## Entry 018
**Date:** 2026-05-03
**Task:** fix/ui-fixes — Build Reports screen (report.tsx)

**Prompt given to AI:**
Asked AI to build a Reports screen to replace the "Reports coming soon" placeholder.

**What the AI produced:**
A reports screen with 30/90/365 day range selector, summary stat cards (Total/Pending/Resolved), severity breakdown with percentage bars, top 5 violation types ranked by count, category breakdown, and monthly trend bars. All data computed client-side from a single Supabase query. Export button stubbed with an Alert for admin users only.

**What I changed/rejected and why:**
Kept as-is. All data queries matched the schema. The export button is intentionally stubbed — PDF export is a Sprint 2 task (#100).

**What I learned:**
Computing aggregations client-side from a single broad query is acceptable for small datasets. For larger production datasets, this should be moved to a Supabase database function or RPC to reduce data transfer.

---

## Entry 019
**Date:** 2026-05-03
**Task:** fix/ui-fixes — Build Student Dashboard (student/index.tsx)

**Prompt given to AI:**
Asked AI to build a full Student Dashboard replacing the bare "Student Dashboard" placeholder.

**What the AI produced:**
A dashboard with student avatar (initials), 4 status counters (Total/Pending/Resolved/Appealed), expandable violation cards with sanction details, and a "Submit Appeal" button on pending violations.

**What I changed/rejected and why:**
Three fixes were needed after schema verification: (1) The sanctions query used `student_violation_sanctions` which doesn't exist — corrected to `violation_sanctions` with `violation_id` as the FK. (2) Added null guard on sanction render since the join can return null if a sanction is deleted. (3) The appeal submission originally just updated `student_violations.status` — corrected to first insert a row into the `appeals` table (with `violation_id`, `student_id`, `reason`, `status`) then update the violation status to `appealed`.

**What I learned:**
Always verify table and column names against the actual schema before writing Supabase queries. The join table name and FK column name both differed from what seemed intuitive, causing silent empty results rather than errors.

---

## Entry 020
**Date:** 2026-05-03
**Task:** fix/ui-fixes — Fix officer layout bugs (_layout.tsx)

**Prompt given to AI:**
Asked AI to review and fix the officer tab layout which had a nav bug and a phantom tab.

**What the AI produced:**
Identified two bugs: (1) the Reports tab was registered as `name="reports"` but the file is `report.tsx` causing the tab to never resolve, (2) a `sanctions` tab was registered but no `sanctions.tsx` file exists, generating console warnings on every render.

**What I changed/rejected and why:**
Fixed both. Also added role-based tab hiding — Reports tab now uses `href: isAdmin ? undefined : null` so it's hidden from officers and only visible to admins. This required importing `useAuth` into the layout file. Also removed the phantom `sanctions` screen registration entirely.

**What I learned:**
Expo Router tab names must exactly match the filename. A tab registered with the wrong name silently fails to render without throwing an error. Always verify tab `name` props match actual filenames.

---

## Entry 021
**Date:** 2026-05-03
**Task:** fix/ui-fixes — Fix AuthContext double fetch + add error state

**Prompt given to AI:**
Asked AI to fix a race condition in AuthContext where `getSession()` and `onAuthStateChange` both fired on startup, triggering two simultaneous profile fetches for the same user.

**What the AI produced:**
Added a `fetchedForId` ref to track which user ID was already fetched, preventing the `onAuthStateChange` listener from re-fetching if the profile was already loaded. Also added an `error: string | null` field to the context so screens can surface auth errors instead of silently failing.

**What I changed/rejected and why:**
Kept both changes. Also removed the double `AuthProvider` wrapping in `(auth)/_layout.tsx` — the root `app/_layout.tsx` already wraps everything in `AuthProvider`, so a second one inside `(auth)/` created a separate context instance where `useAuth()` would return empty state.

**What I learned:**
React context consumers always read from the nearest provider ancestor. A second `AuthProvider` inside a nested layout creates a fresh context instance, so `useAuth()` calls inside that subtree see empty state instead of the real session — a subtle bug that looks like an auth failure.

---

## Entry 022
**Date:** 2026-05-03
**Task:** fix/ui-fixes — Fix login.tsx error handling + implement Forgot Password

**Prompt given to AI:**
Asked AI to fix login error handling (profile fetch failure left user stuck on spinner) and implement the Forgot Password button which was previously a no-op.

**What the AI produced:**
Added email format validation before attempting login, proper error handling when profile fetch fails (signs user out and shows actionable error), unknown role blocking, and a working Forgot Password using `supabase.auth.resetPasswordForEmail()` that reads the email already typed in the field.

**What I changed/rejected and why:**
Kept all changes. Added `autoComplete="email"` and `autoComplete="password"` props to the TextInputs for better UX on both platforms. Changed the login button background to `#475569` when disabled to give visual feedback that it's in a loading state.

**What I learned:**
`supabase.auth.resetPasswordForEmail()` requires a `redirectTo` URL — used `eduguard://reset-password` as the deep link scheme. This needs to be registered in `app.json` under `scheme` before the password reset flow will work end-to-end on device.

---

## Entry 023
**Date:** 2026-05-03
**Task:** fix/ui-fixes — Fix RLS infinite recursion on profiles table

**Prompt given to AI:**
App threw "[AuthContext] Profile fetch failed: infinite recursion detected in policy for relation profiles" after applying new RLS policies.

**What the AI produced:**
Identified that the "Officers and admins can view all profiles" policy used a subquery `SELECT 1 FROM profiles WHERE id = auth.uid()` — which queries `profiles` while checking a policy on `profiles`, causing infinite recursion.

**What I changed/rejected and why:**
The fix was to create a `SECURITY DEFINER` function `get_my_role()` that reads the role from `profiles` while bypassing RLS (runs as postgres superuser). All policies that previously subqueried `profiles` were rewritten to call `get_my_role()` instead. Applied the same fix across all 6 tables that had the same pattern — `student_violations`, `sanctions`, `violation_types`, `violation_type_sanctions`, `appeals`, and `violation_sanctions`.

**What I learned:**
Any RLS policy on table X that contains `SELECT FROM X` will infinitely recurse. The correct pattern for role-based RLS on the same table being checked is a `SECURITY DEFINER` function that bypasses RLS when reading the role. This is the standard Supabase pattern for this use case.

---

## Entry 024
**Date:** 2026-05-03
**Task:** fix/ui-fixes — Fix library.tsx canEdit bug

**Prompt given to AI:**
Reported that officer accounts could see Add/Edit/Delete buttons in the Library screen, which contradicts the roles document (only admins can manage the library).

**What the AI produced:**
Identified the bug — `canEdit` was set to `profile?.role === "admin" || profile?.role === "officer"` giving officers full edit access.

**What I changed/rejected and why:**
Changed to `const canEdit = profile?.role === "admin"` — one word removed. This cascades correctly through the entire file since `canEdit` is passed as a prop to `ViolationCard`, `SanctionCard`, the FAB, and the header add button.

**What I learned:**
Always cross-check role-gating logic against the roles document before committing. A single `||` that shouldn't be there gave officers admin-level access to the entire library.

---

## Entry 025
**Date:** 2026-05-03
**Task:** fix/ui-fixes — Fix record.tsx date/time format bug + rebuild pickers

**Prompt given to AI:**
Two bugs: (1) `date_of_incident` was being inserted as "Jan 5, 2026" instead of "2026-01-05" causing DB type mismatch. (2) The date/time TextInputs were editable free text, allowing invalid values.

**What the AI produced:**
First attempt: replaced `TextInput` fields with `@react-native-community/datetimepicker`. This caused layout issues on iOS (inline rendering inside ScrollView) and a 1970 epoch bug with `display="inline"`.

**What I changed/rejected and why:**
After multiple failed attempts with `DateTimePicker` (inline rendering bug, modal clipping, 1970 date bug), rejected the third-party library entirely. Built custom `DatePickerModal` and `TimePickerModal` components using pure React Native `ScrollView` + `Modal` with drum/scroll wheel UI. These have no native module dependencies and work identically on iOS and Android. Date state stores `YYYY-MM-DD`, time state stores `HH:MM:SS` — both correct for the DB column types.

**What I learned:**
`@react-native-community/datetimepicker` has significant rendering differences between iOS and Android that require platform-specific workarounds. For cross-platform consistency in Expo Go, a custom pure-RN picker is more reliable than fighting native module quirks. Always verify DB column types before building form fields — `date` columns require `YYYY-MM-DD`, `time` columns require `HH:MM:SS`.

---

## Entry 026
**Date:** 2026-05-03
**Task:** fix/ui-fixes — Full database audit and fixes

**Prompt given to AI:**
Asked AI to audit all RLS policies, indexes, constraints, and foreign keys across the entire database.

**What the AI produced:**
Identified and fixed: 8 RLS policy gaps (missing WITH CHECK clauses, wrong join table, broken officer ALL policy on appeals), 11 missing indexes on frequently queried columns, 7 missing CHECK constraints on enum columns, duplicate FK on `student_violations.violation_type_id`, missing FKs on `appeals.violation_id` and `violation_sanctions.violation_id`, and wrong delete rule on `violation_sanctions.sanction_id` (SET NULL → RESTRICT). Also identified and dropped the orphaned `violations` table (0 rows, 4 stale RLS policies).

**What I changed/rejected and why:**
Ran all fixes in sections — indexes first (zero risk), then constraints, then RLS, then FKs. Verified each section with a query before moving to the next. The `violations` table DROP was run separately after confirming 0 rows with `SELECT COUNT(*) FROM violations`.

**What I learned:**
Having policies defined on a table does not mean RLS is enabled — and having RLS enabled does not mean the policies are correct. Always audit WITH CHECK clauses on INSERT/UPDATE policies separately from USING clauses. Missing WITH CHECK means any authenticated user can bypass the restriction on write operations even if SELECT is properly locked down.

---

## Entry 027
**Date:** 2026-05-03
**Task:** fix/ui-fixes — Rebuild app/index.tsx to use AuthContext

**Prompt given to AI:**
Asked AI to fix the root `app/index.tsx` which was making a redundant Supabase `getSession()` + `profiles` query on every app open, duplicating work already done by `AuthContext`.

**What the AI produced:**
Rewrote `index.tsx` to use `useAuth()` hook directly — reads `session`, `profile`, and `loading` from context. Shows a navy/amber spinner while loading, redirects to login if no session, routes to student or officer layout based on `profile.role`. No Supabase calls in the file at all.

**What I changed/rejected and why:**
Kept as-is. Also updated the spinner background from white to `#1E293B` (navy) to match the EduGuard theme instead of showing a jarring white flash on app open.

**What I learned:**
When a context already fetches and exposes data, consuming it directly is always better than making a second identical fetch in a child component. The redundant fetch was causing a brief flicker on app open because two async operations were racing to determine the route.
