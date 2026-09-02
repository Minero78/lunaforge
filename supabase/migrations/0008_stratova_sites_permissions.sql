-- Stratova B46: align Sites write permissions with organization RBAC.
-- Consultants and members are read-only for organization master data.

drop policy if exists sites_insert_admin on public.sites;
drop policy if exists sites_update_admin on public.sites;
drop policy if exists sites_delete_admin on public.sites;

authorization policy sites_insert_admin
on public.sites for insert
to authenticated
with check (public.is_org_admin(organization_id));

authorization policy sites_update_admin
on public.sites for update
to authenticated
using (public.is_org_admin(organization_id))
with check (public.is_org_admin(organization_id));

authorization policy sites_delete_admin
on public.sites for delete
to authenticated
using (public.is_org_admin(organization_id));
