-- =============================================================================
-- Poko Planner — Phase 1
-- Migration 0001: Core 6 Tables, Indexes, updated_at Triggers, and Strict RLS
-- =============================================================================
-- Auth model: Clerk Native Third-Party Auth
-- Identity claim: ((select auth.jwt()) ->> 'sub')
-- Wrapping auth.jwt() inside (select ...) ensures Postgres InitPlan caching
-- (0 `auth_rls_initplan` Performance Advisor warnings).
-- =============================================================================

-- 1. Shared updated_at trigger function (immutable search_path for Security Advisor)
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2. Core Tables

-- 2.1 profiles
create table if not exists public.profiles (
  id text primary key default ((select auth.jwt()) ->> 'sub'),
  display_name text not null default '',
  handle text not null default '',
  blobatar_seed text not null default 'poko',
  blobatar_mood text not null default 'happy',
  blobatar_frame text not null default 'default',
  monthly_budget_limit bigint not null default 0 check (monthly_budget_limit >= 0),
  xp integer not null default 0 check (xp >= 0),
  level integer not null default 1 check (level >= 1),
  privacy_mode boolean not null default false,
  sfx_enabled boolean not null default true,
  ai_insight_cache jsonb,
  ai_insight_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2.2 wallets
create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default ((select auth.jwt()) ->> 'sub'),
  name text not null,
  wallet_type text not null default 'cash',
  balance bigint not null default 0,
  color text not null default '#FDE047',
  icon text not null default 'wallet',
  is_primary_savings boolean not null default false,
  is_archived boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint wallets_user_id_fkey
    foreign key (user_id) references public.profiles(id) on delete cascade
);

-- 2.3 transactions
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default ((select auth.jwt()) ->> 'sub'),
  wallet_id uuid not null,
  destination_wallet_id uuid,
  type text not null check (type in ('income', 'expense', 'transfer')),
  amount bigint not null check (amount > 0),
  category text not null default 'other',
  merchant text,
  note text not null default '',
  source text not null default 'manual',
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint transactions_user_id_fkey
    foreign key (user_id) references public.profiles(id) on delete cascade,
  constraint transactions_wallet_id_fkey
    foreign key (wallet_id) references public.wallets(id) on delete cascade,
  constraint transactions_destination_wallet_id_fkey
    foreign key (destination_wallet_id) references public.wallets(id) on delete set null
);

-- 2.4 dreams
create table if not exists public.dreams (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default ((select auth.jwt()) ->> 'sub'),
  linked_wallet_id uuid,
  title text not null,
  emoji text not null default '✨',
  category text not null default 'goal',
  target_amount bigint not null check (target_amount > 0),
  target_date date,
  priority integer not null default 0,
  status text not null default 'active' check (status in ('active', 'achieved', 'archived')),
  achieved_at timestamptz,
  memoire_photo_path text,
  memoire_caption text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dreams_user_id_fkey
    foreign key (user_id) references public.profiles(id) on delete cascade,
  constraint dreams_linked_wallet_id_fkey
    foreign key (linked_wallet_id) references public.wallets(id) on delete set null
);

-- 2.5 challenges
create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default ((select auth.jwt()) ->> 'sub'),
  code text not null,
  title text not null,
  description text not null default '',
  period_key text not null,
  target_progress integer not null default 1 check (target_progress > 0),
  current_progress integer not null default 0 check (current_progress >= 0),
  xp_reward integer not null default 50 check (xp_reward >= 0),
  status text not null default 'active' check (status in ('active', 'completed', 'expired')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint challenges_user_id_fkey
    foreign key (user_id) references public.profiles(id) on delete cascade,
  constraint challenges_user_code_period_unique
    unique (user_id, code, period_key)
);

-- 2.6 monthly_budget_logs
create table if not exists public.monthly_budget_logs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default ((select auth.jwt()) ->> 'sub'),
  month_key text not null,
  budget_limit bigint not null check (budget_limit >= 0),
  total_expense bigint not null default 0 check (total_expense >= 0),
  is_safe boolean generated always as (total_expense <= budget_limit) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint monthly_budget_logs_user_id_fkey
    foreign key (user_id) references public.profiles(id) on delete cascade,
  constraint monthly_budget_logs_user_month_unique
    unique (user_id, month_key)
);

