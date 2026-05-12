-- Okyanus İnsani Yardım Derneği
-- 006 Lockdown sensitive tables
-- Amaç: anon/public kullanıcıların hassas tabloları okuyamamasını sağlamak.
-- Production öncesi staging ortamında çalıştırılmalı ve `npm run test:supabase` ile doğrulanmalıdır.

do $$
declare
  sensitive_table text;
  policy_record record;
  sensitive_tables text[] := array[
    'donations',
    'donation_transactions',
    'donation_receipts',
    'volunteer_applications',
    'contact_messages',
    'internal_tasks',
    'task_comments',
    'internal_conversations',
    'internal_messages',
    'message_read_receipts',
    'export_logs',
    'user_accounts',
    'donor_profiles',
    'volunteer_profiles',
    'sponsored_children',
    'sponsorships',
    'portal_notifications',
    'volunteer_events',
    'event_applications',
    'panel_access_rules',
    'role_permissions',
    'coordinator_assignments',
    'staff_assignments',
    'profiles',
    'admin_roles',
    'audit_logs',
    'media_assets'
  ];
begin
  foreach sensitive_table in array sensitive_tables loop
    if to_regclass(format('public.%I', sensitive_table)) is not null then
      execute format('alter table public.%I enable row level security', sensitive_table);
      execute format('alter table public.%I force row level security', sensitive_table);
      execute format('revoke all on table public.%I from anon', sensitive_table);

      -- RLS permissive olduğu için deny policy yeterli değildir.
      -- Hassas tablolarda mevcut SELECT policy'leri kaldırılır; 8C'de authenticated ownership/role policy'leri ayrı eklenecektir.
      for policy_record in
        select policyname
        from pg_policies
        where schemaname = 'public'
          and tablename = sensitive_table
          and cmd = 'SELECT'
      loop
        execute format('drop policy if exists %I on public.%I', policy_record.policyname, sensitive_table);
      end loop;
    end if;
  end loop;
end $$;

-- Public okunması beklenen tablolar:
-- projects: sadece active/completed
-- news_posts: sadece published
-- reports: sadece published
-- activity_areas: sadece published
-- legal_pages: sadece published
-- site_settings: production'da public allowlist ile daraltılmalıdır.

do $$ begin
  create policy "public read published activity areas"
  on activity_areas for select
  using (published = true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "public read active projects"
  on projects for select
  using (status in ('active', 'completed'));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "public read published news"
  on news_posts for select
  using (status = 'published');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "public read published reports"
  on reports for select
  using (status = 'published');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "public read published legal pages"
  on legal_pages for select
  using (status = 'published');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "public read safe site settings"
  on site_settings for select
  using (key in ('organization', 'donation_defaults'));
exception when duplicate_object then null; end $$;
