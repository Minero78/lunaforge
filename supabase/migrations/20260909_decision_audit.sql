create table if not exists copilot_decision_audits (
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null,
 question text not null,
 intent text,
 analysis jsonb,
 recommendation jsonb,
 created_at timestamptz not null default now()
);
alter table copilot_decision_audits enable row level security;
create policy "organization decision audits" on copilot_decision_audits using (organization_id = auth.uid()) with check (organization_id = auth.uid());