-- 3. Indexes (9 indexes covering all foreign keys and primary query paths)
create index if not exists idx_wallets_user_id_sort
  on public.wallets (user_id, sort_order);

create index if not exists idx_transactions_user_id_occurred_at
  on public.transactions (user_id, occurred_at desc);

create index if not exists idx_transactions_wallet_id
  on public.transactions (wallet_id);

create index if not exists idx_transactions_destination_wallet_id
  on public.transactions (destination_wallet_id)
  where destination_wallet_id is not null;

create index if not exists idx_transactions_user_id_category
  on public.transactions (user_id, category);

create index if not exists idx_dreams_user_id_status
  on public.dreams (user_id, status, priority);

create index if not exists idx_dreams_linked_wallet_id
  on public.dreams (linked_wallet_id)
  where linked_wallet_id is not null;

create index if not exists idx_challenges_user_id_period
  on public.challenges (user_id, period_key);

create index if not exists idx_monthly_budget_logs_user_id_month
  on public.monthly_budget_logs (user_id, month_key desc);

-- 4. updated_at Triggers (6 triggers)
drop trigger if exists trg_profiles_set_updated_at on public.profiles;
create trigger trg_profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_wallets_set_updated_at on public.wallets;
create trigger trg_wallets_set_updated_at
  before update on public.wallets
  for each row execute function public.set_updated_at();

drop trigger if exists trg_transactions_set_updated_at on public.transactions;
create trigger trg_transactions_set_updated_at
  before update on public.transactions
  for each row execute function public.set_updated_at();

drop trigger if exists trg_dreams_set_updated_at on public.dreams;
create trigger trg_dreams_set_updated_at
  before update on public.dreams
  for each row execute function public.set_updated_at();

drop trigger if exists trg_challenges_set_updated_at on public.challenges;
create trigger trg_challenges_set_updated_at
  before update on public.challenges
  for each row execute function public.set_updated_at();

drop trigger if exists trg_monthly_budget_logs_set_updated_at on public.monthly_budget_logs;
create trigger trg_monthly_budget_logs_set_updated_at
  before update on public.monthly_budget_logs
  for each row execute function public.set_updated_at();

-- 5. Enable Row Level Security (6 tables)
alter table public.profiles enable row level security;
alter table public.wallets enable row level security;
alter table public.transactions enable row level security;
alter table public.dreams enable row level security;
alter table public.challenges enable row level security;
alter table public.monthly_budget_logs enable row level security;

-- 6. Strict Per-User RLS Policies (24 policies: SELECT/INSERT/UPDATE/DELETE x 6 tables)

-- 6.1 profiles (4 policies)
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (id = ((select auth.jwt()) ->> 'sub'));

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (id = ((select auth.jwt()) ->> 'sub'));

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (id = ((select auth.jwt()) ->> 'sub'))
  with check (id = ((select auth.jwt()) ->> 'sub'));

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own"
  on public.profiles
  for delete
  to authenticated
  using (id = ((select auth.jwt()) ->> 'sub'));

-- 6.2 wallets (4 policies)
drop policy if exists "wallets_select_own" on public.wallets;
create policy "wallets_select_own"
  on public.wallets
  for select
  to authenticated
  using (user_id = ((select auth.jwt()) ->> 'sub'));

drop policy if exists "wallets_insert_own" on public.wallets;
create policy "wallets_insert_own"
  on public.wallets
  for insert
  to authenticated
  with check (user_id = ((select auth.jwt()) ->> 'sub'));

drop policy if exists "wallets_update_own" on public.wallets;
create policy "wallets_update_own"
  on public.wallets
  for update
  to authenticated
  using (user_id = ((select auth.jwt()) ->> 'sub'))
  with check (user_id = ((select auth.jwt()) ->> 'sub'));

drop policy if exists "wallets_delete_own" on public.wallets;
create policy "wallets_delete_own"
  on public.wallets
  for delete
  to authenticated
  using (user_id = ((select auth.jwt()) ->> 'sub'));

