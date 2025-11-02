-- migration_meta_data:
--   purpose: create a procedure for soft-deleting characters to bypass rls issues.
--   affected_tables: characters
--   author: Gemini AI
--   timestamp: 2025-11-02 17:00:00

create or replace function public.soft_delete_character(p_character_id uuid)
returns void as $$
begin
  update public.characters
  set deleted_at = now()
  where id = p_character_id and user_id = auth.uid();
end;
$$ language plpgsql security definer;

comment on function public.soft_delete_character(uuid) is 'soft-deletes a character by setting deleted_at. runs with definer privileges to bypass rls policies, but internally checks for user ownership.';
