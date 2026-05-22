-- ============================================================================
-- Product Audit Studio — initial schema
-- ============================================================================
-- Run with the Supabase CLI (`supabase db push`) or paste into the SQL editor.

-- Required extensions ---------------------------------------------------------
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- profiles: one row per auth user, holds app-level user settings.
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  full_name    text,
  company      text,
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Profiles are updatable by owner" on public.profiles;
create policy "Profiles are updatable by owner"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Profiles are insertable by owner" on public.profiles;
create policy "Profiles are insertable by owner"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- audits: the core entity. profile/answers/attachments/report are JSONB so the
-- questionnaire can evolve without migrations.
-- ----------------------------------------------------------------------------
create table if not exists public.audits (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  title        text not null default 'Untitled audit',
  status       text not null default 'draft'
                 check (status in ('draft','in_progress','generating','completed')),
  profile      jsonb not null default '{}'::jsonb,
  answers      jsonb not null default '{}'::jsonb,
  attachments  jsonb not null default '[]'::jsonb,
  report       jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists audits_user_id_idx on public.audits (user_id);
create index if not exists audits_status_idx on public.audits (status);
create index if not exists audits_updated_at_idx on public.audits (updated_at desc);

alter table public.audits enable row level security;

drop policy if exists "Users can view their own audits" on public.audits;
create policy "Users can view their own audits"
  on public.audits for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own audits" on public.audits;
create policy "Users can insert their own audits"
  on public.audits for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own audits" on public.audits;
create policy "Users can update their own audits"
  on public.audits for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their own audits" on public.audits;
create policy "Users can delete their own audits"
  on public.audits for delete
  using (auth.uid() = user_id);

-- Keep updated_at fresh on every write.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists audits_set_updated_at on public.audits;
create trigger audits_set_updated_at
  before update on public.audits
  for each row execute function public.set_updated_at();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Storage bucket for screenshot uploads (private; RLS-scoped to owner folder).
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('audit-uploads', 'audit-uploads', false)
on conflict (id) do nothing;

drop policy if exists "Users manage own uploads (select)" on storage.objects;
create policy "Users manage own uploads (select)"
  on storage.objects for select
  using (
    bucket_id = 'audit-uploads'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users manage own uploads (insert)" on storage.objects;
create policy "Users manage own uploads (insert)"
  on storage.objects for insert
  with check (
    bucket_id = 'audit-uploads'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users manage own uploads (delete)" on storage.objects;
create policy "Users manage own uploads (delete)"
  on storage.objects for delete
  using (
    bucket_id = 'audit-uploads'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
