create table if not exists public.blitz_projects (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null,
  github text not null,
  description text not null,
  working_link text,
  status text not null default 'sent',
  amount_blitz numeric,
  tx_hash text,
  compliment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.blitz_projects enable row level security;

alter table public.blitz_projects
  add column if not exists compliment text;

create unique index if not exists blitz_projects_wallet_address_unique
  on public.blitz_projects (wallet_address);
