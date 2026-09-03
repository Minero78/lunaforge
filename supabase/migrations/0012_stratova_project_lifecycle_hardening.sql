-- Consulting project lifecycle hardening.
-- Keeps status transitions deterministic and completed_at consistent at the database boundary.

create or replace function public.validate_consulting_project_lifecycle()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and new.status <> old.status then
    if old.status = 'PLANNED' and new.status not in ('PLANNED', 'ACTIVE', 'CANCELLED') then
      raise exception 'INVALID_PROJECT_STATUS_TRANSITION';
    elsif old.status = 'ACTIVE' and new.status not in ('ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED') then
      raise exception 'INVALID_PROJECT_STATUS_TRANSITION';
    elsif old.status = 'ON_HOLD' and new.status not in ('ON_HOLD', 'ACTIVE', 'CANCELLED') then
      raise exception 'INVALID_PROJECT_STATUS_TRANSITION';
    elsif old.status in ('COMPLETED', 'CANCELLED') then
      raise exception 'PROJECT_STATUS_IMMUTABLE';
    end if;
  end if;

  if new.status = 'COMPLETED' then
    if new.completed_at is null then
      new.completed_at := coalesce(new.updated_at, now());
    end if;
  elsif tg_op = 'UPDATE' and old.status = 'COMPLETED' then
    raise exception 'PROJECT_STATUS_IMMUTABLE';
  end if;

  if new.status <> 'COMPLETED' and tg_op = 'UPDATE' and new.completed_at is not null and old.completed_at is null then
    raise exception 'COMPLETED_AT_REQUIRES_COMPLETED_STATUS';
  end if;

  if new.start_date is not null and new.target_end_date is not null and new.target_end_date < new.start_date then
    raise exception 'PROJECT_END_BEFORE_START';
  end if;

  return new;
end;
$$;

drop trigger if exists consulting_projects_lifecycle_guard on public.consulting_projects;
create trigger consulting_projects_lifecycle_guard
before insert or update on public.consulting_projects
for each row execute function public.validate_consulting_project_lifecycle();

revoke all on function public.validate_consulting_project_lifecycle() from public, anon;
