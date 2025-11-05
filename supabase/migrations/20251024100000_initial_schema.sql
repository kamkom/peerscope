-- migration_meta_data:
--   purpose: create the initial database schema based on the db-plan.
--   affected_tables: profiles, characters, events, event_participants, ai_analyses
--   author: Gemini AI
--   timestamp: 2025-10-24 10:00:00
--
-- notes:
--   - this migration sets up the core tables for the application.
--   - row-level security is enabled and configured for all user-data tables.
--   - helper functions and triggers are created for handling `updated_at` timestamps and new user profile creation.

-- section: custom types
-- description: defines custom data types used across the database schema.

-- create the custom enum type for analysis types.
-- this ensures that the `analysis_type` column in `ai_analyses` can only hold predefined values.
create type public.analysis_type_enum as enum ('mediation', 'gift_suggestion');

-- section: table creation
-- description: defines the schema for all new tables.

-- table: profiles
-- stores application-specific user data, extending the `auth.users` table.
create table public.profiles (
    id uuid not null primary key references auth.users(id) on delete cascade,
    daily_analysis_count smallint not null default 0,
    last_analysis_date date not null default current_date,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);
-- add comments to the `profiles` table and its columns for better schema understanding.
comment on table public.profiles is 'user profile information, extending auth.users.';
comment on column public.profiles.id is 'foreign key to auth.users.';
comment on column public.profiles.daily_analysis_count is 'tracks the number of ai analyses performed today.';
comment on column public.profiles.last_analysis_date is 'the date of the last analysis to reset the daily count.';

-- table: characters
-- stores profiles of individuals created by the user.
create table public.characters (
    id uuid not null primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    name text not null,
    role text,
    description text,
    traits text[],
    motivations text[],
    avatar_url text,
    is_owner boolean not null default false,
    last_interacted_at timestamp with time zone,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    deleted_at timestamp with time zone
);
-- add comments to the `characters` table and its columns.
comment on table public.characters is 'stores character profiles created by users.';
comment on column public.characters.user_id is 'the user who owns this character profile.';
comment on column public.characters.is_owner is 'true if this character represents the user themselves.';
comment on column public.characters.deleted_at is 'timestamp for soft-deleting the character.';

-- table: events
-- represents real or hypothetical interactions between characters.
create table public.events (
    id uuid not null primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    title text not null,
    event_date timestamp with time zone,
    description text,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);
-- add comments to the `events` table and its columns.
comment on table public.events is 'represents interactions between characters.';
comment on column public.events.user_id is 'the user who owns this event.';

-- table: event_participants
-- junction table for the many-to-many relationship between events and characters.
create table public.event_participants (
    event_id uuid not null references public.events(id) on delete cascade,
    character_id uuid not null references public.characters(id) on delete cascade,
    primary key (event_id, character_id)
);
-- add comments to the `event_participants` table.
comment on table public.event_participants is 'links characters to events they participate in.';

-- table: ai_analyses
-- stores the results of ai analyses related to events or characters.
create table public.ai_analyses (
    id uuid not null primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    event_id uuid references public.events(id) on delete cascade,
    character_id uuid references public.characters(id) on delete cascade,
    analysis_type public.analysis_type_enum not null,
    result jsonb not null,
    feedback smallint,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    constraint single_parent_entity_check check (
        (event_id is not null and character_id is null) or
        (event_id is null and character_id is not null)
    )
);
-- add comments to the `ai_analyses` table and its columns.
comment on table public.ai_analyses is 'stores results of ai analyses.';
comment on column public.ai_analyses.user_id is 'the user who requested the analysis.';
comment on column public.ai_analyses.result is 'the structured result from the ai model.';
comment on column public.ai_analyses.feedback is 'user feedback: 1 for thumbs up, -1 for thumbs down.';
comment on constraint single_parent_entity_check on public.ai_analyses is 'ensures an analysis is linked to exactly one parent (event or character).';

-- section: indexes
-- description: creates indexes on foreign key columns to improve query performance.

