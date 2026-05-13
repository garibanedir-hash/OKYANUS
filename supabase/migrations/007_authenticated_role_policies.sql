-- Okyanus İnsani Yardım Derneği
-- 007 Authenticated role and ownership policy draft
-- Amaç: 006 public lockdown bozulmadan authenticated kullanıcılar için kontrollü read policy hazırlığı yapmak.
-- Staging ortamında test edilmeden production'da çalıştırılmamalıdır.

create or replace function public.current_user_roles()
returns text[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(array_agg(distinct role_value), array[]::text[])
  from (
    select p.role::text as role_value
    from public.profiles p
    where p.id = auth.uid()
      and p.status = 'active'
    union all
    select lower(ua.role) as role_value
    from public.user_accounts ua
    where ua.auth_user_id = auth.uid()
      and ua.status = 'active'
    union all
    select lower(ua.account_type) as role_value
    from public.user_accounts ua
    where ua.auth_user_id = auth.uid()
      and ua.status = 'active'
  ) roles
  where role_value is not null;
$$;

create or replace function public.has_role(required_role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select lower(required_role) = any(public.current_user_roles());
$$;

create or replace function public.has_any_role(required_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from unnest(required_roles) as required_role
    where lower(required_role) = any(public.current_user_roles())
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role('super_admin');
$$;

create or replace function public.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_any_role(array[
    'super_admin',
    'admin',
    'content_editor',
    'donation_manager',
    'volunteer_coordinator',
    'reporting_manager'
  ]);
$$;

grant execute on function public.current_user_roles() to authenticated;
grant execute on function public.has_role(text) to authenticated;
grant execute on function public.has_any_role(text[]) to authenticated;
grant execute on function public.is_super_admin() to authenticated;
grant execute on function public.is_admin_user() to authenticated;

do $$
declare
  sensitive_table text;
  sensitive_tables text[] := array[
    'profiles',
    'admin_roles',
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
    'audit_logs',
    'media_assets'
  ];
begin
  foreach sensitive_table in array sensitive_tables loop
    if to_regclass(format('public.%I', sensitive_table)) is not null then
      execute format('alter table public.%I enable row level security', sensitive_table);
      execute format('alter table public.%I force row level security', sensitive_table);
      execute format('revoke all on table public.%I from anon', sensitive_table);
      execute format('grant select on table public.%I to authenticated', sensitive_table);
    end if;
  end loop;
end $$;

do $$ begin
  create policy "authenticated read own profile"
  on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin_user());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "authenticated read admin roles"
  on public.admin_roles for select to authenticated
  using (public.is_admin_user());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "authenticated read own account"
  on public.user_accounts for select to authenticated
  using (auth_user_id = auth.uid() or public.is_admin_user());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "authenticated read own donor profile"
  on public.donor_profiles for select to authenticated
  using (
    exists (
      select 1 from public.user_accounts ua
      where ua.id = donor_profiles.user_account_id
        and ua.auth_user_id = auth.uid()
    )
    or public.is_admin_user()
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "authenticated read own volunteer profile"
  on public.volunteer_profiles for select to authenticated
  using (
    exists (
      select 1 from public.user_accounts ua
      where ua.id = volunteer_profiles.user_account_id
        and ua.auth_user_id = auth.uid()
    )
    or public.is_admin_user()
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "authenticated read own donations"
  on public.donations for select to authenticated
  using (
    donor_email = auth.email()
    or public.has_any_role(array['super_admin', 'admin', 'donation_manager'])
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "authenticated read permitted donation transactions"
  on public.donation_transactions for select to authenticated
  using (
    exists (
      select 1 from public.donations d
      where d.id = donation_transactions.donation_id
        and (d.donor_email = auth.email() or public.has_any_role(array['super_admin', 'admin', 'donation_manager']))
    )
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "authenticated read permitted donation receipts"
  on public.donation_receipts for select to authenticated
  using (
    exists (
      select 1 from public.donations d
      where d.id = donation_receipts.donation_id
        and (d.donor_email = auth.email() or public.has_any_role(array['super_admin', 'admin', 'donation_manager']))
    )
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "authenticated read own volunteer applications"
  on public.volunteer_applications for select to authenticated
  using (
    email = auth.email()
    or public.has_any_role(array['super_admin', 'admin', 'volunteer_coordinator'])
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "authenticated read own contact messages"
  on public.contact_messages for select to authenticated
  using (
    email = auth.email()
    or public.has_any_role(array['super_admin', 'admin'])
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "authenticated read own sponsorships"
  on public.sponsorships for select to authenticated
  using (
    exists (
      select 1 from public.user_accounts ua
      where ua.id = sponsorships.sponsor_account_id
        and ua.auth_user_id = auth.uid()
    )
    or public.is_admin_user()
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "authenticated read sponsored child through sponsorship"
  on public.sponsored_children for select to authenticated
  using (
    exists (
      select 1
      from public.sponsorships s
      join public.user_accounts ua on ua.id = s.sponsor_account_id
      where s.sponsored_child_id = sponsored_children.id
        and ua.auth_user_id = auth.uid()
    )
    or public.is_admin_user()
  );
exception when duplicate_object then null; end $$;

create or replace view public.sponsored_children_safe
with (security_invoker = true)
as
select
  id,
  sponsorship_code,
  masked_name,
  age_range,
  region,
  education_status,
  privacy_level,
  created_at,
  updated_at
from public.sponsored_children;

grant select on public.sponsored_children_safe to authenticated;

do $$ begin
  create policy "authenticated read own notifications"
  on public.portal_notifications for select to authenticated
  using (
    exists (
      select 1 from public.user_accounts ua
      where ua.id = portal_notifications.user_account_id
        and ua.auth_user_id = auth.uid()
    )
    or public.is_admin_user()
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "authenticated read volunteer events"
  on public.volunteer_events for select to authenticated
  using (status in ('open', 'planned', 'active') or public.is_admin_user());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "authenticated read own event applications"
  on public.event_applications for select to authenticated
  using (
    exists (
      select 1 from public.user_accounts ua
      where ua.id = event_applications.user_account_id
        and ua.auth_user_id = auth.uid()
    )
    or public.has_any_role(array['super_admin', 'admin', 'volunteer_coordinator'])
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "authenticated read own staff assignments"
  on public.staff_assignments for select to authenticated
  using (
    exists (
      select 1 from public.user_accounts ua
      where ua.id = staff_assignments.staff_id
        and ua.auth_user_id = auth.uid()
    )
    or exists (
      select 1 from public.user_accounts ua
      where ua.id = staff_assignments.coordinator_id
        and ua.auth_user_id = auth.uid()
    )
    or public.is_admin_user()
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "authenticated read own coordinator assignments"
  on public.coordinator_assignments for select to authenticated
  using (
    exists (
      select 1 from public.user_accounts ua
      where ua.id = coordinator_assignments.coordinator_id
        and ua.auth_user_id = auth.uid()
    )
    or public.is_admin_user()
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "authenticated read permitted internal tasks"
  on public.internal_tasks for select to authenticated
  using (
    assigned_to = auth.uid()
    or assigned_by = auth.uid()
    or public.is_admin_user()
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "authenticated read permitted task comments"
  on public.task_comments for select to authenticated
  using (
    author_id = auth.uid()
    or exists (
      select 1 from public.internal_tasks t
      where t.id = task_comments.task_id
        and (t.assigned_to = auth.uid() or t.assigned_by = auth.uid())
    )
    or public.is_admin_user()
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "authenticated read permitted internal messages"
  on public.internal_messages for select to authenticated
  using (
    sender_id = auth.uid()
    or exists (
      select 1 from public.internal_tasks t
      where t.id = internal_messages.related_task_id
        and (t.assigned_to = auth.uid() or t.assigned_by = auth.uid())
    )
    or public.is_admin_user()
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "authenticated read permitted internal conversations"
  on public.internal_conversations for select to authenticated
  using (
    exists (
      select 1 from public.internal_messages m
      where m.conversation_id = internal_conversations.id
        and m.sender_id = auth.uid()
    )
    or exists (
      select 1 from public.internal_tasks t
      where t.id = internal_conversations.related_task_id
        and (t.assigned_to = auth.uid() or t.assigned_by = auth.uid())
    )
    or public.is_admin_user()
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "authenticated read own message receipts"
  on public.message_read_receipts for select to authenticated
  using (reader_id = auth.uid() or public.is_admin_user());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "authenticated read role permissions"
  on public.role_permissions for select to authenticated
  using (
    public.is_admin_user()
    or lower(role) = any(public.current_user_roles())
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "authenticated read panel access rules"
  on public.panel_access_rules for select to authenticated
  using (
    public.is_admin_user()
    or lower(role) = any(public.current_user_roles())
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "authenticated read export logs"
  on public.export_logs for select to authenticated
  using (public.has_any_role(array['super_admin', 'admin', 'donation_manager', 'reporting_manager']));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "authenticated read audit logs"
  on public.audit_logs for select to authenticated
  using (public.is_super_admin());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "authenticated read media assets"
  on public.media_assets for select to authenticated
  using (public.is_admin_user());
exception when duplicate_object then null; end $$;

-- Güvenlik notları:
-- 1. Bu migration hassas tabloları anon/public erişime açmaz.
-- 2. Bağış ownership mevcut şemada donor_email = auth.email() ile taslaklanmıştır; 8E'de user_account_id/donor_profile_id ilişkisi önerilir.
-- 3. sponsored_children tablosunda hassas alanlar bulunduğu için uygulama tarafı `sponsored_children_safe` view'ını kullanmalıdır.
-- 4. SECURITY DEFINER helper fonksiyonları search_path=public ile sınırlandırılmıştır; production öncesi ayrıca security review yapılmalıdır.
