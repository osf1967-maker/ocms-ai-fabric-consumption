-- OCMS Fabric Consumption SaaS V10
-- Run in a dedicated Supabase project. Uses auth.users and Row Level Security.

create extension if not exists pgcrypto;

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid references public.tenants(id) on delete set null,
  full_name text,
  role text not null default 'merchandiser' check (role in ('owner','admin','manager','merchandiser','cad','viewer')),
  created_at timestamptz not null default now()
);

create table if not exists public.calculations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tenant_id uuid references public.tenants(id) on delete set null,
  buyer text,
  style_ref text,
  season text,
  style_name text not null,
  gsm numeric,
  wastage_pct numeric,
  status text not null default 'PRIMARY'
    check (status in ('DRAFT','PRIMARY','INPUT_REQUIRED','REVISED','MERCH_APPROVED','CAD_PENDING','CAD_VALIDATED','FINAL_APPROVED','REJECTED','SUPERSEDED')),
  primary_kg_dz numeric,
  revised_kg_dz numeric,
  cad_kg_dz numeric,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_calculations_user_created on public.calculations(user_id, created_at desc);
create index if not exists idx_calculations_tenant on public.calculations(tenant_id);

create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  calculation_id uuid references public.calculations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  old_status text,
  new_status text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.tenants enable row level security;
alter table public.profiles enable row level security;
alter table public.calculations enable row level security;
alter table public.audit_log enable row level security;

drop policy if exists "profiles_read_own" on public.profiles;
create policy "profiles_read_own" on public.profiles for select using (user_id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "calculations_read_own" on public.calculations;
create policy "calculations_read_own" on public.calculations for select using (user_id = auth.uid());

drop policy if exists "calculations_insert_own" on public.calculations;
create policy "calculations_insert_own" on public.calculations for insert with check (user_id = auth.uid());

drop policy if exists "calculations_update_own" on public.calculations;
create policy "calculations_update_own" on public.calculations for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "calculations_delete_own" on public.calculations;
create policy "calculations_delete_own" on public.calculations for delete using (user_id = auth.uid());

drop policy if exists "audit_read_own" on public.audit_log;
create policy "audit_read_own" on public.audit_log for select using (user_id = auth.uid());

drop policy if exists "audit_insert_own" on public.audit_log;
create policy "audit_insert_own" on public.audit_log for insert with check (user_id = auth.uid());

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists calculations_touch_updated_at on public.calculations;
create trigger calculations_touch_updated_at before update on public.calculations
for each row execute function public.touch_updated_at();
