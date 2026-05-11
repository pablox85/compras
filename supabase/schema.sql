create extension if not exists "pgcrypto";

do $$
begin
  create type public.membership_role as enum ('admin', 'member');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.purchase_panel as enum ('surtido', 'mandados');
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  login text not null,
  display_name text,
  active_organization_id uuid references public.organizations(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.membership_role not null default 'member',
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table if not exists public.compras (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  panel public.purchase_panel not null,
  categoria text not null,
  nombre text not null,
  cantidad integer not null default 1 check (cantidad > 0),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_by_login text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, login, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'login', split_part(coalesce(new.email, 'usuario'), '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(coalesce(new.email, 'usuario'), '@', 1))
  )
  on conflict (id) do update
  set login = excluded.login,
      display_name = excluded.display_name,
      updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.create_organization(p_name text)
returns public.organizations
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org public.organizations;
  org_slug text;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  org_slug := lower(regexp_replace(trim(p_name), '[^a-zA-Z0-9]+', '-', 'g'));
  org_slug := trim(both '-' from org_slug);
  if org_slug = '' then
    org_slug := 'org';
  end if;
  org_slug := org_slug || '-' || substr(auth.uid()::text, 1, 8);

  insert into public.organizations (name, slug, owner_id)
  values (trim(p_name), org_slug, auth.uid())
  returning * into new_org;

  insert into public.memberships (organization_id, user_id, role)
  values (new_org.id, auth.uid(), 'admin');

  update public.profiles
  set active_organization_id = new_org.id,
      updated_at = now()
  where id = auth.uid();

  return new_org;
end;
$$;

create or replace function public.set_active_organization(p_organization_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  if not exists (
    select 1
    from public.memberships
    where organization_id = p_organization_id
      and user_id = auth.uid()
  ) then
    raise exception 'not_member_of_organization';
  end if;

  update public.profiles
  set active_organization_id = p_organization_id,
      updated_at = now()
  where id = auth.uid();
end;
$$;

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.compras enable row level security;

create policy "organizations_select_members"
on public.organizations
for select
using (
  exists (
    select 1
    from public.memberships
    where memberships.organization_id = organizations.id
      and memberships.user_id = auth.uid()
  )
);

create policy "profiles_select_own"
on public.profiles
for select
using (id = auth.uid());

create policy "profiles_update_own"
on public.profiles
for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "memberships_select_own"
on public.memberships
for select
using (user_id = auth.uid());

create policy "compras_select_members"
on public.compras
for select
using (
  exists (
    select 1
    from public.memberships
    where memberships.organization_id = compras.organization_id
      and memberships.user_id = auth.uid()
  )
);

create policy "compras_insert_members"
on public.compras
for insert
with check (
  created_by = auth.uid()
  and exists (
    select 1
    from public.memberships
    where memberships.organization_id = compras.organization_id
      and memberships.user_id = auth.uid()
  )
);

create policy "compras_update_members"
on public.compras
for update
using (
  exists (
    select 1
    from public.memberships
    where memberships.organization_id = compras.organization_id
      and memberships.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.memberships
    where memberships.organization_id = compras.organization_id
      and memberships.user_id = auth.uid()
  )
);

create policy "compras_delete_members"
on public.compras
for delete
using (
  exists (
    select 1
    from public.memberships
    where memberships.organization_id = compras.organization_id
      and memberships.user_id = auth.uid()
  )
);
