-- Okyanus İnsani Yardım Derneği
-- 009 Admin content CRUD policies
-- Amaç: Admin/super_admin kullanıcıların yalnızca düşük riskli public içerik tablolarında
-- controlled write yapabilmesi. Staging ortamında test edilmeden production'da çalıştırılmamalıdır.

alter type project_status add value if not exists 'draft' before 'planning';

alter table if exists public.projects
  add column if not exists metrics jsonb not null default '[]'::jsonb,
  add column if not exists impact_items text[] not null default '{}',
  add column if not exists scope_items text[] not null default '{}',
  add column if not exists cta jsonb not null default '{}'::jsonb;

alter table if exists public.news_posts
  add column if not exists tags text[] not null default '{}',
  add column if not exists related_project_slug text,
  add column if not exists related_activity_slug text,
  add column if not exists cover_image_url text;

alter table if exists public.reports
  add column if not exists file_url text;

create or replace function public.is_content_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_any_role(array['super_admin', 'admin']);
$$;

grant execute on function public.is_content_admin_user() to authenticated;

alter table if exists public.projects enable row level security;
alter table if exists public.news_posts enable row level security;
alter table if exists public.reports enable row level security;
alter table if exists public.project_updates enable row level security;
alter table if exists public.project_metrics enable row level security;

grant select, insert, update on table public.projects to authenticated;
grant select, insert, update on table public.news_posts to authenticated;
grant select, insert, update on table public.reports to authenticated;
grant select, insert, update on table public.project_updates to authenticated;
grant select, insert, update on table public.project_metrics to authenticated;

-- Public SELECT policy'leri 006 migration'dan korunur. Aşağıdaki SELECT policy'leri
-- yalnızca authenticated admin/super_admin kullanıcıların taslak/arşiv dahil tüm public içerik
-- kayıtlarını yönetim panelinde görebilmesi içindir.

do $$ begin
  create policy "admin read all projects"
  on public.projects for select to authenticated
  using (public.is_content_admin_user());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "admin insert projects"
  on public.projects for insert to authenticated
  with check (public.is_content_admin_user());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "admin update projects"
  on public.projects for update to authenticated
  using (public.is_content_admin_user())
  with check (public.is_content_admin_user());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "admin read all news posts"
  on public.news_posts for select to authenticated
  using (public.is_content_admin_user());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "admin insert news posts"
  on public.news_posts for insert to authenticated
  with check (public.is_content_admin_user());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "admin update news posts"
  on public.news_posts for update to authenticated
  using (public.is_content_admin_user())
  with check (public.is_content_admin_user());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "admin read all reports"
  on public.reports for select to authenticated
  using (public.is_content_admin_user());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "admin insert reports"
  on public.reports for insert to authenticated
  with check (public.is_content_admin_user());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "admin update reports"
  on public.reports for update to authenticated
  using (public.is_content_admin_user())
  with check (public.is_content_admin_user());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "admin read project updates"
  on public.project_updates for select to authenticated
  using (public.is_content_admin_user());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "admin write project updates"
  on public.project_updates for insert to authenticated
  with check (public.is_content_admin_user());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "admin update project updates"
  on public.project_updates for update to authenticated
  using (public.is_content_admin_user())
  with check (public.is_content_admin_user());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "admin read project metrics"
  on public.project_metrics for select to authenticated
  using (public.is_content_admin_user());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "admin write project metrics"
  on public.project_metrics for insert to authenticated
  with check (public.is_content_admin_user());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "admin update project metrics"
  on public.project_metrics for update to authenticated
  using (public.is_content_admin_user())
  with check (public.is_content_admin_user());
exception when duplicate_object then null; end $$;

-- Hard delete bu aşamada açılmaz. Silme yerine status = 'archived' / 'draft' kullanılır.
-- Hassas operasyonel tablolar için insert/update/delete policy eklenmez.
