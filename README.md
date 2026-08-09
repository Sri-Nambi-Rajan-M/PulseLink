# PulseLink — Intelligent Blood Redistribution Platform (Tamil Nadu Network)

PulseLink helps blood banks move units before they expire and prevents shortages
at other banks in the network, using:

1. A **rule-based, weighted redistribution engine** — matches surplus (expiring)
   inventory at one bank to deficit (shortage-risk) inventory at another, using
   expiry urgency, deficit urgency, distance feasibility, and blood-type
   compatibility.
2. A **statistical shortage-forecasting engine** — projects, per blood bank and
   blood group, how many units will be needed over the next 24–72 hours from
   60 days of consumption trend (EWMA + linear regression), and flags predicted
   stockouts before they happen — not just current low stock.

The network is modeled on real Tamil Nadu geography: 10 blood banks across
Coimbatore, Tiruppur, Erode, Salem, Namakkal, Tiruchengode, Karur,
Tiruchirappalli, Madurai, and Chennai, with accurate coordinates.

This repo has two parts:

- **Frontend** — TanStack Start / React (this root folder)
- **Backend** — Express + MongoDB (in `backend/`)

## Quickstart (one-time setup, then one command)

```bash
# 1. Install dependencies for both frontend and backend
npm run setup

# 2. Run everything (frontend + backend, one terminal)
npm run dev
```

Open **http://localhost:3000** and sign in with the demo admin account below —
the backend runs on **http://localhost:5000**.

### What happens automatically

- The backend uses a **zero-setup, in-memory MongoDB** by default — no Docker,
  no local `mongod`, no Atlas account needed. It downloads a small MongoDB
  binary the first time you run it and caches it, so subsequent runs (even
  offline) are instant.
  > 💡 **Before your hackathon demo**, run `npm run dev` once while you have
  > internet access so the binary is cached locally — then it'll work even on
  > flaky venue wifi.
- On first boot, if the database is empty, it's **automatically seeded** with
  realistic demo data: 10 Tamil Nadu blood banks, ~90 inventory records with a
  healthy mix of expiring/long-dated stock, 60 days of daily consumption
  history per bank/blood-group feeding the forecast engine, AI-generated
  redistribution recommendations, and a few pre-approved transfers — so the
  dashboard looks "alive" the moment you sign in. No manual seed step required.
- Approving/rejecting a recommendation anywhere in the app (Dashboard or
  Operations Center) updates inventory, transfers, analytics, and the
  recommendation list everywhere at once — like a real production app.

### Using a real database instead (optional)

If you'd rather point at a persistent database (e.g. MongoDB Atlas), set
`MONGODB_URI` in `backend/.env` to your connection string — the app detects
it automatically and skips the in-memory database.

## Manual / advanced commands

```bash
npm run dev:client        # frontend only (vite dev)
npm run dev:server        # backend only
npm --prefix backend run seed   # force re-seed demo data (only needed for a real/persistent DB)
npm run build              # production frontend build
```

## AI layer (optional)

Two features call an LLM (Groq, free tier) and are fully optional — the app
works without them, falling back to plain rule-based text:

- **AI-enhanced recommendation explanations** — "Explain with AI" on any
  recommendation in the Operations Center turns its computed factors (expiry
  urgency, deficit, distance, confidence breakdown) into a written
  explanation. Cached after the first call.
- **"Ask PulseLink" copilot** — a chat widget, answers grounded in a live
  snapshot of network data (stock, shortage forecasts, pending
  recommendations, recent transfers). It only answers from that snapshot.

To enable: set `GROQ_API_KEY` in `backend/.env` (get one free at
console.groq.com/keys, no card required). `GROQ_MODEL` defaults to
`llama-3.3-70b-versatile`. Without a key, "Explain with AI" shows the
existing rule-based reason and the copilot says it isn't configured —
neither path errors out.

The LLM is only used for language — turning computed numbers into prose, or
answering from already-fetched data. Redistribution decisions
(`recommendationService.js`) and shortage predictions (`forecastService.js`)
are deterministic math, not LLM output.

## Login

The app is now gated behind real JWT auth — every screen requires signing in.
A demo admin account is auto-seeded:

- Email: `admin@pulselink.com`
- Password: `admin123`

Sign-in issues a 7-day JWT stored client-side; the token is attached to every
API request and a 401 response automatically signs you out and returns you to
`/login`.

