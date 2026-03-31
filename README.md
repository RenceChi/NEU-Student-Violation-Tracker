# NEU Student Violation Tracker

A cross-platform mobile application that digitizes the Nueva Ecija University (NEU) student violation form and provides real-time visibility for both officers and students.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile App | React Native (Expo SDK 54) |
| Navigation | Expo Router + React Navigation v7 |
| Backend / Auth / DB | Supabase |
| Styling | NativeWind (Tailwind CSS for RN) |
| Language | TypeScript |

---

## Project Structure

```
neu-violation-app/
├── app/                        # Expo Router screens
│   ├── (officer)/              # Officer route group
│   │   ├── _layout.tsx
│   │   └── dashboard.tsx
│   ├── (student)/              # Student route group
│   │   └── _layout.tsx
│   ├── _layout.tsx             # Root layout
│   ├── index.tsx               # Entry redirect
│   └── login.tsx               # Login screen
├── src/
│   ├── context/                # React context (Auth, etc.)
│   ├── components/             # Reusable UI components
│   ├── screens/                # Additional screen components
│   ├── lib/                    # Supabase client + utilities
│   ├── navigation/             # Navigation helpers
│   └── types/                  # TypeScript types
├── docs/
│   ├── adr/                    # Architecture Decision Records
│   └── standups/               # Weekly standup notes
├── tests/                      # Test files
├── assets/                     # Images, fonts, icons
├── CHANGELOG.md
├── CONTRIBUTING.md
└── prompt-log.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your mobile device
- A Supabase project

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/RenceChi/NEU-Student-Violation-Tracker.git
cd neu-violation-app

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Set up environment variables
cp .env.example .env
# Fill in your Supabase URL and anon key in .env

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

## Deployment

_To be documented in Sprint 2._

---

## Team

| Member | Role |
|---|---|
| prismic7 | Full-Stack Developer |
| ZyCallado | Backend / Supabase |
| pwecii | UX/UI Designer |
| Jax-rgb | QA / Policy |

---

## License

For academic use only — Nueva Ecija University, AY 2025–2026.
