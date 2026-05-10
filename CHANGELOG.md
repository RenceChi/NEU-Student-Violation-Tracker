# Changelog

All notable changes to this project will be documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.3.0] — 2025-05-10

### Added
- **Reports Dashboard** (`app/(officer)/report.tsx`) — admin-only analytics screen with date range selector (last 30d / 90d / 1 year), violation counts by severity, top 5 violation types, category breakdown, and monthly trend. All aggregation done client-side. CSV export placeholder added. (prismic7)
- **Student Appeals — Submission** (`components/SubmitAppealModal.tsx`) — modal form for students to submit an appeal on any resolved violation. Fields: reason (dropdown), explanation (text), preferred resolution (dropdown), supporting evidence placeholder. Inserts to `appeals` table on submit. (prismic7)
- **Student Appeals — Tracking** (`app/(student)/appeals.tsx`) — My Appeals screen with status filter pills (All / Pending / Under Review / Approved / Rejected) and a detail modal showing the full progress timeline, officer decision notes, and violation context. (prismic7)
- **Officer/Admin Appeals Review** (`app/(officer)/appeals.tsx`) — review queue listing all submitted appeals with student info, violation context, and status badges. `ReviewModal` allows marking Under Review, approving (auto-overturn), or rejecting with required decision notes. (prismic7)

### Changed
- Violation status now transitions to `overturned` automatically when an appeal is approved by an officer.
- Student Violations tab (`violations.tsx`) now checks `hasAppeal` to conditionally show or suppress the Submit Appeal button.

## [0.2.0] — 2025-05-03

### Added
- Violation recording screen with student search, violation type picker, severity override, date/time drum pickers, location, and description fields (`app/(officer)/record.tsx`)
- Assign Sanction screen linked from Violation History (`app/(officer)/violation/assign-sanction.tsx`)
- Violation detail modal accessible from History tab without stack navigation issues
- Library management screen for Violation Types and Sanctions with admin-only CRUD (`app/(officer)/library.tsx`)

### Changed
- Officer tab bar hides Reports tab for non-admin roles via `href: null`
- Violation nested stack uses `presentation: "modal"` to prevent rendering artifacts

## [0.1.0] — 2025-04-26

### Added
- Project scaffold: Expo Router, NativeWind, Supabase client
- Authentication flow with role-based redirect (student / officer / admin) (`app/(auth)/login.tsx`)
- `AuthContext` with session persistence via AsyncStorage and profile fetch on mount
- Student portal: Home dashboard with stats, My Violations tab with expandable cards, bottom tab navigation
- Officer/Admin portal: Dashboard with stat cards and recent violations feed