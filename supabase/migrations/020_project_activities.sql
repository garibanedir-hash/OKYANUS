-- Okyanus Insani Yardim Dernegi
-- 020 Project activities / field updates module
-- Bu migration makbuz, odeme veya PayTR akisini degistirmez.

do $$ begin
  create type project_activity_type as enum (
    'distribution',
    'field_visit',
    'procurement',
    'logistics',
    'education',
    'health_support',
    'qurban_distribution',
    'orphan_support',
    'emergency_aid',
    'media_record',
    'reporting',
    'meeting',
    'volunteer_work',
    'other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type project_activity_status as enum (
    'draft',
    'planned',
    'in_progress',
    'completed',
    'cancelled',
    'archived'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type project_activity_visibility as enum (
    'internal',
    'public'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.project_activities (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  slug text,
  activity_type project_activity_type not null default 'field_visit',
  status project_activity_status not null default 'draft',
  visibility project_activity_visibility not null default 'internal',
  activity_date date,
  start_time timestamptz,
  end_time timestamptz,
  country text,
  city text,
  district text,
  location_name text,
  region_label text,
  responsible_person text,
  responsible_user_id uuid,
  team_name text,
  beneficiary_count integer check (beneficiary_count is null or beneficiary_count >= 0),
  family_count integer check (family_count is null or family_count >= 0),
  distributed_item_type text,
  distributed_item_count integer check (distributed_item_count is null or distributed_item_count >= 0),
  estimated_cost numeric(14,2) check (estimated_cost is null or estimated_cost >= 0),
  currency text not null default 'TRY',
  summary text,
  description text,
  internal_notes text,
  public_summary text,
  cover_image_url text,
  gallery_urls text[] not null default '{}'::text[],
  video_url text,
  report_url text,
  related_expense_id uuid,
  created_by uuid,
  updated_by uuid,
  published_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  cancelled_reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_activity_events (
  id uuid primary key default gen_random_uuid(),
  project_activity_id uuid references public.project_activities(id) on delete cascade,
  event_type text not null,
  old_status project_activity_status,
  new_status project_activity_status,
  actor_id uuid,
  actor_role text,
  note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists project_activities_project_idx on public.project_activities(project_id);
create index if not exists project_activities_status_idx on public.project_activities(status);
create index if not exists project_activities_visibility_idx on public.project_activities(visibility);
create index if not exists project_activities_type_idx on public.project_activities(activity_type);
create index if not exists project_activities_activity_date_idx on public.project_activities(activity_date desc);
create index if not exists project_activities_created_at_idx on public.project_activities(created_at desc);
create index if not exists project_activities_public_idx
  on public.project_activities(project_id, activity_date desc)
  where visibility = 'public' and status = 'completed';
create index if not exists project_activity_events_activity_idx on public.project_activity_events(project_activity_id, created_at desc);

alter table public.project_activities enable row level security;
alter table public.project_activity_events enable row level security;
alter table public.project_activities force row level security;
alter table public.project_activity_events force row level security;

revoke all on table public.project_activities from anon;
revoke all on table public.project_activity_events from anon;

grant select (
  id,
  project_id,
  title,
  slug,
  activity_type,
  status,
  visibility,
  activity_date,
  country,
  city,
  district,
  location_name,
  region_label,
  beneficiary_count,
  family_count,
  distributed_item_type,
  distributed_item_count,
  public_summary,
  cover_image_url,
  gallery_urls,
  video_url,
  report_url,
  published_at,
  completed_at,
  created_at,
  updated_at
) on public.project_activities to anon;

grant select, insert, update, delete on table public.project_activities to authenticated;
grant select, insert on table public.project_activity_events to authenticated;

do $$ begin
  create policy "public read completed project activities"
  on public.project_activities for select to anon
  using (visibility = 'public' and status = 'completed');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "admin manage project activities"
  on public.project_activities for all to authenticated
  using (public.has_any_role(array['super_admin', 'admin']))
  with check (public.has_any_role(array['super_admin', 'admin']));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "admin manage project activity events"
  on public.project_activity_events for all to authenticated
  using (public.has_any_role(array['super_admin', 'admin']))
  with check (public.has_any_role(array['super_admin', 'admin']));
exception when duplicate_object then null; end $$;

comment on table public.project_activities is
  'Project-specific field activities and public/internal updates. Public rows must be completed and visibility public.';

comment on column public.project_activities.internal_notes is
  'Internal-only notes. Do not expose through public repositories or client-side public UI.';

comment on column public.project_activities.estimated_cost is
  'Internal cost estimate for admin reporting. Not exposed to anon column grants.';
