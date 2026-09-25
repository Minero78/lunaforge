-- Stratova B13: authorization policies.
-- Requires Supabase Auth. Policies are scoped through organization_members.

create or replace function public.is_org_member(target_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = target_org
      and om.user_id = auth.uid()
  );
$$;

create or replace function public.is_org_admin(target_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = target_org
      and om.user_id = auth.uid()
      and om.role in ('OWNER', 'ADMIN')
  );
$$;

-- Organizations
create policy organizations_select_member
on public.organizations for select
using (public.is_org_member(id));

create policy organizations_update_admin
on public.organizations for update
using (public.is_org_admin(id))
with check (public.is_org_admin(id));

-- Profiles
create policy profiles_select_self
on public.profiles for select
using (id = auth.uid());

create policy profiles_update_self
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

-- Memberships
create policy memberships_select_member
on public.organization_members for select
using (user_id = auth.uid() or public.is_org_member(organization_id));

create policy memberships_manage_admin
on public.organization_members for all
using (public.is_org_admin(organization_id))
with check (public.is_org_admin(organization_id));

-- Sites
create policy sites_select_member
on public.sites for select
using (public.is_org_member(organization_id));

create policy sites_manage_admin
on public.sites for all
using (public.is_org_admin(organization_id))
with check (public.is_org_admin(organization_id));

-- Assessments
create policy assessments_select_member
on public.assessments for select
using (public.is_org_member(organization_id));

create policy assessments_insert_member
on public.assessments for insert
with check (public.is_org_member(organization_id));

create policy assessments_update_member
on public.assessments for update
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

-- Responses/results are reachable through the assessment's organization.
create policy assessment_responses_select_member
on public.assessment_responses for select
using (exists (
  select 1 from public.assessments a
  where a.id = assessment_id and public.is_org_member(a.organization_id)
));

create policy assessment_responses_write_member
on public.assessment_responses for all
using (exists (
  select 1 from public.assessments a
  where a.id = assessment_id and public.is_org_member(a.organization_id)
))
with check (exists (
  select 1 from public.assessments a
  where a.id = assessment_id and public.is_org_member(a.organization_id)
));

create policy assessment_results_select_member
on public.assessment_results for select
using (exists (
  select 1 from public.assessments a
  where a.id = assessment_id and public.is_org_member(a.organization_id)
));

create policy assessment_results_write_member
on public.assessment_results for all
using (exists (
  select 1 from public.assessments a
  where a.id = assessment_id and public.is_org_member(a.organization_id)
))
with check (exists (
  select 1 from public.assessments a
  where a.id = assessment_id and public.is_org_member(a.organization_id)
));

-- Findings/opportunities/evidence are scoped by assessment ownership.
create policy evidence_member_access
on public.evidence for all
using (exists (
  select 1 from public.assessments a
  where a.id = assessment_id and public.is_org_member(a.organization_id)
))
with check (exists (
  select 1 from public.assessments a
  where a.id = assessment_id and public.is_org_member(a.organization_id)
));

create policy findings_member_access
on public.findings for all
using (exists (
  select 1 from public.assessments a
  where a.id = assessment_id and public.is_org_member(a.organization_id)
))
with check (exists (
  select 1 from public.assessments a
  where a.id = assessment_id and public.is_org_member(a.organization_id)
));

create policy opportunities_member_access
on public.opportunities for all
using (exists (
  select 1 from public.assessments a
  where a.id = assessment_id and public.is_org_member(a.organization_id)
))
with check (exists (
  select 1 from public.assessments a
  where a.id = assessment_id and public.is_org_member(a.organization_id)
));

-- Leads are organization-scoped. Creation should ultimately be mediated by the API/service role.
create policy leads_select_member
on public.leads for select
using (public.is_org_member(organization_id));

create policy leads_write_admin
on public.leads for all
using (public.is_org_admin(organization_id))
with check (public.is_org_admin(organization_id));

-- Audit logs are append/read within an organization; deletion is intentionally excluded.
create policy audit_logs_select_member
on public.audit_logs for select
using (public.is_org_member(organization_id));

create policy audit_logs_insert_member
on public.audit_logs for insert
with check (public.is_org_member(organization_id));
