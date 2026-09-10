-- Stratova B46: correct and enforce Sites write permissions.
-- Migration 0008 was superseded before production application.

drop policy if exists sites_insert_admin on public.sites;
drop policy if exists sites_update_admin on public.sites;
drop policy if exists sites_delete_admin on public.sites;

create policy sites_insert_admin
on public.sites for insert
to authenticated
with check (public.is_org_admin(organization_id));

create policy sites_update_admin
on public.sites for update
to authenticated
using (public.is_org_admin(organization_id))
with check (public.is_org_admin(organization_id));

create policy sites_delete_admin
on public.sites for delete
to authenticated
using (public.is_org_admin(organization_id));
