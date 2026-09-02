-- Stratova B47: persist ROI/value cases against authorized consulting opportunities.

create table if not exists public.opportunity_value_cases (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  opportunity_id uuid not null references public.consulting_opportunities(id) on delete cascade,
  investment numeric not null check (investment >= 0),
  expected_annual_benefit numeric not null check (expected_annual_benefit >= 0),
  actual_annual_benefit numeric check (actual_annual_benefit is null or actual_annual_benefit >= 0),
  currency text,
  roi_percent numeric not null,
  payback_months numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists opportunity_value_cases_opportunity_idx
on public.opportunity_value_cases(organization_id, opportunity_id);

alter table public.opportunity_value_cases enable row level security;

drop policy if exists opportunity_value_cases_select_member on public.opportunity_value_cases;
drop policy if exists opportunity_value_cases_insert_admin on public.opportunity_value_cases;
drop policy if exists opportunity_value_cases_update_admin on public.opportunity_value_cases;

create policy opportunity_value_cases_select_member
on public.opportunity_value_cases for select
to authenticated
using (public.is_org_member(organization_id));

create policy opportunity_value_cases_insert_admin
on public.opportunity_value_cases for insert
to authenticated
with check (public.is_org_admin(organization_id));

create policy opportunity_value_cases_update_admin
on public.opportunity_value_cases for update
to authenticated
using (public.is_org_admin(organization_id))
with check (public.is_org_admin(organization_id));

create or replace function public.validate_opportunity_value_case_org()
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
  ) then
    raise exception 'VALUE_CASE_OPPORTUNITY_ORGANIZATION_MISMATCH';
  end if;
  return new;
end;
$$;

drop trigger if exists opportunity_value_cases_validate_org on public.opportunity_value_cases;
create trigger opportunity_value_cases_validate_org
before insert or update on public.opportunity_value_cases
for each row execute function public.validate_opportunity_value_case_org();

revoke all on function public.validate_opportunity_value_case_org() from public, anon;
