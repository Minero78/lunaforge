create table if not exists portfolio_snapshots (
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null,
 snapshot_date date not null,
 portfolio_risk_score numeric,
 critical_interventions integer default 0,
 high_interventions integer default 0,
 deteriorating_projects integer default 0,
 payload jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 unique(organization_id,snapshot_date)
);
alter table portfolio_snapshots enable row level security;
create policy "organization portfolio snapshots" on portfolio_snapshots using (organization_id = auth.uid()) with check (organization_id = auth.uid());