-- 6.3 transactions (4 policies)
drop policy if exists "transactions_select_own" on public.transactions;
create policy "transactions_select_own"
  on public.transactions
  for select
  to authenticated
  using (user_id = ((select auth.jwt()) ->> 'sub'));

drop policy if exists "transactions_insert_own" on public.transactions;
create policy "transactions_insert_own"
  on public.transactions
  for insert
  to authenticated
  with check (user_id = ((select auth.jwt()) ->> 'sub'));

drop policy if exists "transactions_update_own" on public.transactions;
create policy "transactions_update_own"
  on public.transactions
  for update
  to authenticated
  using (user_id = ((select auth.jwt()) ->> 'sub'))
  with check (user_id = ((select auth.jwt()) ->> 'sub'));

drop policy if exists "transactions_delete_own" on public.transactions;
create policy "transactions_delete_own"
  on public.transactions
  for delete
  to authenticated
  using (user_id = ((select auth.jwt()) ->> 'sub'));

-- 6.4 dreams (4 policies)
drop policy if exists "dreams_select_own" on public.dreams;
create policy "dreams_select_own"
  on public.dreams
  for select
  to authenticated
  using (user_id = ((select auth.jwt()) ->> 'sub'));

drop policy if exists "dreams_insert_own" on public.dreams;
create policy "dreams_insert_own"
  on public.dreams
  for insert
  to authenticated
  with check (user_id = ((select auth.jwt()) ->> 'sub'));

drop policy if exists "dreams_update_own" on public.dreams;
create policy "dreams_update_own"
  on public.dreams
  for update
  to authenticated
  using (user_id = ((select auth.jwt()) ->> 'sub'))
  with check (user_id = ((select auth.jwt()) ->> 'sub'));

drop policy if exists "dreams_delete_own" on public.dreams;
create policy "dreams_delete_own"
  on public.dreams
  for delete
  to authenticated
  using (user_id = ((select auth.jwt()) ->> 'sub'));

-- 6.5 challenges (4 policies)
drop policy if exists "challenges_select_own" on public.challenges;
create policy "challenges_select_own"
  on public.challenges
  for select
  to authenticated
  using (user_id = ((select auth.jwt()) ->> 'sub'));

drop policy if exists "challenges_insert_own" on public.challenges;
create policy "challenges_insert_own"
  on public.challenges
  for insert
  to authenticated
  with check (user_id = ((select auth.jwt()) ->> 'sub'));

drop policy if exists "challenges_update_own" on public.challenges;
create policy "challenges_update_own"
  on public.challenges
  for update
  to authenticated
  using (user_id = ((select auth.jwt()) ->> 'sub'))
  with check (user_id = ((select auth.jwt()) ->> 'sub'));

drop policy if exists "challenges_delete_own" on public.challenges;
create policy "challenges_delete_own"
  on public.challenges
  for delete
  to authenticated
  using (user_id = ((select auth.jwt()) ->> 'sub'));

-- 6.6 monthly_budget_logs (4 policies)
drop policy if exists "monthly_budget_logs_select_own" on public.monthly_budget_logs;
create policy "monthly_budget_logs_select_own"
  on public.monthly_budget_logs
  for select
  to authenticated
  using (user_id = ((select auth.jwt()) ->> 'sub'));

drop policy if exists "monthly_budget_logs_insert_own" on public.monthly_budget_logs;
create policy "monthly_budget_logs_insert_own"
  on public.monthly_budget_logs
  for insert
  to authenticated
  with check (user_id = ((select auth.jwt()) ->> 'sub'));

drop policy if exists "monthly_budget_logs_update_own" on public.monthly_budget_logs;
create policy "monthly_budget_logs_update_own"
  on public.monthly_budget_logs
  for update
  to authenticated
  using (user_id = ((select auth.jwt()) ->> 'sub'))
  with check (user_id = ((select auth.jwt()) ->> 'sub'));

drop policy if exists "monthly_budget_logs_delete_own" on public.monthly_budget_logs;
create policy "monthly_budget_logs_delete_own"
  on public.monthly_budget_logs
  for delete
  to authenticated
  using (user_id = ((select auth.jwt()) ->> 'sub'));
