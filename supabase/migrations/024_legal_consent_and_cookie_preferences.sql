-- Okyanus Insani Yardim Dernegi
-- 024 Legal consent audit fields and cookie preference readiness
-- Bu migration PayTR odeme akisini, makbuz sistemini veya donation mode davranisini degistirmez.

do $$
declare
  target_table text;
  consent_tables text[] := array[
    'contact_messages',
    'volunteer_applications',
    'donations',
    'donation_transactions',
    'payment_intents',
    'qurban_orders',
    'qurban_delegations',
    'sponsorship_applications',
    'user_accounts',
    'donor_profiles',
    'volunteer_profiles'
  ];
begin
  foreach target_table in array consent_tables loop
    if to_regclass(format('public.%I', target_table)) is not null then
      execute format('alter table public.%I add column if not exists kvkk_acknowledged boolean not null default false', target_table);
      execute format('alter table public.%I add column if not exists explicit_consent_given boolean not null default false', target_table);
      execute format('alter table public.%I add column if not exists communication_permission_given boolean not null default false', target_table);
      execute format('alter table public.%I add column if not exists consent_text_version text', target_table);
      execute format('alter table public.%I add column if not exists consent_given_at timestamptz', target_table);
      execute format('alter table public.%I add column if not exists consent_ip text', target_table);
      execute format('alter table public.%I add column if not exists consent_user_agent text', target_table);
      execute format('alter table public.%I add column if not exists consent_metadata jsonb not null default ''{}''::jsonb', target_table);
    end if;
  end loop;
end $$;

do $$
begin
  if to_regclass('public.qurban_orders') is not null then
    update public.qurban_orders
    set
      kvkk_acknowledged = coalesce(kvkk_acknowledged, false) or coalesce(kvkk_accepted, false),
      communication_permission_given = coalesce(communication_permission_given, false) or coalesce(contact_permission, false),
      consent_given_at = coalesce(consent_given_at, delegation_accepted_at, created_at)
    where coalesce(kvkk_accepted, false) = true
      or coalesce(contact_permission, false) = true;
  end if;
end $$;

do $$
begin
  if to_regclass('public.qurban_delegations') is not null then
    update public.qurban_delegations
    set
      kvkk_acknowledged = coalesce(kvkk_acknowledged, false) or coalesce(accepted, false),
      explicit_consent_given = coalesce(explicit_consent_given, false) or coalesce(accepted, false),
      consent_given_at = coalesce(consent_given_at, accepted_at, created_at),
      consent_user_agent = coalesce(consent_user_agent, user_agent),
      consent_metadata = coalesce(consent_metadata, '{}'::jsonb) || jsonb_build_object('sourceField', 'delegation_accepted')
    where coalesce(accepted, false) = true;
  end if;
end $$;

do $$
begin
  if to_regclass('public.sponsorship_applications') is not null then
    update public.sponsorship_applications
    set
      kvkk_acknowledged = coalesce(kvkk_acknowledged, false) or coalesce(kvkk_accepted, false),
      communication_permission_given = coalesce(communication_permission_given, false) or coalesce(contact_permission, false),
      consent_given_at = coalesce(consent_given_at, created_at)
    where coalesce(kvkk_accepted, false) = true
      or coalesce(contact_permission, false) = true;
  end if;
end $$;

do $$
begin
  if to_regclass('public.donor_profiles') is not null then
    update public.donor_profiles
    set
      communication_permission_given = coalesce(communication_permission_given, false) or coalesce(communication_permission, false),
      consent_given_at = coalesce(consent_given_at, created_at)
    where coalesce(communication_permission, false) = true;
  end if;
end $$;

create table if not exists public.site_cookie_consents (
  id uuid primary key default gen_random_uuid(),
  visitor_id text not null,
  necessary boolean not null default true,
  functional boolean not null default false,
  analytics boolean not null default false,
  marketing boolean not null default false,
  consent_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_seen_at timestamptz,
  user_agent text,
  ip_hash text,
  metadata jsonb not null default '{}'::jsonb,
  constraint site_cookie_consents_necessary_true check (necessary is true)
);

create index if not exists idx_site_cookie_consents_visitor
  on public.site_cookie_consents(visitor_id);

create index if not exists idx_site_cookie_consents_updated
  on public.site_cookie_consents(updated_at desc);

create or replace function public.touch_site_cookie_consents_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_site_cookie_consents_updated_at on public.site_cookie_consents;
create trigger trg_site_cookie_consents_updated_at
before update on public.site_cookie_consents
for each row
execute function public.touch_site_cookie_consents_updated_at();

alter table public.site_cookie_consents enable row level security;
alter table public.site_cookie_consents force row level security;

revoke all on table public.site_cookie_consents from anon;
revoke all on table public.site_cookie_consents from authenticated;
grant select on table public.site_cookie_consents to authenticated;

do $$ begin
  create policy "admin read site cookie consents"
  on public.site_cookie_consents for select to authenticated
  using (public.has_any_role(array['super_admin', 'admin']));
exception when duplicate_object then null; end $$;

comment on table public.site_cookie_consents is
  'Future server-side cookie preference audit table. Initial public consent mechanism stores preferences locally and does not expose public write policies.';
