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

---

## Project Structure

```
NEU-Student-Violation-Tracker/
├── app/                        # Expo Router screens
│   ├── (officer)/              # Officer route group
│   │   └── _layout.tsx
│   ├── (student)/              # Student route group
│   │   └── _layout.tsx
│   └── _layout.tsx             # Root layout
├── src/
│   ├── lib/                    # Supabase client
│   ├── components/             # Reusable UI components
│   └── types/                  # TypeScript types
├── docs/
│   ├── adr/                    # Architecture Decision Records
│   ├── prompt-logs/            # Per-member AI prompt logs
│   │   └── developer/
│   │       └── prompt-log.md
│   ├── standups/               # Weekly standup notes
│   ├── wireframes/             # UI wireframes
│   └── test-cases/             # QA test cases
├── assets/                     # Images, fonts, icons
├── CHANGELOG.md
├── CONTRIBUTING.md
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Expo Go app on your mobile device
- A Supabase project

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
| **Officer / Admin** | Record violations, view all records, manage students |
| **Student** | View own violation history and status |

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
| RenceChi | Project Manager |
| prismic7 | Full-Stack Developer |
| ZyCallado | QA & Documentation Lead |
| pwecii | UX/UI Designer |
| Jax-rgb | Knowledge Management Analyst |

---

## Contribution Evidence

- Each member works on their own `feature/*` branch
- All PRs target `dev` before merging to `main`
- Prompt logs are in `/docs/prompt-logs/(role)/prompt-log.md`
- Architecture decisions are documented in `/docs/adr/`

---

## Deployment

_To be documented in Sprint 2._

---

## License

For academic use only — New Era University, AY 2025–2026.