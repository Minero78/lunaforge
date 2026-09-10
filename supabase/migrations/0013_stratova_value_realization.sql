-- Value realization foundation.
-- Stores expected and actual benefits for closed consulting opportunities.

alter table public.opportunity_value_cases
  add column if not exists actual_roi_percent numeric,
  add column if not exists actual_payback_months numeric;

create or replace function public.prevent_value_case_opportunity_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and (new.organization_id <> old.organization_id or new.opportunity_id <> old.opportunity_id) then
    raise exception 'VALUE_CASE_IDENTITY_IMMUTABLE';
  end if;
  return new;
end;
$$;

drop trigger if exists opportunity_value_cases_identity_guard on public.opportunity_value_cases;
create trigger opportunity_value_cases_identity_guard
before update on public.opportunity_value_cases
for each row execute function public.prevent_value_case_opportunity_change();

revoke all on function public.prevent_value_case_opportunity_change() from public, anon;

create or replace function public.validate_value_case_numbers()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.investment < 0 or new.expected_annual_benefit < 0 then
    raise exception 'VALUE_CASE_NEGATIVE_AMOUNT';
  end if;
  if new.actual_annual_benefit is not null and new.actual_annual_benefit < 0 then
    raise exception 'VALUE_CASE_NEGATIVE_AMOUNT';
  end if;
  return new;
end;
$$;

drop trigger if exists opportunity_value_cases_number_guard on public.opportunity_value_cases;
create trigger opportunity_value_cases_number_guard
before insert or update on public.opportunity_value_cases
for each row execute function public.validate_value_case_numbers();

revoke all on function public.validate_value_case_numbers() from public, anon;
