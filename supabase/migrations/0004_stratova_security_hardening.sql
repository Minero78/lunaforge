-- Stratova B14: security and bootstrap hardening.
-- Makes organization bootstrap work under RLS and adds the audit log table
-- referenced by the authorization layer.

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_organization_idx
  on public.audit_logs(organization_id, created_at desc);

alter table public.audit_logs enable row level security;

-- Organization creation is performed by the authenticated bootstrap RPC.
-- The function itself is SECURITY DEFINER so the caller can create the
-- organization and its initial OWNER membership before membership exists.
create or replace function public.create_organization(org_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org_id uuid;
begin
  if auth.uid() is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;

  if nullif(trim(org_name), '') is null then
    raise exception using errcode = '22023', message = 'Organization name is required';
  end if;

  insert into public.organizations (name)
  values (trim(org_name))
  returning id into new_org_id;

  insert into public.organization_members (organization_id, user_id, role)
  values (new_org_id, auth.uid(), 'OWNER');

  return new_org_id;
end;
$$;

grant execute on function public.create_organization(text) to authenticated;

-- Defensive cleanup: the previous policy name allowed all operations on leads,
-- including delete. Keep writes administrative and make deletion explicit.
drop policy if exists leads_write_admin on public.leads;
create policy leads_insert_admin
on public.leads for insert
with check (public.is_org_admin(organization_id));

create policy leads_update_admin
on public.leads for update
using (public.is_org_admin(organization_id))
with check (public.is_org_admin(organization_id));

create policy leads_delete_admin
on public.leads for delete
using (public.is_org_admin(organization_id));

-- Prevent members from changing an assessment's tenant after creation.
drop policy if exists assessments_update_member on public.assessments;
create policy assessments_update_member
on public.assessments for update
using (public.is_org_member(organization_id))
with check (organization_id is not distinct from (
  select a.organization_id
  from public.assessments a
  where a.id = id
));
