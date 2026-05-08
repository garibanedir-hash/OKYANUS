-- Okyanus İnsani Yardım Derneği
-- 005 Portal access and sponsorship draft
-- Taslak migration: staging ortamında RLS/security review yapılmadan production'da çalıştırılmamalıdır.

create table if not exists user_accounts (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  full_name text not null,
  email text not null,
  phone text,
  city text,
  account_type text not null,
  role text not null default 'donor',
  status text not null default 'active',
  profile_completion integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists donor_profiles (
  id uuid primary key default gen_random_uuid(),
  user_account_id uuid not null references user_accounts(id) on delete cascade,
  preferred_donation_types text[] default '{}',
  communication_permission boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists volunteer_profiles (
  id uuid primary key default gen_random_uuid(),
  user_account_id uuid not null references user_accounts(id) on delete cascade,
  interest_areas text[] default '{}',
  application_status text not null default 'new',
  city text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sponsored_children (
  id uuid primary key default gen_random_uuid(),
  sponsorship_code text not null unique,
  masked_name text not null,
  age_range text not null,
  region text not null,
  education_status text,
  privacy_level text not null default 'restricted',
  internal_sensitive_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sponsorships (
  id uuid primary key default gen_random_uuid(),
  sponsor_account_id uuid not null references user_accounts(id) on delete cascade,
  sponsored_child_id uuid not null references sponsored_children(id) on delete restrict,
  support_status text not null default 'active',
  start_date date,
  last_update_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists portal_notifications (
  id uuid primary key default gen_random_uuid(),
  user_account_id uuid not null references user_accounts(id) on delete cascade,
  notification_type text not null,
  title text not null,
  summary text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists volunteer_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date timestamptz not null,
  location text not null,
  capacity integer,
  coordinator_id uuid references user_accounts(id) on delete set null,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists event_applications (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references volunteer_events(id) on delete cascade,
  user_account_id uuid not null references user_accounts(id) on delete cascade,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  unique (event_id, user_account_id)
);

create table if not exists panel_access_rules (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  panel_scope text not null,
  rule jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists role_permissions (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  permission_module text not null,
  permission_action text not null,
  allowed boolean not null default false,
  created_at timestamptz not null default now(),
  unique (role, permission_module, permission_action)
);

create table if not exists coordinator_assignments (
  id uuid primary key default gen_random_uuid(),
  coordinator_id uuid not null references user_accounts(id) on delete cascade,
  entity_type text not null,
  entity_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists staff_assignments (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references user_accounts(id) on delete cascade,
  coordinator_id uuid references user_accounts(id) on delete set null,
  responsibility_area text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_user_accounts_auth_user on user_accounts(auth_user_id);
create index if not exists idx_user_accounts_role_status on user_accounts(role, status);
create index if not exists idx_sponsorships_sponsor on sponsorships(sponsor_account_id);
create index if not exists idx_portal_notifications_user on portal_notifications(user_account_id, created_at desc);
create index if not exists idx_event_applications_user on event_applications(user_account_id);
create index if not exists idx_role_permissions_role on role_permissions(role);
create index if not exists idx_coordinator_assignments_coordinator on coordinator_assignments(coordinator_id);
create index if not exists idx_staff_assignments_staff on staff_assignments(staff_id);

-- RLS notu:
-- Bağışçı sadece kendi user_account, donation ve sponsorship kayıtlarını okuyabilmelidir.
-- Sponsored child hassas alanları sponsor tarafına açılmamalıdır; yalnızca maskeli/sınırlı görünüm sağlanmalıdır.
-- Koordinatör sadece coordinator_assignments kapsamındaki ekip/faaliyetleri okuyabilmelidir.
-- Personel sadece staff_assignments ve kendisine atanan görev/mesaj kayıtlarını okuyabilmelidir.
