-- ============================================================
-- ZenLink — Initial Schema
-- Run this in the Supabase Dashboard SQL Editor
-- ============================================================

-- Links table
create table if not exists links (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  url              text not null,
  title            text,
  favicon          text,
  tags             text[] not null default '{}',
  snoozed_until    timestamptz,
  on_next_session  boolean not null default false,
  created_at       timestamptz not null default now()
);

-- Row Level Security
alter table links enable row level security;

create policy "Users can manage their own links"
  on links
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Full-text search: trigger-maintained tsvector column + index
alter table links add column fts tsvector;

create function links_fts_update() returns trigger as $$
begin
  new.fts := to_tsvector('english', coalesce(new.title, '') || ' ' || array_to_string(new.tags, ' '));
  return new;
end;
$$ language plpgsql;

create trigger links_fts_trigger
  before insert or update on links
  for each row execute function links_fts_update();

create index links_fts_idx on links using gin(fts);

-- Index for fast snooze queries (background script wakeup check)
create index links_snooze_idx on links (user_id, snoozed_until)
  where snoozed_until is not null;

create index links_next_session_idx on links (user_id, on_next_session)
  where on_next_session = true;
