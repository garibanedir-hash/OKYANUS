-- Okyanus Insani Yardim Dernegi
-- 013 Orphan sponsorship application, approval and matching flow
-- Amac: Yetim hamilligi basvurularini server-side write ile kayda almak,
-- admin onay/eslestirme akisini ve guvenli sponsor paneli takibini hazirlamak.
-- Gercek odeme, makbuz, SMS/e-posta, dosya upload veya hassas cocuk verisi paylasimi yoktur.

do $$ begin
  create type sponsorship_application_status as enum ('pending', 'reviewing', 'approved', 'matched', 'rejected', 'cancelled', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type sponsorship_match_status as enum ('proposed', 'approved', 'active', 'cancelled', 'archived');
exception when duplicate_object then null; end $$;

create or replace function public.generate_sponsorship_application_no()
returns text
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  return 'YHB-' || to_char(now(), 'YYYY') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
end;
$$;

create or replace function public.generate_sponsorship_no()
returns text
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  return 'YSP-' || to_char(now(), 'YYYY') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
end;
$$;

create table if not exists public.sponsorship_applications (
  id uuid primary key default gen_random_uuid(),
  application_no text unique not null default public.generate_sponsorship_application_no(),
  sponsor_account_id uuid references public.user_accounts(id) on delete set null,
  applicant_name text not null,
  applicant_email text not null,
  applicant_phone text,
  applicant_city text,
  program_id uuid references public.sponsorship_programs(id) on delete set null,
  requested_amount numeric(12,2),
  currency text not null default 'TRY',
  support_period text,
  note text,
  status sponsorship_application_status not null default 'pending',
  kvkk_accepted boolean not null default false,
  contact_permission boolean not null default false,
  source text not null default 'web',
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sponsorship_matches (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.sponsorship_applications(id) on delete cascade,
  sponsorship_id uuid references public.sponsorships(id) on delete set null,
  orphan_id uuid references public.orphan_profiles(id) on delete cascade,
  sponsor_account_id uuid references public.user_accounts(id) on delete set null,
  status sponsorship_match_status not null default 'proposed',
  proposed_by uuid,
  approved_by uuid,
  approved_at timestamptz,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sponsorship_status_logs (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.sponsorship_applications(id) on delete set null,
  sponsorship_id uuid references public.sponsorships(id) on delete set null,
  orphan_id uuid references public.orphan_profiles(id) on delete set null,
  old_status text,
  new_status text not null,
  event_type text,
  actor_id uuid,
  actor_role text,
  note text,
  created_at timestamptz not null default now()
);

alter table if exists public.sponsorships
  add column if not exists application_id uuid references public.sponsorship_applications(id) on delete set null,
  add column if not exists matched_by uuid,
  add column if not exists matched_at timestamptz,
  add column if not exists visibility_level text not null default 'limited';

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'sponsorships'
      and column_name = 'sponsor_account_id'
  ) then
    alter table public.sponsorships alter column sponsor_account_id drop not null;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'sponsorships'
      and column_name = 'sponsored_child_id'
  ) then
    alter table public.sponsorships alter column sponsored_child_id drop not null;
  end if;
end $$;

alter table if exists public.sponsorships
  alter column sponsorship_no set default public.generate_sponsorship_no();

create index if not exists sponsorship_applications_no_idx on public.sponsorship_applications(application_no);
create index if not exists sponsorship_applications_sponsor_account_idx on public.sponsorship_applications(sponsor_account_id);
create index if not exists sponsorship_applications_program_idx on public.sponsorship_applications(program_id);
create index if not exists sponsorship_applications_status_idx on public.sponsorship_applications(status);
create index if not exists sponsorship_applications_created_at_idx on public.sponsorship_applications(created_at desc);
create index if not exists sponsorship_applications_city_idx on public.sponsorship_applications(applicant_city);
create index if not exists sponsorship_matches_application_idx on public.sponsorship_matches(application_id);
create index if not exists sponsorship_matches_sponsorship_idx on public.sponsorship_matches(sponsorship_id);
create index if not exists sponsorship_matches_orphan_idx on public.sponsorship_matches(orphan_id);
create index if not exists sponsorship_matches_status_idx on public.sponsorship_matches(status);
create index if not exists sponsorship_status_logs_application_idx on public.sponsorship_status_logs(application_id, created_at desc);
create index if not exists sponsorship_status_logs_sponsorship_idx on public.sponsorship_status_logs(sponsorship_id, created_at desc);
create index if not exists sponsorship_status_logs_orphan_idx on public.sponsorship_status_logs(orphan_id, created_at desc);
create index if not exists sponsorships_application_idx on public.sponsorships(application_id);

alter table public.sponsorship_applications enable row level security;
alter table public.sponsorship_matches enable row level security;
alter table public.sponsorship_status_logs enable row level security;

alter table public.sponsorship_applications force row level security;
alter table public.sponsorship_matches force row level security;
alter table public.sponsorship_status_logs force row level security;

revoke all on table public.sponsorship_applications from anon;
revoke all on table public.sponsorship_matches from anon;
revoke all on table public.sponsorship_status_logs from anon;

grant select on table public.sponsorship_applications to authenticated;
grant select on table public.sponsorship_matches to authenticated;
grant select on table public.sponsorship_status_logs to authenticated;

do $$ begin
  create policy "admin read sponsorship applications"
  on public.sponsorship_applications for select to authenticated
  using (public.has_any_role(array['super_admin', 'admin']));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "sponsor read own sponsorship applications"
  on public.sponsorship_applications for select to authenticated
  using (
    exists (
      select 1
      from public.user_accounts ua
      where ua.auth_user_id = auth.uid()
        and ua.status = 'active'
        and (
          ua.id = sponsorship_applications.sponsor_account_id
          or lower(coalesce(ua.email, '')) = lower(coalesce(sponsorship_applications.applicant_email, ''))
        )
    )
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "admin read sponsorship matches"
  on public.sponsorship_matches for select to authenticated
  using (public.has_any_role(array['super_admin', 'admin']));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "sponsor read own sponsorship matches"
  on public.sponsorship_matches for select to authenticated
  using (
    exists (
      select 1
      from public.user_accounts ua
      where ua.auth_user_id = auth.uid()
        and ua.status = 'active'
        and ua.id = sponsorship_matches.sponsor_account_id
    )
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "permitted users read sponsorship status logs"
  on public.sponsorship_status_logs for select to authenticated
  using (
    public.has_any_role(array['super_admin', 'admin'])
    or exists (
      select 1
      from public.sponsorship_applications sa
      join public.user_accounts ua on ua.id = sa.sponsor_account_id
      where sa.id = sponsorship_status_logs.application_id
        and ua.auth_user_id = auth.uid()
        and ua.status = 'active'
    )
    or exists (
      select 1
      from public.sponsorships s
      join public.user_accounts ua on ua.id = s.sponsor_account_id
      where s.id = sponsorship_status_logs.sponsorship_id
        and ua.auth_user_id = auth.uid()
        and ua.status = 'active'
    )
  );
exception when duplicate_object then null; end $$;

-- Public/anon insert, update, delete veya hassas tablo read yoktur.
-- Basvuru yazma islemi yalnizca server action + service role repository uzerinden yapilmalidir.
-- Sponsor paneli sadece kendi sponsorship/application iliskisi ve safe view ile calismalidir.
