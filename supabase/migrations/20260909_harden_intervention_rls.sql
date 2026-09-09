drop policy if exists "organization intervention actions" on intervention_actions;
create policy "organization members can access intervention actions"
on intervention_actions
for all
to authenticated
using (exists (
 select 1 from organization_members m
 where m.organization_id=intervention_actions.organization_id
 and m.user_id=auth.uid()
))
with check (exists (
 select 1 from organization_members m
 where m.organization_id=intervention_actions.organization_id
 and m.user_id=auth.uid()
));