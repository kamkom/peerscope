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
as $$
declare
    v_character_count integer;
    v_new_event_id uuid;
begin
    -- 1. Verify that all participants exist and belong to the user.
    select count(*)
    into v_character_count
    from public.characters
    where id = any(p_participant_ids) and user_id = p_user_id;

    if v_character_count <> array_length(p_participant_ids, 1) then
        raise exception 'One or more participants not found or do not belong to the user.';
    end if;

    -- 2. Insert the new event.
    insert into public.events (user_id, title, description, event_date)
    values (p_user_id, p_title, p_description, p_event_date)
    returning id into v_new_event_id;

    -- 3. Insert the event participants.
    insert into public.event_participants (event_id, character_id)
    select v_new_event_id, unnest(p_participant_ids);

    -- 4. Return the new event's ID.
    return v_new_event_id;
end;
$$;
