-- Activer l'extension uuid
create extension if not exists "uuid-ossp";

-- ── Profils utilisateurs ──────────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  pseudo      text,
  age         integer,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique(user_id)
);

alter table public.profiles enable row level security;
create policy "Users can view own profile"   on public.profiles for select using (auth.uid() = user_id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = user_id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = user_id);

-- ── Scans ─────────────────────────────────────────────────────────────────────
create table if not exists public.scans (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  scan_id     text not null,
  scores      jsonb not null,
  created_at  timestamptz not null default now(),
  unique(scan_id)
);

alter table public.scans enable row level security;
create policy "Users can view own scans"   on public.scans for select using (auth.uid() = user_id);
create policy "Users can insert own scans" on public.scans for insert with check (auth.uid() = user_id);
create policy "Users can delete own scans" on public.scans for delete using (auth.uid() = user_id);
create policy "Users can update own scans" on public.scans for update using (auth.uid() = user_id);

-- ── Abonnements ───────────────────────────────────────────────────────────────
create table if not exists public.subscriptions (
  id                      uuid primary key default uuid_generate_v4(),
  user_id                 uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id      text,
  stripe_subscription_id  text,
  status                  text not null default 'inactive',
  price_id                text,
  current_period_end      timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  unique(user_id)
);

-- La table subscriptions est mise à jour uniquement par le webhook (service_role)
alter table public.subscriptions enable row level security;
create policy "Users can view own subscription" on public.subscriptions for select using (auth.uid() = user_id);
