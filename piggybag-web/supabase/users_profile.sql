alter table public.users
  add column if not exists username text,
  add column if not exists display_name text,
  add column if not exists bio text,
  add column if not exists avatar_url text,
  add column if not exists github text,
  add column if not exists twitter text,
  add column if not exists linkedin text,
  add column if not exists is_public boolean not null default false;

create unique index if not exists users_username_lower_idx on public.users (lower(username));
