-- Stratova B49: persist consulting opportunities.

create table if not exists public.consulting_opportunities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  dimension text not null,
  title text not null,
  rationale text not null,
  suggested_service text not null,
  priority text not null check (priority in ('HIGH','MEDIUM','LOW')),
  impact text not null check (impact in ('HIGH','MEDIUM','LOW')),
  stage text not null default 'IDENTIFIED' check (stage in ('IDENTIFIED','QUALIFIED','PROPOSED','WON','LOST')),
  estimated_value numeric,
  currency text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, assessment_id, dimension)
);

create index if not exists consulting_opportunities_org_idx on public.consulting_opportunities(organization_id);
create index if not exists consulting_opportunities_assessment_idx on public.consulting_opportunities(assessment_id);

alter table public.consulting_opportunities enable row level security;

drop policy if exists consulting_opportunities_select_member on public.consulting_opportunities;
drop policy if exists consulting_opportunities_insert_admin on public.consulting_opportunities;
drop policy if exists consulting_opportunities_update_admin on public.consulting_opportunities;

create policy consulting_opportunities_select_member
on public.consulting_opportunities for select
to authenticated
using (public.is_org_member(organization_id));

create policy consulting_opportunities_insert_admin
on public.consulting_opportunities for insert
to authenticated
with check (public.is_org_admin(organization_id));

create policy consulting_opportunities_update_admin
on public.consulting_opportunities for update
to authenticated
using (public.is_org_admin(organization_id))
with check (public.is_org_admin(organization_id));

create or replace function public.validate_consulting_opportunity_assessment_org()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.assessments a
    where a.id = new.assessment_id
      and a.organization_id = new.organization_id
  ) then
    raise exception 'OPPORTUNITY_ASSESSMENT_ORGANIZATION_MISMATCH';
  end if;
  return new;
end;
$$;

drop trigger if exists consulting_opportunities_validate_assessment on public.consulting_opportunities;
create trigger consulting_opportunities_validate_assessment
before insert or update on public.consulting_opportunities
for each row execute function public.validate_consulting_opportunity_assessment_org();
