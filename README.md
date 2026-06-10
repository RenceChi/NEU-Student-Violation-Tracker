# NEU Student Violation Tracker

A cross-platform mobile application that digitizes the New Era University (NEU) student violation form and provides real-time visibility for both officers and students.

---

## KM Framework

This app is grounded in the **SECI Model** of Knowledge Management:

| SECI Phase | App Feature |
|---|---|
| Socialization | Officer records violations observed in person |
| Externalization | Violation data is digitized and stored in structured form |
| Combination | System aggregates and displays violation history |
| Internalization | Students view their own records and learn from them |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile App | React Native (Expo SDK 54) |
| Navigation | Expo Router v6 (file-based routing) |
| Backend / Auth / DB | Supabase (PostgreSQL + Auth) |
| Styling | NativeWind v4 (Tailwind CSS for RN) |
| Language | TypeScript |
| Build & Distribution | EAS Build (Expo Application Services) |

---

## Features

| Feature | Roles |
|---|---|
| Login with role-based routing | Admin, Officer, Student |
| Record student violations with date, time, location, severity | Admin, Officer |
| Assign sanctions to violations | Admin, Officer |
| View full violation history with search and filters | Admin, Officer |
| Manage violation types and sanctions library | Admin only |
| Generate reports with severity breakdown and trends | Admin only |
| Submit and track appeals on violations | Student |
| Review and decide on student appeals | Admin, Officer |
| View own violation history and appeal status | Student |

---

## Project Structure

```
NEU-Student-Violation-Tracker/
├── app/                        # Expo Router screens
│   ├── (auth)/                 # Login screen
│   │   ├── _layout.tsx
│   │   └── login.tsx
│   ├── (officer)/              # Officer/Admin route group
│   │   ├── violation/          # Nested violation stack
│   │   │   ├── _layout.tsx
│   │   │   ├── [id].tsx        # Violation detail screen
│   │   │   └── assign-sanction.tsx
│   │   ├── _layout.tsx
│   │   ├── index.tsx           # Dashboard
│   │   ├── history.tsx         # Violation history + search
│   │   ├── library.tsx         # Violation types & sanctions
│   │   ├── record.tsx          # Record new violation
│   │   ├── report.tsx          # Analytics & reports
│   │   └── appeals.tsx         # Appeal review
│   ├── (student)/              # Student route group
│   │   ├── _layout.tsx
│   │   ├── index.tsx           # Student dashboard
│   │   ├── violations.tsx      # Own violation history
│   │   └── appeals.tsx         # Own appeal status
│   ├── _layout.tsx             # Root layout (AuthProvider)
│   └── index.tsx               # Entry point (role-based redirect)
├── components/                 # Reusable UI components
│   ├── DateTimePickers.tsx     # Custom drum-scroll date/time pickers
│   ├── SubmitAppealModal.tsx   # Student appeal submission modal
│   ├── StyledText.tsx
│   ├── Themed.tsx
│   └── __tests__/
├── src/
│   └── lib/
│       ├── supabase.ts         # Supabase client configuration
│       └── context/
│           └── AuthContext.tsx # Session + profile context
├── constants/
│   └── Colors.ts
├── docs/
│   ├── adr/                    # Architecture Decision Records
│   ├── prompt-logs/            # Per-member AI prompt logs
│   │   └── developer/
│   │       └── prompt-log.md
│   ├── standups/               # Weekly standup notes
│   ├── wireframes/             # UI wireframes with KM annotations
│   ├── test-cases/             # QA test cases
│   ├── km-architecture.md      # Knowledge taxonomy and retrieval design
│   ├── km-report.md            # KM Conceptual Report
│   ├── design-rationale.md     # UX/UI design decisions
│   └── failure-analysis.md     # QA failure analysis report
├── assets/                     # Images, fonts, icons
├── global.css                  # NativeWind base styles
├── babel.config.js
├── metro.config.js
├── tailwind.config.js
├── CHANGELOG.md
├── CONTRIBUTING.md
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Expo Go app on your mobile device (for development)
- A Supabase project with the schema applied

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/RenceChi/NEU-Student-Violation-Tracker.git
cd NEU-Student-Violation-Tracker

# 2. Install dependencies
npm install

# 3. Set up environment variables
# Create a .env file in the root directory and fill in your Supabase credentials
# (see Environment Variables section below)

# 4. Start the development server
npx expo start --clear
```

