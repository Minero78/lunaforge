-- Stratova B15: Supabase Auth integration.
-- Creates a profile on signup and provides a safe organization bootstrap RPC.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  )
  on conflict (id) do update
    set full_name = coalesce(excluded.full_name, public.profiles.full_name),
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.create_organization(org_name text)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  new_org_id uuid;
begin
  if auth.uid() is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;

  if nullif(trim(org_name), '') is null then
    raise exception using errcode = '22023', message = 'Organization name is required';
  end if;

  insert into public.organizations (name)
  values (trim(org_name))
  returning id into new_org_id;

  insert into public.organization_members (organization_id, user_id, role)
  values (new_org_id, auth.uid(), 'OWNER');

  return new_org_id;
end;
$$;

grant execute on function public.create_organization(text) to authenticated;
