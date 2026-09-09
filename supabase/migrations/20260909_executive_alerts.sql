create table if not exists executive_alerts (
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null,
 project_id uuid,
 title text not null,
 description text,
 severity text not null,
 status text not null default 'OPEN',
 payload jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 acknowledged_at timestamptz
);
alter table executive_alerts enable row level security;
create policy "organization executive alerts" on executive_alerts using (organization_id = auth.uid()) with check (organization_id = auth.uid());