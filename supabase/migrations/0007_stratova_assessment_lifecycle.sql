-- Stratova B45: assessment lifecycle hardening.
-- Enforce a single legal transition path and prevent edits after scoring/archive.

create or replace function public.prevent_scored_assessment_mutation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status = 'ARCHIVED' and new.status <> 'ARCHIVED' then
    raise exception 'ARCHIVED_ASSESSMENT_IMMUTABLE';
  end if;

  if old.status = 'SCORED' and new.status = 'IN_PROGRESS' then
    raise exception 'SCORED_ASSESSMENT_CANNOT_REOPEN';
  end if;

  if old.status = 'SCORED' and (
    new.organization_id is distinct from old.organization_id
    or new.assessment_type is distinct from old.assessment_type
    or new.framework_version is distinct from old.framework_version
    or new.engine_version is distinct from old.engine_version
    or new.created_at is distinct from old.created_at
  ) then
    raise exception 'SCORED_ASSESSMENT_IMMUTABLE';
  end if;

  return new;
end;
$$;

drop trigger if exists assessments_lifecycle_guard on public.assessments;
create trigger assessments_lifecycle_guard
before update on public.assessments
for each row execute function public.prevent_scored_assessment_mutation();

-- Result rows are immutable once the assessment has been scored.
create or replace function public.prevent_scored_result_mutation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1 from public.assessments a
    where a.id = coalesce(new.assessment_id, old.assessment_id)
      and a.status = 'SCORED'
  ) then
    if tg_op = 'DELETE' then
      raise exception 'SCORED_RESULT_CANNOT_DELETE';
    end if;

    if tg_op = 'UPDATE' then
      if new.assessment_id is distinct from old.assessment_id
        or new.overall_score is distinct from old.overall_score
        or new.maturity is distinct from old.maturity
        or new.dimension_scores is distinct from old.dimension_scores
        or new.strengths is distinct from old.strengths
        or new.gaps is distinct from old.gaps
        or new.constraints is distinct from old.constraints
        or new.opportunities is distinct from old.opportunities
        or new.roadmap is distinct from old.roadmap
        or new.framework_version is distinct from old.framework_version
        or new.engine_version is distinct from old.engine_version
      then
        raise exception 'SCORED_RESULT_IMMUTABLE';
      end if;
    end if;
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists assessment_results_lifecycle_guard on public.assessment_results;
create trigger assessment_results_lifecycle_guard
before update or delete on public.assessment_results
for each row execute function public.prevent_scored_result_mutation();

-- Only the authenticated application role should execute lifecycle guard functions.
revoke all on function public.prevent_scored_assessment_mutation() from public, anon;
revoke all on function public.prevent_scored_result_mutation() from public, anon;
