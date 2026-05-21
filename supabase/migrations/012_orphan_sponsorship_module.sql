-- Okyanus Insani Yardim Dernegi
-- 012 Orphan sponsorship module schema and read policy preparation
-- Amac: Yetim hamiliği programlari, sponsor kayitlari, guvenli yetim ozetleri,
-- saha gorevleri, bildirim hazirligi ve export raporlama modelini kurmak.
-- Bu migration staging ortaminda test edilmeden production'da calistirilmamalidir.
-- Gercek odeme, makbuz, SMS/e-posta, dosya upload ve hassas veri paylasimi bu asamada yoktur.

do $$ begin
  create type orphan_profile_status as enum ('draft', 'active', 'sponsored', 'waiting', 'inactive', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type sponsorship_program_status as enum ('draft', 'active', 'paused', 'completed', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type sponsorship_status as enum ('pending', 'active', 'payment_pending', 'payment_failed', 'paused', 'completed', 'cancelled', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type sponsorship_payment_status as enum ('pending', 'paid', 'failed', 'refunded', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type orphan_update_status as enum ('draft', 'published', 'hidden', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type orphan_assignment_status as enum ('assigned', 'in_progress', 'reported', 'closed', 'cancelled');
exception when duplicate_object then null; end $$;

create table if not exists public.orphan_profiles (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  display_name text not null,
  safe_name text,
  gender text,
  birth_year integer,
  age_group text,
  country text,
  city_or_region text,
  education_status text,
  general_health_note text,
  family_status_summary text,
  sponsorship_need_amount numeric(12,2),
  currency text not null default 'TRY',
  status orphan_profile_status not null default 'draft',
  visibility_level text not null default 'limited',
  photo_url text,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sponsorship_programs (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  monthly_amount numeric(12,2),
  currency text not null default 'TRY',
  country text,
  region text,
  description text,
  short_description text,
  status sponsorship_program_status not null default 'draft',
  start_date date,
  end_date date,
  transparency_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sponsorships (
  id uuid primary key default gen_random_uuid(),
  sponsorship_no text unique not null,
  sponsor_account_id uuid references public.user_accounts(id) on delete set null,
  sponsor_name text,
  sponsor_email text,
  sponsor_phone text,
  orphan_id uuid references public.orphan_profiles(id) on delete set null,
  program_id uuid references public.sponsorship_programs(id) on delete set null,
  monthly_amount numeric(12,2),
  currency text not null default 'TRY',
  start_date date,
  end_date date,
  status sponsorship_status not null default 'pending',
  payment_status sponsorship_payment_status not null default 'pending',
  last_payment_date date,
  next_payment_date date,
  note text,
  kvkk_accepted boolean not null default false,
  contact_permission boolean not null default false,
  source text not null default 'web',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.sponsorships
  add column if not exists sponsorship_no text,
  add column if not exists sponsor_name text,
  add column if not exists sponsor_email text,
  add column if not exists sponsor_phone text,
  add column if not exists orphan_id uuid references public.orphan_profiles(id) on delete set null,
  add column if not exists program_id uuid references public.sponsorship_programs(id) on delete set null,
  add column if not exists monthly_amount numeric(12,2),
  add column if not exists currency text not null default 'TRY',
  add column if not exists end_date date,
  add column if not exists status sponsorship_status not null default 'pending',
  add column if not exists payment_status sponsorship_payment_status not null default 'pending',
  add column if not exists last_payment_date date,
  add column if not exists next_payment_date date,
  add column if not exists note text,
  add column if not exists kvkk_accepted boolean not null default false,
  add column if not exists contact_permission boolean not null default false,
  add column if not exists source text not null default 'web';

update public.sponsorships
set sponsorship_no = 'YSP-' || to_char(coalesce(created_at, now()), 'YYYY') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6))
where sponsorship_no is null;

alter table if exists public.sponsorships
  alter column sponsorship_no set not null;

create table if not exists public.sponsorship_payments (
  id uuid primary key default gen_random_uuid(),
  sponsorship_id uuid references public.sponsorships(id) on delete cascade,
  amount numeric(12,2),
  currency text not null default 'TRY',
  status sponsorship_payment_status not null default 'pending',
  payment_date date,
  provider text,
  provider_reference text,
  receipt_status text,
  created_at timestamptz not null default now()
);

create table if not exists public.orphan_updates (
  id uuid primary key default gen_random_uuid(),
  orphan_id uuid references public.orphan_profiles(id) on delete cascade,
  sponsorship_id uuid references public.sponsorships(id) on delete set null,
  title text not null,
  summary text,
  content text,
  update_type text,
  status orphan_update_status not null default 'draft',
  published_at timestamptz,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orphan_sponsorship_notes (
  id uuid primary key default gen_random_uuid(),
  orphan_id uuid references public.orphan_profiles(id) on delete cascade,
  sponsorship_id uuid references public.sponsorships(id) on delete set null,
  note text,
  visibility text not null default 'internal',
  created_by uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.orphan_assignments (
  id uuid primary key default gen_random_uuid(),
  orphan_id uuid references public.orphan_profiles(id) on delete cascade,
  sponsorship_id uuid references public.sponsorships(id) on delete set null,
  assigned_to uuid references public.user_accounts(id) on delete set null,
  assigned_by uuid references public.user_accounts(id) on delete set null,
  assignment_type text,
  status orphan_assignment_status not null default 'assigned',
  due_date date,
  completed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sponsorship_notifications (
  id uuid primary key default gen_random_uuid(),
  sponsorship_id uuid references public.sponsorships(id) on delete cascade,
  sponsor_email text,
  sponsor_phone text,
  channel text,
  template_key text,
  status text not null default 'pending',
  sent_at timestamptz,
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.sponsorship_exports (
  id uuid primary key default gen_random_uuid(),
  export_type text,
  requested_by uuid,
  filter_summary jsonb,
  masked boolean not null default true,
  status text not null default 'prepared',
  created_at timestamptz not null default now()
);

create or replace view public.sponsored_orphans_safe_view as
select
  op.id as orphan_id,
  op.code,
  coalesce(nullif(op.safe_name, ''), op.display_name) as safe_name,
  op.age_group,
  op.country,
  op.city_or_region,
  op.education_status,
  op.general_health_note,
  s.status as sponsorship_status,
  s.sponsor_account_id,
  s.id as sponsorship_id
from public.orphan_profiles op
join public.sponsorships s on s.orphan_id = op.id
where
  exists (
    select 1
    from public.user_accounts ua
    where ua.id = s.sponsor_account_id
      and ua.auth_user_id = auth.uid()
      and ua.status = 'active'
  )
  or public.has_any_role(array['super_admin', 'admin']);

create index if not exists orphan_profiles_status_idx on public.orphan_profiles(status);
create index if not exists orphan_profiles_country_region_idx on public.orphan_profiles(country, city_or_region);
create index if not exists sponsorship_programs_status_idx on public.sponsorship_programs(status);
create index if not exists sponsorship_programs_slug_idx on public.sponsorship_programs(slug);
create index if not exists sponsorships_no_idx on public.sponsorships(sponsorship_no);
create index if not exists sponsorships_sponsor_account_id_idx on public.sponsorships(sponsor_account_id);
create index if not exists sponsorships_orphan_id_idx on public.sponsorships(orphan_id);
create index if not exists sponsorships_status_idx on public.sponsorships(status);
create index if not exists sponsorships_payment_status_idx on public.sponsorships(payment_status);
create index if not exists sponsorship_payments_sponsorship_id_idx on public.sponsorship_payments(sponsorship_id);
create index if not exists orphan_updates_orphan_status_idx on public.orphan_updates(orphan_id, status);
create index if not exists orphan_assignments_assigned_status_idx on public.orphan_assignments(assigned_to, status);

alter table public.orphan_profiles enable row level security;
alter table public.sponsorship_programs enable row level security;
alter table public.sponsorships enable row level security;
alter table public.sponsorship_payments enable row level security;
alter table public.orphan_updates enable row level security;
alter table public.orphan_sponsorship_notes enable row level security;
alter table public.orphan_assignments enable row level security;
alter table public.sponsorship_notifications enable row level security;
alter table public.sponsorship_exports enable row level security;

alter table public.orphan_profiles force row level security;
alter table public.sponsorships force row level security;
alter table public.sponsorship_payments force row level security;
alter table public.orphan_updates force row level security;
alter table public.orphan_sponsorship_notes force row level security;
alter table public.orphan_assignments force row level security;
alter table public.sponsorship_notifications force row level security;
alter table public.sponsorship_exports force row level security;

grant select on table public.sponsorship_programs to anon, authenticated;
grant select on table public.sponsored_orphans_safe_view to authenticated;

revoke all on table public.orphan_profiles from anon;
revoke all on table public.sponsorships from anon;
revoke all on table public.sponsorship_payments from anon;
revoke all on table public.orphan_updates from anon;
revoke all on table public.orphan_sponsorship_notes from anon;
revoke all on table public.orphan_assignments from anon;
revoke all on table public.sponsorship_notifications from anon;
revoke all on table public.sponsorship_exports from anon;
revoke all on table public.sponsored_orphans_safe_view from anon;

grant select on table public.orphan_profiles to authenticated;
grant select on table public.sponsorships to authenticated;
grant select on table public.sponsorship_payments to authenticated;
grant select on table public.orphan_updates to authenticated;
grant select on table public.orphan_sponsorship_notes to authenticated;
grant select on table public.orphan_assignments to authenticated;
grant select on table public.sponsorship_notifications to authenticated;
grant select on table public.sponsorship_exports to authenticated;

do $$ begin
  create policy "public read active sponsorship programs"
  on public.sponsorship_programs for select to anon, authenticated
  using (status = 'active');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "admin read all sponsorship programs"
  on public.sponsorship_programs for select to authenticated
  using (public.has_any_role(array['super_admin', 'admin']));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "admin and assigned users read orphan profiles"
  on public.orphan_profiles for select to authenticated
  using (
    public.has_any_role(array['super_admin', 'admin'])
    or exists (
      select 1
      from public.orphan_assignments oa
      join public.user_accounts ua on ua.id = oa.assigned_to
      where oa.orphan_id = orphan_profiles.id
        and ua.auth_user_id = auth.uid()
        and ua.status = 'active'
    )
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "sponsor read own sponsorships"
  on public.sponsorships for select to authenticated
  using (
    exists (
      select 1
      from public.user_accounts ua
      where ua.id = sponsorships.sponsor_account_id
        and ua.auth_user_id = auth.uid()
        and ua.status = 'active'
    )
    or public.has_any_role(array['super_admin', 'admin'])
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "sponsor read own sponsorship payments"
  on public.sponsorship_payments for select to authenticated
  using (
    exists (
      select 1
      from public.sponsorships s
      join public.user_accounts ua on ua.id = s.sponsor_account_id
      where s.id = sponsorship_payments.sponsorship_id
        and ua.auth_user_id = auth.uid()
        and ua.status = 'active'
    )
    or public.has_any_role(array['super_admin', 'admin'])
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "permitted users read orphan updates"
  on public.orphan_updates for select to authenticated
  using (
    (
      status = 'published'
      and exists (
        select 1
        from public.sponsorships s
        join public.user_accounts ua on ua.id = s.sponsor_account_id
        where s.id = orphan_updates.sponsorship_id
          and ua.auth_user_id = auth.uid()
          and ua.status = 'active'
      )
    )
    or exists (
      select 1
      from public.orphan_assignments oa
      join public.user_accounts ua on ua.id = oa.assigned_to
      where oa.orphan_id = orphan_updates.orphan_id
        and ua.auth_user_id = auth.uid()
        and ua.status = 'active'
    )
    or public.has_any_role(array['super_admin', 'admin'])
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "internal users read orphan notes"
  on public.orphan_sponsorship_notes for select to authenticated
  using (
    public.has_any_role(array['super_admin', 'admin'])
    or exists (
      select 1
      from public.orphan_assignments oa
      join public.user_accounts ua on ua.id = oa.assigned_to
      where oa.orphan_id = orphan_sponsorship_notes.orphan_id
        and ua.auth_user_id = auth.uid()
        and ua.status = 'active'
    )
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "assigned users read orphan assignments"
  on public.orphan_assignments for select to authenticated
  using (
    exists (
      select 1
      from public.user_accounts ua
      where ua.id = orphan_assignments.assigned_to
        and ua.auth_user_id = auth.uid()
        and ua.status = 'active'
    )
    or public.has_any_role(array['super_admin', 'admin'])
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "sponsor read own sponsorship notifications"
  on public.sponsorship_notifications for select to authenticated
  using (
    exists (
      select 1
      from public.sponsorships s
      join public.user_accounts ua on ua.id = s.sponsor_account_id
      where s.id = sponsorship_notifications.sponsorship_id
        and ua.auth_user_id = auth.uid()
        and ua.status = 'active'
    )
    or public.has_any_role(array['super_admin', 'admin'])
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "admin read sponsorship exports"
  on public.sponsorship_exports for select to authenticated
  using (public.has_any_role(array['super_admin', 'admin']));
exception when duplicate_object then null; end $$;

-- Public/anon insert, update ve delete yoktur.
-- Public/anon orphan_profiles veya sponsorship tablolari okuyamaz.
-- Sponsor paneli icin yalnizca safe view ve kendi sponsorship iliskisi kullanilmalidir.
-- Cocuklara ait acik kimlik, acik adres, okul adi, telefon ve aile detayi bu modelde public gosterilmez.
