-- Okyanus İnsani Yardım Derneği core schema draft
-- Bu dosya çalıştırılmadan önce Supabase/Postgres ortamında gözden geçirilmelidir.

create type app_role as enum (
  'super_admin',
  'content_editor',
  'donation_manager',
  'volunteer_coordinator',
  'reporting_manager'
);

create type project_status as enum ('planning', 'active', 'completed', 'paused', 'archived');
create type donation_status as enum ('pending', 'completed', 'failed', 'cancelled', 'refunded');
create type volunteer_application_status as enum ('new', 'reviewing', 'interview', 'assigned', 'completed', 'rejected');
create type message_status as enum ('new', 'read', 'replied', 'archived');
create type report_status as enum ('draft', 'published', 'archived');
create type payment_status as enum ('pending', 'paid', 'failed', 'cancelled', 'refunded');
create type receipt_status as enum ('not_required', 'pending', 'issued', 'failed');

create table profiles (
  id uuid primary key,
  full_name text not null,
  email text not null unique,
  phone text,
  role app_role not null default 'content_editor',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table admin_roles (
  id uuid primary key default gen_random_uuid(),
  role app_role not null unique,
  label text not null,
  description text,
  created_at timestamptz not null default now()
);

create table activity_areas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null,
  description text not null,
  support_types jsonb not null default '[]',
  sort_order int default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null,
  description text not null,
  category text not null,
  status project_status not null default 'planning',
  location text,
  goal_amount numeric(12,2) not null default 0,
  raised_amount numeric(12,2) not null default 0,
  start_date date,
  end_date date,
  transparency_note text,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table project_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  content text not null,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table project_metrics (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  label text not null,
  value text not null,
  sort_order int default 0
);

create table donations (
  id uuid primary key default gen_random_uuid(),
  donor_name text not null,
  donor_email text,
  donor_phone text,
  amount numeric(12,2) not null,
  currency text not null default 'TRY',
  donation_type text not null,
  project_id uuid references projects(id) on delete set null,
  status donation_status not null default 'pending',
  payment_status payment_status not null default 'pending',
  receipt_status receipt_status not null default 'pending',
  note text,
  created_at timestamptz not null default now()
);

create table donation_transactions (
  id uuid primary key default gen_random_uuid(),
  donation_id uuid not null references donations(id) on delete cascade,
  provider text not null,
  provider_transaction_id text,
  status payment_status not null default 'pending',
  raw_payload jsonb,
  created_at timestamptz not null default now()
);

create table media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket text not null,
  path text not null,
  mime_type text not null,
  size_bytes bigint,
  alt_text text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(bucket, path)
);

create table donation_receipts (
  id uuid primary key default gen_random_uuid(),
  donation_id uuid not null references donations(id) on delete cascade,
  receipt_no text unique,
  status receipt_status not null default 'pending',
  file_asset_id uuid references media_assets(id) on delete set null,
  issued_at timestamptz
);

create table volunteer_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  city text,
  age int,
  interest_area text not null,
  experience text,
  status volunteer_application_status not null default 'new',
  note text,
  submitted_at timestamptz not null default now()
);

create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  subject text not null,
  message text not null,
  status message_status not null default 'new',
  submitted_at timestamptz not null default now()
);

create table news_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null,
  summary text not null,
  content text not null,
  related_project_id uuid references projects(id) on delete set null,
  related_activity_id uuid references activity_areas(id) on delete set null,
  status text not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  period text not null,
  category text not null,
  summary text not null,
  status report_status not null default 'draft',
  pdf_asset_id uuid references media_assets(id) on delete set null,
  metrics jsonb not null default '[]',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table legal_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  content jsonb not null,
  version int not null default 1,
  status text not null default 'draft',
  published_at timestamptz,
  updated_at timestamptz not null default now()
);

create table site_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  old_value jsonb,
  new_value jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index idx_profiles_role on profiles(role);
create index idx_projects_status on projects(status);
create index idx_projects_featured on projects(featured);
create index idx_donations_project_id on donations(project_id);
create index idx_donations_status on donations(status);
create index idx_donations_created_at on donations(created_at);
create index idx_volunteer_status on volunteer_applications(status);
create index idx_contact_status on contact_messages(status);
create index idx_news_status on news_posts(status);
create index idx_reports_status on reports(status);
create index idx_audit_actor on audit_logs(actor_id);
create index idx_audit_entity on audit_logs(entity_type, entity_id);
create index idx_audit_created_at on audit_logs(created_at);
