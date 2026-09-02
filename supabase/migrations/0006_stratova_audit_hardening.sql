-- Stratova B42: tighten trusted-write boundaries.

-- Organization bootstrap is intentionally callable only by authenticated users.
revoke execute on function public.create_organization(text) from public, anon;
grant execute on function public.create_organization(text) to authenticated;

-- Audit entries are trusted server-side records, not client-authored events.
-- Keep member read access from B14, but remove direct INSERT through the REST API.
drop policy if exists audit_logs_insert_member on public.audit_logs;

-- The server/service layer can use a SECURITY DEFINER function to append an
-- audit record while binding the actor to auth.uid() and the organization.
create or replace function public.append_audit_log(
  target_org uuid,
  action_name text,
  target_entity_type text default null,
  target_entity_id uuid default null,
  event_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  if auth.uid() is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;

  if not public.is_org_member(target_org) then
    raise exception using errcode = '42501', message = 'Organization membership required';
  end if;

  insert into public.audit_logs (
    organization_id, user_id, action, entity_type, entity_id, metadata
  )
  values (
    target_org, auth.uid(), action_name, target_entity_type, target_entity_id,
    coalesce(event_metadata, '{}'::jsonb)
  )
  returning id into new_id;

  return new_id;
end;
$$;

revoke execute on function public.append_audit_log(uuid, text, text, uuid, jsonb) from public, anon;
grant execute on function public.append_audit_log(uuid, text, text, uuid, jsonb) to authenticated;
