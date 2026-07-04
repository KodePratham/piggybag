![PiggyBag](./PiggyBag.png)

# PiggyBag

**PiggyBag** is an AI agent that funds early-stage builders on [Monad](https://monad.xyz). Instead of traditional gatekeepers, PiggyBag uses on-chain signals and wallet activity to evaluate founders and allocate capital to promising ideas at the earliest stages.

Connect your wallet, share your GitHub and project details, and get a funding decision from an autonomous agent — in minutes, not months.

## What we're building

PiggyBag aims to be the simplest path from idea to funded product:

- **AI-driven funding** — An agent evaluates applications and deploys capital without slow, manual review cycles.
- **On-chain credit** — Wallet history and activity help surface trustworthy builders and reduce guesswork.
- **Early-stage focus** — Built for prototypes, MVPs, and teams that need their first check, not their Series A.
- **Monad Blitz rewards** — Hackathon builders can claim 10,000 $BLITZ memecoins for their Monad Blitz submissions.

## How it works

### Apply for funding

1. Connect your wallet on Monad testnet.
2. Submit your GitHub profile and a project description.
3. The PiggyBag agent asks clarifying questions powered by gpt-4.1-mini.
4. If approved, the agent sends 1–5 MON to your wallet from its on-chain treasury.

### Claim $BLITZ (Monad Blitz)

1. Connect your wallet on Monad testnet.
2. Submit your Monad Blitz project (one per wallet).
3. Receive 10,000 $BLITZ instantly, plus a compliment from the agent on your build.

## Tech stack

- **Frontend** — Next.js 16, React 19, Tailwind CSS, wagmi / viem
- **Backend** — Next.js API routes, Supabase (Postgres)
- **AI** — OpenAI gpt-4.1-mini for application evaluation
- **Chain** — Monad testnet (MON funding + $BLITZ ERC-20 token)

## Project structure

```
piggybag/
├── PiggyBag.png          # Brand assets
└── piggybag-web/         # Next.js app
    ├── app/              # Pages and API routes
    ├── components/       # UI components
    ├── contracts/        # Blitz.sol token contract
    ├── lib/              # Agent, funding, Supabase helpers
    ├── scripts/          # Blitz token deployment
    └── supabase/         # Database schema
```

## Getting started

```bash
cd piggybag-web
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Environment variables

Copy `.env.example` to `.env.local` and set:

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-only) |
| `OPENAI_API_KEY` | OpenAI API key for the funding agent |
| `AGENT_PRIVATE_KEY` | Private key of the agent wallet that sends MON (must be funded on Monad testnet) |
| `MONAD_RPC_URL` | Monad testnet RPC URL |
| `BLITZ_TOKEN_ADDRESS` | Deployed $BLITZ token contract address |
| `NEXT_PUBLIC_BLITZ_TOKEN_ADDRESS` | Same address, exposed to the client for wallet imports |

### Supabase setup

Run the SQL files in the Supabase SQL editor:

- [`piggybag-web/supabase/users.sql`](piggybag-web/supabase/users.sql) — connected wallets
- [`piggybag-web/supabase/users_profile.sql`](piggybag-web/supabase/users_profile.sql) — user profiles and handles
- [`piggybag-web/supabase/applications.sql`](piggybag-web/supabase/applications.sql) — funding applications and agent conversations
- [`piggybag-web/supabase/blitz_projects.sql`](piggybag-web/supabase/blitz_projects.sql) — Monad Blitz submissions

Connected wallets are upserted into the `users` table automatically. Funding applications and agent conversations are stored in the `applications` table.

### Deploy $BLITZ token

```bash
cd piggybag-web
bun run deploy:blitz
```

## Status

Early development. Live on Monad testnet with wallet connection, AI funding applications, and Monad Blitz $BLITZ claims.
