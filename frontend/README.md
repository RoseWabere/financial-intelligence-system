# Pesa Yako — Kenya Financial Intelligence Frontend

Next.js 14 (App Router) frontend for the Kenya Financial Intelligence System backend.

## Stack

- **Framework:** Next.js 14 (App Router, RSC + client components)
- **Styling:** Tailwind CSS + CSS variables (no component library dependency)
- **Fonts:** Fraunces (display, Google Fonts) + DM Sans (body, Google Fonts)
- **Icons:** Font Awesome 6 (CDN, `fas fa-*` only — no emojis)
- **Charts:** Recharts (allocation pie)
- **Toasts:** Sonner
- **HTTP:** Axios (with JWT interceptor, 429 rate-limit handling, 5xx backoff)

## Design Tokens

| Token | Value | Usage |
|---|---|---|
| `--clr-earth` | `#2C4A2E` | Primary brand, CTAs |
| `--clr-gold` | `#C9952A` | Accents, yield numbers |
| `--clr-sand` | `#F5EDD8` | Hero backgrounds, tags |
| `--clr-clay` | `#E8502A` | Scam flags, errors |
| `--clr-smoke` | `#F7F5F0` | Page background |
| `--font-display` | Fraunces | All h1–h3, numbers |
| `--font-body` | DM Sans | Body text, UI |

## Pages

| Route | Description |
|---|---|
| `/` | Landing — hero, features, trust bar |
| `/chat` | Full RAG chat interface with suggestions |
| `/plan` | Investment profile form → allocation plan |
| `/directory` | Investments + providers with filters |
| `/market` | NSE prices + CBK macro indicators |
| `/glossary` | Searchable financial terms (English + Kiswahili) |
| `/auth/login` | Login form (email or phone) |
| `/auth/register` | 2-step registration |

## Quickstart

```bash
cp .env.local.example .env.local
# Edit: set NEXT_PUBLIC_API_URL=http://localhost:8000

npm install
npm run dev
# Open http://localhost:3000
```

Backend must be running at `NEXT_PUBLIC_API_URL`. Start it with:
```bash
# In the kenyan-fintel/ backend directory:
docker compose up --build
```

## Improvements included

- **Session persistence** — `chat_session_id` in localStorage; survives page refresh
- **Rate limit handling** — 429 shows Sonner toast "Too many messages"
- **5xx retry** — exponential backoff (500ms, 1s, 2s) before giving up
- **Offline indicator** — fixed banner at top of page + graceful chat message
- **localStorage cache** — directory data cached per filter combo; shown on offline
- **Low confidence nudge** — `confidence < 0.5` shows "verify with CMA/CBK"
- **Skeleton loaders** — all async pages show shimmer skeletons while loading
- **Three scenario tabs** — plan page shows Conservative / Balanced / Growth variants
- **Dynamic SEO** — each page has Next.js `metadata` export with Kenya-specific keywords
- **Mobile-first** — responsive at 320px+, mobile nav drawer with stagger animation
- **No emojis** — Font Awesome icons only throughout

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set env var in Vercel dashboard:
# NEXT_PUBLIC_API_URL = https://your-backend.onrender.com
```

## CORS

Ensure your backend `.env` includes the Vercel URL:
```
CORS_ORIGINS=https://your-app.vercel.app
```