create index idx_characters_user_id on public.characters(user_id);
create index idx_events_user_id on public.events(user_id);
create index idx_event_participants_event_id on public.event_participants(event_id);
create index idx_event_participants_character_id on public.event_participants(character_id);
create index idx_ai_analyses_user_id on public.ai_analyses(user_id);
create index idx_ai_analyses_event_id on public.ai_analyses(event_id);
create index idx_ai_analyses_character_id on public.ai_analyses(character_id);

-- section: helper functions and triggers
-- description: utility functions and triggers for database automation.

-- trigger function: handle_updated_at
-- automatically updates the `updated_at` timestamp on row modification.
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- apply the `handle_updated_at` trigger to all tables with an `updated_at` column.
create trigger on_profiles_update
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger on_characters_update
  before update on public.characters
  for each row execute procedure public.handle_updated_at();

create trigger on_events_update
  before update on public.events
  for each row execute procedure public.handle_updated_at();

create trigger on_ai_analyses_update
  before update on public.ai_analyses
  for each row execute procedure public.handle_updated_at();

-- trigger function: handle_new_user
-- automatically creates a profile for a new user in `auth.users`.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- trigger to call `handle_new_user` after a new user signs up.
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- section: row-level security (rls)
-- description: enables and new rls policies for data protection.

-- enable rls on all user-data tables.
alter table public.profiles enable row level security;
alter table public.characters enable row level security;
alter table public.events enable row level security;
alter table public.event_participants enable row level security;
alter table public.ai_analyses enable row level security;

-- policies for: profiles
-- anon users have no access to profiles.
create policy "anon_profiles_access_deny" on public.profiles for all to anon using (false);
-- authenticated users can manage their own profile.
create policy "auth_profiles_select" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "auth_profiles_insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "auth_profiles_update" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "auth_profiles_delete" on public.profiles for delete to authenticated using (auth.uid() = id);

-- policies for: characters
-- anon users have no access to characters.
create policy "anon_characters_access_deny" on public.characters for all to anon using (false);
-- authenticated users can manage their own characters.
create policy "auth_characters_select" on public.characters for select to authenticated using (auth.uid() = user_id);
create policy "auth_characters_insert" on public.characters for insert to authenticated with check (auth.uid() = user_id);
create policy "auth_characters_update" on public.characters for update to authenticated using (auth.uid() = user_id);
create policy "auth_characters_delete" on public.characters for delete to authenticated using (auth.uid() = user_id);

-- policies for: events
-- anon users have no access to events.
create policy "anon_events_access_deny" on public.events for all to anon using (false);
-- authenticated users can manage their own events.
create policy "auth_events_select" on public.events for select to authenticated using (auth.uid() = user_id);
create policy "auth_events_insert" on public.events for insert to authenticated with check (auth.uid() = user_id);
create policy "auth_events_update" on public.events for update to authenticated using (auth.uid() = user_id);
create policy "auth_events_delete" on public.events for delete to authenticated using (auth.uid() = user_id);

-- policies for: event_participants
-- anon users have no access to event_participants.
create policy "anon_event_participants_access_deny" on public.event_participants for all to anon using (false);
-- authenticated users can manage participants of their own events.
create policy "auth_event_participants_select" on public.event_participants for select to authenticated using ((select user_id from public.events where id = event_id) = auth.uid());
create policy "auth_event_participants_insert" on public.event_participants for insert to authenticated with check ((select user_id from public.events where id = event_id) = auth.uid());
create policy "auth_event_participants_update" on public.event_participants for update to authenticated using ((select user_id from public.events where id = event_id) = auth.uid());
create policy "auth_event_participants_delete" on public.event_participants for delete to authenticated using ((select user_id from public.events where id = event_id) = auth.uid());

-- policies for: ai_analyses
-- anon users have no access to ai_analyses.
create policy "anon_ai_analyses_access_deny" on public.ai_analyses for all to anon using (false);
-- authenticated users can manage their own ai analyses.
create policy "auth_ai_analyses_select" on public.ai_analyses for select to authenticated using (auth.uid() = user_id);
create policy "auth_ai_analyses_insert" on public.ai_analyses for insert to authenticated with check (auth.uid() = user_id);
create policy "auth_ai_analyses_update" on public.ai_analyses for update to authenticated using (auth.uid() = user_id);
create policy "auth_ai_analyses_delete" on public.ai_analyses for delete to authenticated using (auth.uid() = user_id);
