# ✨ HealTrace

> Recovery tracking with context, clarity, and momentum.

HealTrace is a modern recovery companion for injuries and illnesses. Log updates, compare progress photos, monitor trends, and export clinician-friendly reports from one place.

<p align="left">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" />
  <img alt="React" src="https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
  <img alt="Node" src="https://img.shields.io/badge/Node-22.x-5FA04E?logo=node.js&logoColor=white" />
  <img alt="CI" src="https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white" />
</p>

---

## 🚀 Quick Navigation

- [Why HealTrace](#-why-healtrace)
- [Feature Highlights](#-feature-highlights)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Supabase Setup](#-supabase-setup)
- [Environment Variables](#-environment-variables)
- [Scripts](#-scripts)
- [CI Quality Gate](#-ci-quality-gate)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment-vercel)
- [Troubleshooting](#-troubleshooting)
- [Safety Notice](#-safety-notice)

## 🎯 Why HealTrace

Most recovery logs are scattered across notes, camera roll albums, and memory. HealTrace gives you a single workflow that makes recovery tracking easier to sustain and easier to review.

- Capture symptoms and pain changes over time
- Track treatment and activity impact
- Keep photo progress organized with side-by-side comparison
- Get AI-assisted context for better follow-up questions
- Export timelines in a clean report format

## 🌟 Feature Highlights

### Recovery Logging

- Injury and illness modes in one flow
- Structured updates with notes, pain, symptoms, and activity
- 3D body-part picker for quick localization

### Visual Progress

- Timeline gallery with date-stamped entries
- Before/after photo compare slider
- Wound area estimator with a paint-mask workflow

### Guidance and Insights

- Context-aware AI chat per injury/illness thread
- Daily nudge reminders and onboarding flow
- Trend-focused insights components (pain, pace, effectiveness)

### Reporting and Operations

- PDF export for provider-friendly summaries
- Supply inventory tracking for first-aid readiness
- User-scoped cloud sync with Supabase + RLS

## 🧱 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, Tailwind CSS v4
- **Language:** TypeScript
- **Backend:** Supabase (`auth`, Postgres, RLS)
- **Uploads:** UploadThing
- **AI:** Google Gemini API
- **Charts:** Recharts

## ⚡ Quick Start

### Prerequisites

- Node.js `22.x` (pinned in `.nvmrc`)
- npm `>=10`

### Setup (local)

1. Clone the repository.
2. Use the pinned runtime:

```bash
nvm use
```

3. Install dependencies:

```bash
npm ci
```

4. Create local env file:

```bash
cp .env.local.example .env.local
```

5. Fill in required env values.
6. Run `supabase_setup.sql` in your Supabase SQL editor.
7. Start the app:

```bash
npm run dev
```

8. Open `http://localhost:3000`.

## 🛡️ Supabase Setup

The `supabase_setup.sql` script creates:

- `injuries` table
- `logs` table
- Row Level Security policies enforcing per-user access

For Google sign-in on `/login`:

1. Enable Google provider in Supabase Auth.
2. Add your local/dev and production callback URLs.

## 🔐 Environment Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `GEMINI_API_KEY` | Yes | AI analysis in chat/actions |
| `UPLOADTHING_SECRET` | Yes | UploadThing server auth |
| `UPLOADTHING_APP_ID` | Yes | UploadThing app routing |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes (cloud mode) | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes (cloud mode) | Supabase anon key |

> If Supabase is not configured, core tracking still works in local mode.

## 🧪 Scripts

```bash
npm run dev        # start local dev server
npm run lint       # eslint (strict: zero warnings)
npm run typecheck  # TypeScript validation
npm run build      # production build
npm run start      # serve built app
```

## ✅ CI Quality Gate

Workflow: `.github/workflows/ci.yml`

Runs on every push + pull request:

- `npm ci`
- `npm run lint`
- `npm run typecheck`
- `npm run build`

## 🗂️ Project Structure

```text
src/
├── app/
│   ├── actions/          # server actions (AI analysis)
│   ├── api/uploadthing/  # upload route + file router
│   ├── chat/             # AI assistant page
│   ├── compare/          # before/after photo comparison
│   ├── gallery/          # image timeline and tools
│   ├── insights/         # trend and effectiveness views
│   ├── log/              # primary logging workflow
│   ├── login/            # auth entry
│   └── supplies/         # inventory view
├── components/
│   ├── injury/           # form and body mapping
│   ├── gallery/          # compare/annotate helpers
│   ├── insights/         # charts and analytics cards
│   ├── notifications/    # reminder controls
│   ├── report/           # PDF export components
│   └── supplies/         # supply manager
├── context/              # injury/supply providers
└── lib/                  # integrations and utilities
```

## 🚢 Deployment (Vercel)

1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Add the same environment variables from `.env.local`.
4. Deploy.

## 🧯 Troubleshooting

### Build fails with network/font-related issues

This project uses a local/system font stack and avoids runtime dependency on Google Fonts.

### `Supabase not configured` warning

Set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Upload failures

Double-check:

- `UPLOADTHING_SECRET`
- `UPLOADTHING_APP_ID`

### Auth redirect issues

Verify allowed redirect URLs in Supabase Auth settings (both local and production domains).

## ⚠️ Safety Notice

HealTrace is a tracking and organization tool, not a diagnostic system.
Always consult a licensed healthcare professional for medical decisions.
