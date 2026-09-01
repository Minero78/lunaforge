-- Stratova / MIS foundation schema
-- B12: production persistence foundation
-- Safe to apply after the Supabase project is created.

create extension if not exists pgcrypto;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('OWNER', 'ADMIN', 'CONSULTANT', 'MEMBER')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table if not exists public.sites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  country text,
  commodity text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete set null,
  site_id uuid references public.sites(id) on delete set null,
  assessment_type text not null default 'QUICKSCAN' check (assessment_type = 'QUICKSCAN'),
  framework_version text not null default 'MIS-1.0',
  engine_version text not null default 'ENGINE-1.0',
  status text not null default 'IN_PROGRESS' check (status in ('IN_PROGRESS', 'SCORED', 'ARCHIVED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.assessment_responses (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  question_id text not null,
  score smallint not null check (score between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (assessment_id, question_id)
);

create table if not exists public.assessment_results (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null unique references public.assessments(id) on delete cascade,
  overall_score numeric(5,2) not null check (overall_score between 0 and 100),
  maturity text not null check (maturity in ('Fragmented', 'Structured', 'Connected', 'Intelligent', 'Adaptive')),
  dimension_scores jsonb not null default '{}'::jsonb,
  strengths jsonb not null default '[]'::jsonb,
  gaps jsonb not null default '[]'::jsonb,
  constraints jsonb not null default '[]'::jsonb,
  opportunities jsonb not null default '[]'::jsonb,
  roadmap jsonb not null default '[]'::jsonb,
  framework_version text not null default 'MIS-1.0',
  engine_version text not null default 'ENGINE-1.0',
  calculated_at timestamptz not null default now()
);

create table if not exists public.evidence (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  storage_path text not null,
  evidence_type text,
  created_at timestamptz not null default now()
);

create table if not exists public.findings (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  dimension text,
  title text not null,
  description text not null,
  severity text,
  created_at timestamptz not null default now()
);

create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  title text not null,
  description text not null,
  impact text,
  effort text,
  readiness text,
  priority text,
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid references public.assessments(id) on delete set null,
  first_name text not null,
  last_name text,
  email text not null,
  company text not null,
  job_title text,
  country text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists assessments_organization_idx on public.assessments(organization_id);
create index if not exists assessments_site_idx on public.assessments(site_id);
create index if not exists responses_assessment_idx on public.assessment_responses(assessment_id);
create index if not exists evidence_assessment_idx on public.evidence(assessment_id);
create index if not exists findings_assessment_idx on public.findings(assessment_id);
create index if not exists opportunities_assessment_idx on public.opportunities(assessment_id);
create index if not exists leads_email_idx on public.leads(lower(email));

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_members enable row level security;
alter table public.sites enable row level security;
alter table public.assessments enable row level security;
alter table public.assessment_responses enable row level security;
alter table public.assessment_results enable row level security;
alter table public.evidence enable row level security;
alter table public.findings enable row level security;
alter table public.opportunities enable row level security;
alter table public.leads enable row level security;

-- RLS policies are intentionally added in the next migration after the
-- application authentication/organization-membership contract is finalized.
-- This prevents a partially correct authorization model from being deployed.
