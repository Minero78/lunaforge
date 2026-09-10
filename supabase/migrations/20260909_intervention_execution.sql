create table if not exists intervention_actions (
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null,
 project_id uuid,
 title text not null,
 description text,
 owner_id uuid,
 severity text not null default 'MEDIUM',
 status text not null default 'PROPOSED',
 due_at timestamptz,
 approval_status text not null default 'NOT_REQUIRED',
 effectiveness_score numeric,
 payload jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table intervention_actions enable row level security;
create policy "organization intervention actions" on intervention_actions using (organization_id=auth.uid()) with check (organization_id=auth.uid());