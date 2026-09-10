create index if not exists idx_intervention_actions_org_status on intervention_actions(organization_id,status);
create index if not exists idx_intervention_actions_org_owner on intervention_actions(organization_id,owner_id);
create index if not exists idx_organization_members_user_org on organization_members(user_id,organization_id);
create index if not exists idx_projects_org_status on projects(organization_id,status);