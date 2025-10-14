-- Supabase schema for AI Flip Cards
-- Paste and run this script in the Supabase SQL editor (or execute via the CLI).

-- Decks table
create table if not exists public.decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  created_at timestamptz default now()
);

-- Cards table
create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.decks (id) on delete cascade,
  front jsonb not null,
  back jsonb not null,
  created_at timestamptz default now()
);

alter table public.decks enable row level security;
alter table public.cards enable row level security;

-- Policy: users manage their own decks
create policy if not exists "Users can manage their own decks"
  on public.decks
  for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Policy: users manage cards in their decks
create policy if not exists "Users can manage cards in their decks"
  on public.cards
  for all
  using (
    exists (
      select 1 from public.decks d
      where d.id = deck_id and d.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.decks d
      where d.id = deck_id and d.user_id = (select auth.uid())
    )
  );

-- Helpful indexes for policy lookups
create index if not exists idx_decks_user_id on public.decks (user_id);
create index if not exists idx_cards_deck_id on public.cards (deck_id);

-- Optional: profiles table for user metadata
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy if not exists "Users can manage their own profile"
  on public.profiles
  for all
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
