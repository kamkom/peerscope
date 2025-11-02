-- migration_meta_data:
--   purpose: add row-level security policies for characters table
--   affected_tables: characters
--   author: Assistant
--   timestamp: 2025-10-29 12:05:00

-- Ensure RLS is enabled (it already is in initial schema, but safe to assert)
alter table public.characters enable row level security;

-- Drop existing policies if they exist to make this migration idempotent during re-runs
do $$
begin
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'characters' and policyname = 'auth_characters_select') then
    drop policy "auth_characters_select" on public.characters;
  end if;
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'characters' and policyname = 'auth_characters_insert') then
    drop policy "auth_characters_insert" on public.characters;
  end if;
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'characters' and policyname = 'auth_characters_update') then
    drop policy "auth_characters_update" on public.characters;
  end if;
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'characters' and policyname = 'auth_characters_delete') then
    drop policy "auth_characters_delete" on public.characters;
  end if;
end $$;

-- Authenticated users can read their own characters
create policy "auth_characters_select"
  on public.characters
  for select
  to authenticated
  using (auth.uid() = user_id and deleted_at is null);

-- Authenticated users can insert characters for themselves
create policy "auth_characters_insert"
  on public.characters
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Authenticated users can update their own characters
create policy "auth_characters_update"
  on public.characters
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Authenticated users can delete (soft or hard) their own characters
create policy "auth_characters_delete"
  on public.characters
  for delete
  to authenticated
  using (auth.uid() = user_id);


