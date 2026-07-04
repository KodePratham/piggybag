create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null,
  github text not null,
  description text not null,
  status text not null default 'gathering',
  amount_mon numeric,
  tx_hash text,
  conversation jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists applications_wallet_address_idx on public.applications (wallet_address);

alter table public.applications enable row level security;
