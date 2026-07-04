

# PiggyBag

**PiggyBag** is a platform run by an AI agent that funds early-stage products.

Instead of traditional gatekeepers, PiggyBag uses on-chain signals and wallet activity to evaluate builders and allocate capital to promising ideas at the earliest stages. Founders connect their wallet, demonstrate credibility through their on-chain history, and get access to funding from an autonomous agent that moves fast and stays transparent.

## What we're building

PiggyBag aims to be the simplest path from idea to funded product:

- **AI-driven funding** — An agent evaluates applications and deploys capital without slow, manual review cycles.
- **On-chain credit** — Wallet history and activity help surface trustworthy builders and reduce guesswork.
- **Early-stage focus** — Built for prototypes, MVPs, and teams that need their first check, not their Series A.

## Status

This repo is in early development. The web app currently includes wallet connection on Monad testnet and a wallet credit score based on transaction history.

## Project structure

```
piggybag/
├── PiggyBag.png      # Brand assets
└── piggybag-web/     # Next.js frontend
```

## Getting started

```bash
cd piggybag-web
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Supabase setup

1. Run the SQL in [`piggybag-web/supabase/users.sql`](piggybag-web/supabase/users.sql) in the Supabase SQL editor.
2. Copy `.env.example` to `.env.local` and set:
   - `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` — service role key (server-only, never expose to the client)

Connected wallets are upserted into the `users` table automatically.
