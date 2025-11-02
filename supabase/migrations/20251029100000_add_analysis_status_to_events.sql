--  1. create the enum type for analysis status
create type public.analysis_status_enum as enum ('pending', 'completed', 'failed');

-- alter the "events" table to add the new "analysis_status" column.
alter table public.events
add column analysis_status public.analysis_status_enum null;

-- add a comment to the new column for clarity.
comment on column public.events.analysis_status is 'tracks the status of the ai analysis for the event.';

-- create an index on the new column to improve query performance for filtering by status.
create index idx_events_analysis_status on public.events(analysis_status);

--  2. update the `create_event_with_participants` function
-- drop the existing function to redefine it
drop function if exists public.create_event_with_participants(uuid, text, text, timestamptz, uuid[]);

-- recreate the function with the new `analysis_status` logic
create or replace function public.create_event_with_participants(
    p_user_id uuid,
    p_title text,
    p_description text,
    p_event_date timestamptz,
    p_participant_ids uuid[]
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    new_event_id uuid;
    participant_id uuid;
    character_owner_id uuid;
begin
    -- validate that all participant characters exist and belong to the user
    foreach participant_id in array p_participant_ids
    loop
        select user_id into character_owner_id from public.characters where id = participant_id;
        if not found or character_owner_id <> p_user_id then
            raise exception 'one or more participants not found or do not belong to the user.';
        end if;
    end loop;

    -- insert the new event and set its analysis_status to 'pending'
    insert into public.events (user_id, title, description, event_date, analysis_status)
    values (p_user_id, p_title, p_description, p_event_date, 'pending')
    returning id into new_event_id;

    -- associate participants with the new event
    if array_length(p_participant_ids, 1) > 0 then
        foreach participant_id in array p_participant_ids
        loop
            insert into public.event_participants (event_id, character_id)
            values (new_event_id, participant_id);
        end loop;
    end if;

    return new_event_id;
end;
$$;

-- grant execute permission to the authenticated role
grant execute on function public.create_event_with_participants(uuid, text, text, timestamptz, uuid[]) to authenticated;
