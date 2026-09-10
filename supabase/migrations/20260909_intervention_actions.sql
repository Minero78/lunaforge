create table if not exists public.intervention_actions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.consulting_projects(id) on delete cascade,
  title text not null,
  description text,
  recommended_owner text,
  assigned_to text,
  urgency text not null default 'MEDIUM',
  status text not null default 'RECOMMENDED',
  baseline_risk_score integer,
  baseline_delivery_health text,
  baseline_outcome_health text,
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz
);

create index if not exists intervention_actions_organization_project_idx
  on public.intervention_actions(organization_id, project_id);

alter table public.intervention_actions enable row level security;

create policy "intervention_actions_org_access"
on public.intervention_actions
for all
using (
  organization_id in (
    select organization_id from public.organization_members where user_id = auth.uid()
  )
)
with check (
  organization_id in (
    select organization_id from public.organization_members where user_id = auth.uid()
  )
);