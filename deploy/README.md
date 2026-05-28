# SquadGod — Vercel deploy folder

Plain static frontend + serverless API. No monorepo, no pnpm, no build step.

## Vercel project settings

- **Root Directory**: `deploy`
- **Framework Preset**: Other
- **Build Command**: (leave empty)
- **Output Directory**: `.`
- **Install Command**: `npm install` (only installs the two deps needed by `api/`)

## Env vars (Vercel → Project → Settings → Environment Variables)

- `ANTHROPIC_API_KEY` — required by `api/gaffer.js` and `api/commentary.js`
- `DATABASE_URL` — required by `api/matches.js`

## Layout

- `index.html`, `assets/`, `favicon.svg`, `opengraph.jpg`, `robots.txt` — pre-built Vite output
- `api/*.js` — Vercel serverless functions (Node 20, auto-detected, no build)
- `vercel.json` — caching headers + function runtime; `buildCommand: null`
