-- Run this once in Supabase → SQL Editor.

create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  author text not null check (author in ('Alec', 'Sullivan', 'Jack', 'Patrick')),
  day date not null check (day between '2026-10-19' and '2026-10-28'),
  body text not null default '',
  photos text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.entries(id) on delete cascade,
  author text not null check (author in ('Alec', 'Sullivan', 'Jack', 'Patrick')),
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists entries_day_idx on public.entries (day);
create index if not exists comments_entry_idx on public.comments (entry_id);

-- Lock both tables down. With RLS on and no policies, only the server
-- (service role key, behind the trip passcode) can read or write.
alter table public.entries enable row level security;
alter table public.comments enable row level security;

-- Public bucket for photos. File names are random UUIDs, so a photo is only
-- reachable by someone who already has its link. Uploads only happen through
-- one-time signed URLs the server hands out after checking the passcode.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('trip-photos', 'trip-photos', true, 15728640, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