### Environment Variables

Create a `.env` file in the root directory:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```
---

## User Roles

| Role | Access |
|---|---|
| **Admin** | Full access — all officer features + library management + reports |
| **Officer** | Record violations, assign sanctions, review appeals |
| **Student** | View own violation history, submit and track appeals |

---

## Deployment

The production APK is built and distributed using **EAS Build** (Expo Application Services).

### Build the APK

```bash
# 1. Log in to your Expo account
eas login

# 2. Trigger a production build
eas build --platform android --profile production
```

The build runs in the cloud (~10–20 minutes). When complete, the APK download link appears in your [Expo dashboard](https://expo.dev).

### Environment Variables for Production

Secrets are injected at build time via EAS — they are never committed to the repo.

```bash
# Supabase URL (plain text)
eas env:create --scope project --name EXPO_PUBLIC_SUPABASE_URL \
  --value https://your-project-id.supabase.co

# Supabase Anon Key (sensitive)
eas env:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY \
  --value your-anon-key-here
```

Set visibility to **Sensitive** for the anon key. Select **production** as the environment.

### Installing the APK on Android

1. Download the `.apk` from your Expo dashboard.
2. Transfer to your Android device.
3. Enable **Install from unknown sources** in Android Settings → Security.
4. Open the `.apk` file to install.

### Expo Project

- **Project ID:** `1871aa65-2033-467b-882e-01d2d2bec686`
- **EAS Dashboard:** [expo.dev/accounts/prismic/projects/NEU-Student-Violation-Tracker](https://expo.dev/accounts/prismic/projects/NEU-Student-Violation-Tracker)

---

## Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Production — protected, PR review required |
| `dev` | Integration branch — all features merge here first |
| `feature/*` | Individual feature branches per member |

---

## Team

| GitHub | Role |
|---|---|
| Clark Lawrence Ching | Project Manager |
| Frinz Hughwie Bautista | Full-Stack Developer |
| Zyrus Velasco | QA & Documentation Lead |
| Precy Baguio | UX/UI Designer |
| Jacques Euan Carigma | Knowledge Management Analyst |

---

## Contribution Evidence

- Each member works on their own `feature/*` branch
- All PRs target `dev` before merging to `main`
- Prompt logs are in `/docs/prompt-logs/(role)/prompt-log.md`
- Architecture decisions are documented in `/docs/adr/`

---

## Screenshots

### Authentication
<img width="576" height="1280" alt="image" src="https://github.com/user-attachments/assets/c8e05d51-2fa6-4234-9a99-10562f433c2d" />
<img width="576" height="1280" alt="image" src="https://github.com/user-attachments/assets/19eb7793-a528-4c2f-8b64-e19a84078296" />

### Student View
<img width="576" height="1280" alt="image" src="https://github.com/user-attachments/assets/0fba7831-d65e-43e8-a12d-2ce06a55810f" />
<img width="576" height="1280" alt="image" src="https://github.com/user-attachments/assets/71409546-871c-4b1a-a7f0-86af44e42f6c" />
<img width="576" height="1280" alt="image" src="https://github.com/user-attachments/assets/e99900e2-7dcc-4203-8a5a-56dc2a60b604" />

### Officer View
<img width="576" height="1280" alt="image" src="https://github.com/user-attachments/assets/abab6be0-e944-4750-8e8b-293c04d75447" />
<img width="576" height="1280" alt="image" src="https://github.com/user-attachments/assets/1fc5ccdf-6ab0-4c53-a6a1-767d1d366a24" />
<img width="576" height="1280" alt="image" src="https://github.com/user-attachments/assets/8cd92f24-0a8b-40bd-ad5f-ce29a3e1a189" />
<img width="576" height="1280" alt="image" src="https://github.com/user-attachments/assets/51c41747-b3cf-4542-b1dd-dcbc6906c02f" />



### Admin View 
<img width="576" height="1280" alt="image" src="https://github.com/user-attachments/assets/d40ecbfb-4303-4e81-84fc-c7c6cb54c975" />
<img width="576" height="1280" alt="image" src="https://github.com/user-attachments/assets/e6af2c40-aad3-429f-a08e-22e36293d4ae" />
<img width="576" height="1280" alt="image" src="https://github.com/user-attachments/assets/5c10a9d0-b181-4c20-a4c7-23bd67b9ed0f" />

---

## License

For academic use only — New Era University, AY 2025–2026.
