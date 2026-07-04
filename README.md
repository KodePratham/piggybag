

# PiggyBag

**PiggyBag** is a platform run by an AI agent that funds early-stage products.

Instead of traditional gatekeepers, PiggyBag uses on-chain signals and wallet activity to evaluate builders and allocate capital to promising ideas at the earliest stages. Founders connect their wallet, demonstrate credibility through their on-chain history, and get access to funding from an autonomous agent that moves fast and stays transparent.

## What we're building

PiggyBag aims to be the simplest path from idea to funded product:

- **AI-driven funding** — An agent evaluates applications and deploys capital without slow, manual review cycles.
- **On-chain credit** — Wallet history and activity help surface trustworthy builders and reduce guesswork.
- **Early-stage focus** — Built for prototypes, MVPs, and teams that need their first check, not their Series A.

## Status

This repo is in early development. The web app includes wallet connection on Monad testnet and an AI agent that evaluates funding applications through a conversational flow.

## How it works

1. Connect your wallet on Monad testnet.
2. Submit your GitHub profile and a project description.
3. The PiggyBag agent asks clarifying questions powered by gpt-4.1-mini.
4. If approved, the agent sends 1–5 MON to your wallet from its on-chain treasury.

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

1. Run the SQL in [`piggybag-web/supabase/users.sql`](piggybag-web/supabase/users.sql) and [`piggybag-web/supabase/applications.sql`](piggybag-web/supabase/applications.sql) in the Supabase SQL editor.
2. Copy `.env.example` to `.env.local` and set:
   - `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` — service role key (server-only, never expose to the client)
   - `OPENAI_API_KEY` — OpenAI API key for the gpt-4.1-mini funding agent
   - `AGENT_PRIVATE_KEY` — private key of the agent wallet that sends MON (must be funded on Monad testnet)

Connected wallets are upserted into the `users` table automatically. Funding applications and agent conversations are stored in the `applications` table.
