# Prompt Log — Student Violation System Wireframes
**Project:** Student Violation System  
**Role:** UI/UX Designer  
**Tool Used:** Google Stitch  
**Date Started:** April 5, 2026
 
---
 
## Overview
 
This log documents all design decisions and AI-assisted prompts made during the wireframing process for the Student Violation System. Each entry includes the prompt given to the AI, the decision notes, and the resulting Google Stitch prompt used to generate the wireframe.
 
---
 
## Entry 1 — Initial Wireframe Request
 
**Prompt Given:** Asked AI to read all 6 user stories from the Student Violation System document and generate Google Stitch prompts for the 3 HIGH-priority screens: Record Student Violation, Manage Violation Types & Sanctions Library, and View Violation History. Provided the user story document as reference and requested that the wireframes follow the acceptance criteria defined per story.
 
### Decision Notes
- Identified 3 HIGH-priority screens from the user stories: Record Student Violation (8 pts), Manage Violation Types & Sanctions Library (8 pts), and View Violation History (5 pts).
- Decided to use Google Stitch for low-fidelity wireframe generation.
- All wireframes will be grayscale only, sketch-style, mobile frame 390x844px.
- Screens must reflect the KM flows being defined by the KM Analyst — coordination required before finalizing.
 
---
 
### Stitch Prompt 1 — Record Student Violation
 
**Reference User Story:** Record Student Violation (8 story points)
 
```
Low-fidelity mobile wireframe, white background, grayscale only, no color.
Screen title: "Record Student Violation"
 
Layout (top to bottom):
- Top navigation bar with a back arrow on the left, screen title "Record Violation"
  centered, and a "Submit" text button on the right.
- Section label: "Student"
- Search input field with placeholder "Search by ID or Name" and a search icon.
- Selected student card showing: student name (bold), ID number, section/class —
  with a small avatar placeholder on the left.
- Divider line.
- Section label: "Violation Details"
- Dropdown field labeled "Violation Type" with a chevron arrow.
- Auto-assigned severity badge row: label "Severity" on the left, pill-shaped badge
  on the right showing "Minor / Major / Severe" with a note "(auto-assigned, tap to override)".
- Date and Time row: two side-by-side input fields labeled "Date" and "Time".
- Input field labeled "Location" (single line).
- Multiline text area labeled "Description" with placeholder "Describe the incident..."
  (at least 4 lines tall).
- Section label: "Evidence (Optional)"
- Dashed rectangle upload box with a camera icon and label "Attach photo or file".
- Sticky bottom bar with a large full-width button labeled "Submit Violation".
 
Style: sketch-style wireframe, placeholder boxes for images, all text in simple
sans-serif, no icons except functional ones.
```
 
---
 
### Stitch Prompt 2 — Manage Violation Types & Sanctions Library
  
**Reference User Story:** Manage Violation Types & Sanctions Library (8 story points)
 
```
Low-fidelity mobile wireframe, white background, grayscale only, no color.
Screen title: "Violation Types & Sanctions"
 
Layout (top to bottom):
- Top navigation bar with a back arrow on the left, title "Manage Library" centered,
  and a "+" add button on the right.
- Two full-width toggle tabs below the nav bar:
  "Violation Types" (active/underlined) | "Sanctions"
- Search bar with placeholder "Search..."
- Scrollable list of violation type cards. Each card contains:
  - Violation name (bold) on the top left.
  - Category label below the name (e.g., "Attendance", "Conduct").
  - Severity badge (pill shape) on the right: Minor / Major / Severe.
  - Three-dot menu icon (⋮) on the top right corner of the card for Edit / Delete actions.
  - Small note in smaller gray text: "Linked sanctions: Warning, Detention".
- Floating action button (+) at the bottom right corner labeled "Add Type".
- When the "Sanctions" tab is selected (shown as a second screen or annotated state):
  - Same search bar.
  - List of sanction cards, each showing: sanction name (bold), duration
    (e.g., "1–3 days"), "Recommended For" badge (Minor / Major / Severe),
    and a three-dot menu.
  - Floating action button labeled "Add Sanction".
 
Style: sketch-style wireframe, card-based list layout, no color fills,
light gray rectangles as card backgrounds, simple borders.
```
 
---
 
### Stitch Prompt 3 — View Student Violation History
 
**Reference User Story:** View Student Violation History (5 story points)
 
```
Low-fidelity mobile wireframe, white background, grayscale only, no color.
Screen title: "Violation History"
 
Layout (top to bottom):
- Top navigation bar with a back arrow on the left, title "Violation History" centered.
- Student profile summary card at the top: avatar circle placeholder on the left,
  student name (bold), ID, section, and a small summary line "5 violations total"
  on the right.
- Filter row with horizontally scrollable pill/chip buttons:
  "All", "By Date", "By Severity", "By Type" — one is selected (filled/underlined).
- Summary statistics row: 3 small boxes side by side showing "Total", "Open",
  and "Resolved" with placeholder numbers.
- Divider line and label "Violation Records".
- Scrollable list of violation record cards in chronological order. Each card shows:
  - Violation type name (bold) on top.
  - Date and location in smaller gray text below.
  - Severity badge (pill) on the right: Minor / Major / Severe.
  - Status badge below severity: "Open" or "Resolved".
  - Short description preview (1 line, truncated).
  - Tap indicator ">" chevron on the right to view full details.
- Full detail view annotation (shown as a second screen or modal overlay sketch):
  - Full violation details: type, date, time, location, and description.
  - Assigned sanction (if any).
  - Officer in charge.
  - Evidence thumbnail placeholder.
  - "Submit Appeal" button at the bottom.
 
Style: sketch-style wireframe, timeline-style card list, no color,
grayscale badges, clean and minimal.
```
 
