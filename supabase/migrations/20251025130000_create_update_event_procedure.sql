create or replace function public.update_event_with_participants(
    p_event_id uuid,
    p_user_id uuid,
    p_title text,
    p_description text,
    p_event_date timestamptz,
    p_participant_ids uuid[]
)
returns void
language plpgsql
security definer
as $$
declare
    v_character_count integer;
    v_event_user_id uuid;
begin
    -- 1. Verify that the event exists and belongs to the user.
    select user_id into v_event_user_id from public.events where id = p_event_id;

    if not found then
        raise exception 'Event not found.';
    end if;

    if v_event_user_id <> p_user_id then
        raise exception 'User is not authorized to update this event.';
    end if;

    -- 2. Verify that all participants exist and belong to the user.
    select count(*)
    into v_character_count
    from public.characters
    where id = any(p_participant_ids) and user_id = p_user_id;

    if v_character_count <> array_length(p_participant_ids, 1) then
        raise exception 'One or more participants not found or do not belong to the user.';
    end if;

    -- 3. Update the event details.
    update public.events
    set
        title = p_title,
        description = p_description,
        event_date = p_event_date
    where id = p_event_id;

    -- 4. Delete old participants.
    delete from public.event_participants where event_id = p_event_id;

    -- 5. Insert new participants.
    insert into public.event_participants (event_id, character_id)
    select p_event_id, unnest(p_participant_ids);

end;
$$;
