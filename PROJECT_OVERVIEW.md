# PulseLink — Project Overview

A quick top-to-bottom explainer for the team. Read this before the demo.

## What it does

PulseLink is a blood-bank redistribution platform for Tamil Nadu. Ten blood
banks, each tracking stock by blood group and component. The system:

1. **Predicts shortages** before they happen, from consumption trends (not
   just current stock).
2. **Recommends transfers** — moves surplus units about to expire at one
   bank to another bank that's running low, before they're wasted.
3. **Explains itself in plain language**, and answers operator questions
   through a chat copilot — both grounded in real backend data.

## Stack

- **Frontend**: React (TanStack Start), TanStack Query for data fetching,
  Tailwind + shadcn/ui for components.
- **Backend**: Node/Express, MongoDB (Mongoose). Runs against an in-memory
  MongoDB by default — zero setup, resets on restart. Point `MONGODB_URI` at
  a real database (e.g. Atlas) for persistence.
- **Auth**: JWT, stored client-side in `localStorage` (see `src/lib/auth.ts`) and
  sent as a `Bearer` header on every request (see `src/lib/api.ts`). Note: this
  is *not* an httpOnly cookie, so the token is readable by any script running
  on the page — acceptable for a hackathon demo, but before a real deployment
  this should move to an httpOnly cookie to reduce XSS exposure.
- **AI**: Groq's free API (Llama 3.3 70B) for two optional features — see
  below. Nothing else in the app depends on AI; every core feature is
  deterministic.

## How a transfer recommendation actually gets made

This is the part worth understanding before anyone explains it to a judge.

**`backend/src/services/forecastService.js`** — looks at each bank's last
~60 days of usage per blood group, computes a smoothed burn rate (EWMA) and
a trend (linear regression), and projects demand forward. This is what
flags "Bank X will likely run short on O- in 2 days" *before* it's already
short.

**`backend/src/services/recommendationService.js`** — the actual matching
engine. For every batch nearing expiry at one bank, it scores every other
bank's need for that blood group on four factors (expiry urgency, deficit
urgency, distance, blood-type match) and proposes a transfer if the
combined score clears a threshold.

**Both of these are plain math — no LLM involved.** That's deliberate: you
don't want an AI model deciding whether blood physically moves between
cities. The LLM is used one layer up, purely for language:

**`backend/src/services/llmService.js`** — takes a recommendation's already-
computed numbers and turns them into a written explanation ("Explain with
AI" button), or answers free-text operator questions grounded in a live
data snapshot ("Ask PulseLink" chat). If `GROQ_API_KEY` isn't set, both
features fall back to the existing rule-based text — nothing breaks.

## Backend layout

```
backend/src/
├── models/        BloodBank, Inventory, Recommendation, Transfer,
│                  UsageHistory, User
├── controllers/   one per resource — dashboard, bloodBank, inventory,
│                  recommendation, transfer, analytics, forecast, copilot, auth
├── routes/        matching route files, all behind JWT auth
├── services/      recommendationService, forecastService, llmService
└── config/seed.js auto-seeds TN banks + inventory + 60 days of usage history
```

## Frontend layout

```
src/
├── routes/        login, index (dashboard), operations, inventory, banks,
│                  transfers, analytics, notifications, settings, profile
├── components/     app-layout (sidebar/topbar/auth), copilot-widget, ui/
└── lib/            api.ts, auth.ts, utils.ts
```

## What's real vs. static (know this before a demo)

| Page | Status |
|---|---|
| Login | Real JWT auth |
| Dashboard | Real, live data |
| Operations Center | Real — approve/reject/generate/explain |
| Inventory | Real CRUD |
| Blood Banks | Real CRUD |
| Transfers | Real |
| Analytics + AI Forecast | Real |
| Settings / Profile / Notifications | Static — no backend calls, cosmetic only |

If a judge clicks Settings or Profile expecting the same depth as
Operations Center, it'll be visibly thinner — steer the demo through
Login → Operations Center → Analytics → Copilot, which is the fully real
path.

## Running it

```bash
npm run setup        # installs frontend + backend deps
npm run dev           # runs both concurrently
```

Optional: set `GROQ_API_KEY` in `backend/.env` (free at
console.groq.com/keys) to enable the two AI features. Everything else works
without it.

## Known limitations (be ready to answer these if asked)

- In-memory DB by default — data resets on restart unless `MONGODB_URI`
  points at a real database.
- No automated test suite.
- No pagination — fine at demo scale (~100-300 records per collection).
- Copilot answers aren't cached or streamed; each question is a live call.
