-- Stratova B48: convert won opportunities into delivery projects.

create table if not exists public.consulting_projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  opportunity_id uuid not null references public.consulting_opportunities(id) on delete restrict,
  name text not null,
  status text not null default 'PLANNED' check (status in ('PLANNED','ACTIVE','ON_HOLD','COMPLETED','CANCELLED')),
  start_date date,
  target_end_date date,
  completed_at timestamptz,
  contract_value numeric check (contract_value is null or contract_value >= 0),
  currency text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, opportunity_id)
);

create index if not exists consulting_projects_org_idx on public.consulting_projects(organization_id);
create index if not exists consulting_projects_opportunity_idx on public.consulting_projects(opportunity_id);

alter table public.consulting_projects enable row level security;

drop policy if exists consulting_projects_select_member on public.consulting_projects;
drop policy if exists consulting_projects_insert_admin on public.consulting_projects;
drop policy if exists consulting_projects_update_admin on public.consulting_projects;

create policy consulting_projects_select_member
on public.consulting_projects for select
to authenticated
using (public.is_org_member(organization_id));

create policy consulting_projects_insert_admin
on public.consulting_projects for insert
to authenticated
with check (public.is_org_admin(organization_id));

create policy consulting_projects_update_admin
on public.consulting_projects for update
to authenticated
using (public.is_org_admin(organization_id))
with check (public.is_org_admin(organization_id));

create or replace function public.validate_consulting_project_org()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.consulting_opportunities o
    where o.id = new.opportunity_id
      and o.organization_id = new.organization_id
      and o.stage = 'WON'
  ) then
    raise exception 'PROJECT_REQUIRES_WON_OPPORTUNITY';
  end if;
  if new.start_date is not null and new.target_end_date is not null and new.target_end_date < new.start_date then
    raise exception 'PROJECT_END_BEFORE_START';
  end if;
  return new;
end;
$$;

drop trigger if exists consulting_projects_validate_org on public.consulting_projects;
create trigger consulting_projects_validate_org
before insert or update on public.consulting_projects
for each row execute function public.validate_consulting_project_org();

revoke all on function public.validate_consulting_project_org() from public, anon;
