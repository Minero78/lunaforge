-- Stratova B41: production persistence hardening.
-- Keep the application/API contract compatible while aligning the schema with the Sites UI.

alter table public.sites
  add column if not exists code text,
  add column if not exists location text;

create unique index if not exists leads_organization_email_unique_idx
  on public.leads (organization_id, lower(email));

-- Lead capture in the authenticated product is member-scoped. The assessment
-- remains the authorization boundary; public lead capture should use a dedicated
-- SECURITY DEFINER RPC in a later funnel phase rather than broad INSERT access.
drop policy if exists leads_write_admin on public.leads;
drop policy if exists leads_insert_member on public.leads;
drop policy if exists leads_update_admin on public.leads;
drop policy if exists leads_delete_admin on public.leads;

create policy leads_insert_member
on public.leads for insert
with check (public.is_org_member(organization_id));

create policy leads_update_admin
on public.leads for update
using (public.is_org_admin(organization_id))
with check (public.is_org_admin(organization_id));

create policy leads_delete_admin
on public.leads for delete
using (public.is_org_admin(organization_id));

-- A user may only associate a lead with an assessment in the same organization.
-- This closes the cross-tenant association gap independently of application code.
create or replace function public.validate_lead_assessment_org()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.assessment_id is not null and not exists (
    select 1
    from public.assessments a
    where a.id = new.assessment_id
      and a.organization_id = new.organization_id
  ) then
    raise exception 'LEAD_ASSESSMENT_ORGANIZATION_MISMATCH';
  end if;
  return new;
end;
$$;

drop trigger if exists leads_validate_assessment_org on public.leads;
create trigger leads_validate_assessment_org
before insert or update on public.leads
for each row execute function public.validate_lead_assessment_org();
