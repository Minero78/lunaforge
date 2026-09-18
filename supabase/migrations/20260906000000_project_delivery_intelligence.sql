create table if not exists public.project_milestones (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.consulting_projects(id) on delete cascade,
  name text not null,
  due_date date,
  status text not null default 'NOT_STARTED' check (status in ('NOT_STARTED','IN_PROGRESS','DONE')),
  risk_level text not null default 'LOW' check (risk_level in ('LOW','MEDIUM','HIGH')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_risks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.consulting_projects(id) on delete cascade,
  title text not null,
  owner text,
  mitigation text,
  level text not null default 'MEDIUM' check (level in ('LOW','MEDIUM','HIGH')),
  status text not null default 'OPEN' check (status in ('OPEN','MITIGATING','CLOSED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists project_milestones_org_project_idx on public.project_milestones(organization_id, project_id);
create index if not exists project_risks_org_project_idx on public.project_risks(organization_id, project_id);

alter table public.project_milestones enable row level security;
alter table public.project_risks enable row level security;

drop policy if exists project_milestones_org_access on public.project_milestones;
create policy project_milestones_org_access on public.project_milestones
for all using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

drop policy if exists project_risks_org_access on public.project_risks;
create policy project_risks_org_access on public.project_risks
for all using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());