---
 
## Entry 2 — Main Dashboard Request
 
**Prompt Given:** Asked AI to generate an additional Google Stitch prompt for the main dashboard screen, which would serve as the home screen and central hub of the application. Requested that it connect to all other screens through a Quick Actions section.
 
### Decision Notes
- Added a Main Dashboard screen to serve as the central hub connecting all other screens.
- The dashboard includes a Quick Actions grid that directly links to the 3 HIGH-priority screens.
- Added a bottom navigation bar for persistent access to core sections.
- Included a summary statistics section for at-a-glance data on violations.
 
---
 
### Stitch Prompt 4 — Main Dashboard (Home Screen)
 
**Reference User Story:** All user stories — this screen links to all modules.
 
```
Low-fidelity mobile wireframe, white background, grayscale only, no color.
Screen title: "Dashboard / Home"
 
Layout (top to bottom):
- Top navigation bar with a hamburger menu icon on the left, app name
  "Student Violation System" centered, and a notification bell icon on the right
  with a small badge indicator.
- Greeting section below the nav bar:
  "Good morning, [Officer Name]" in bold,
  subtitle: "Here's today's overview" in smaller gray text.
- Summary statistics section: 4 small equal-width cards in a 2x2 grid layout showing:
  Card 1: "Total Violations" with a large placeholder number.
  Card 2: "Open Cases" with a large placeholder number.
  Card 3: "Resolved Today" with a large placeholder number.
  Card 4: "Pending Appeals" with a large placeholder number.
  Each card has a small icon placeholder (circle) on top and a bold number in the center.
- Section label: "Quick Actions"
- 2x2 grid of large square action buttons:
  Button 1: icon placeholder + label "Record Violation"
  Button 2: icon placeholder + label "View History"
  Button 3: icon placeholder + label "Manage Library"
  Button 4: icon placeholder + label "Generate Report"
- Section label: "Recent Violations"
- Scrollable list of 3 recent violation preview cards, each showing:
  - Student name (bold) on the top left.
  - Violation type below the name in gray text.
  - Date/time on the right (small text).
  - Severity badge (pill shape): Minor / Major / Severe.
  - Status badge: "Open" or "Resolved".
  - Chevron ">" on the far right to navigate to full details.
- Bottom navigation bar with 4 tabs:
  Tab 1: Home icon (active/filled) + label "Home"
  Tab 2: File icon + label "Violations"
  Tab 3: Chart icon + label "Reports"
  Tab 4: Settings icon + label "Settings"
 
Style: sketch-style wireframe, grayscale only, placeholder boxes for icons
and images, card-based layout, clean minimal design, simple sans-serif font,
no shadows or gradients, mobile frame 390x844px.
```
 
---
 
## Entry 3 — Navigation Flow Check
 
**Prompt Given:** Asked AI to verify whether all four screens (Record Violation, View History, Manage Library, and Main Dashboard) are connected to each other and to explain how the navigation flows between them.
 
### Decision Notes
- Confirmed that all 4 screens are connected through primary navigation and data flows.
- Key connections identified:
  - Main Dashboard → all 3 HIGH-priority screens via the Quick Actions grid.
  - Manage Library → Record Violation (feeds violation type dropdown and severity).
  - Record Violation → View History (real-time update after submission).
  - View History → Assign Sanctions (officer reviews history then assigns penalty).
  - Assign Sanctions → View History (status flips from "Open" to "Sanction Assigned").
  - All screens → Generate Reports (pulls data from violations and sanctions).
 
---
 
## Entry 4 — Authentication Gap Identified
 
**Prompt Given:** Asked AI whether the current set of screens includes authentication, and whether a login flow is needed for the system.
 
### Decision Notes
- Identified that authentication was missing from the original 6 user stories.
- Authentication is implied by the system because multiple distinct roles exist: Admin, Discipline Officer, Teacher, Student, and Parent/Guardian.
- Decided to add a Login screen as the entry point before the Main Dashboard.
- Two navigation paths were defined based on role:
  - Staff (Admin / Officer / Teacher) → Main Dashboard → all core features.
  - Student / Parent → limited view, only sees their own violation history and the Appeal Process.
- Raised 3 missing user stories that should be discussed with the team:
  1. Login / Authentication
  2. Role-Based Access Control
  3. Logout / Session Management
 
---
 
### Stitch Prompt 5 — Login Screen
  
```
Low-fidelity mobile wireframe, white background, grayscale only, no color.
Screen title: "Login"
 
Layout (top to bottom):
- Large top section (approximately 30% of screen height) with a centered placeholder
  rectangle for the school logo and the app name "Student Violation System" in bold
  text below it. Subtitle: "School Disciplinary Management" in smaller gray text.
- Divider line.
- Section label: "Sign In"
- Input field labeled "Username or ID Number" with a person icon on the left.
- Input field labeled "Password" with a lock icon on the left and an eye icon on
  the right (show/hide password toggle).
- Small text link aligned to the right: "Forgot Password?"
- Large full-width button labeled "Login".
- Divider with the text "or continue as".
- Two side-by-side outlined buttons:
  Left button: icon placeholder + "Student / Parent"
  Right button: icon placeholder + "Staff"
- Small gray text at the bottom center:
  "Having trouble? Contact your system administrator."
 
Style: sketch-style wireframe, grayscale only, no color fills,
simple borders, mobile frame 390x844px.
```
 
---
 
