-- Okyanus İnsani Yardım Derneği
-- 8E test user setup examples
-- Bu dosya production migration değildir. Yalnızca staging ortamında test kullanıcıları hazırlamak için örnek SQL rehberidir.
-- Gerçek e-posta, gerçek Auth UID veya gerçek şifre yazmayın.
-- Placeholder'ları staging değerleriyle değiştirin:
--   AUTH_USER_ID, TEST_EMAIL, FULL_NAME, ROLE, ACCOUNT_TYPE
-- Not: Staging şemasında public.profiles.role alanı app_role enum'u ise portal rollerini
-- (donor/volunteer/coordinator/staff) desteklediğini doğrulayın. Desteklemiyorsa bu örnekleri
-- şema genişletmesi sonrası çalıştırın veya 8E doğrulamasında user_accounts kaynaklarını esas alın.

-- A) Bağışçı test kullanıcısı
-- Beklenen route: /panel/bagisci
insert into public.profiles (id, full_name, email, role, status)
values ('AUTH_USER_ID', 'FULL_NAME', 'TEST_EMAIL', 'donor', 'active')
on conflict (id) do update set
  full_name = excluded.full_name,
  email = excluded.email,
  role = excluded.role,
  status = excluded.status,
  updated_at = now();

with account_row as (
  insert into public.user_accounts (auth_user_id, full_name, email, account_type, role, status, profile_completion)
  values ('AUTH_USER_ID', 'FULL_NAME', 'TEST_EMAIL', 'donor', 'donor', 'active', 100)
  on conflict (auth_user_id) do update set
    full_name = excluded.full_name,
    email = excluded.email,
    account_type = excluded.account_type,
    role = excluded.role,
    status = excluded.status,
    profile_completion = excluded.profile_completion,
    updated_at = now()
  returning id
)
insert into public.donor_profiles (user_account_id, preferred_donation_types, communication_permission)
select id, array['general_support'], false from account_row
on conflict do nothing;

-- B) Gönüllü test kullanıcısı
-- Beklenen route: /panel/gonullu
insert into public.profiles (id, full_name, email, role, status)
values ('AUTH_USER_ID', 'FULL_NAME', 'TEST_EMAIL', 'volunteer', 'active')
on conflict (id) do update set
  full_name = excluded.full_name,
  email = excluded.email,
  role = excluded.role,
  status = excluded.status,
  updated_at = now();

with account_row as (
  insert into public.user_accounts (auth_user_id, full_name, email, account_type, role, status, profile_completion)
  values ('AUTH_USER_ID', 'FULL_NAME', 'TEST_EMAIL', 'volunteer', 'volunteer', 'active', 100)
  on conflict (auth_user_id) do update set
    full_name = excluded.full_name,
    email = excluded.email,
    account_type = excluded.account_type,
    role = excluded.role,
    status = excluded.status,
    profile_completion = excluded.profile_completion,
    updated_at = now()
  returning id
)
insert into public.volunteer_profiles (user_account_id, interest_areas, application_status, city)
select id, array['field_support'], 'approved', null from account_row
on conflict do nothing;

-- C) Koordinatör test kullanıcısı
-- Beklenen route: /koordinator
insert into public.profiles (id, full_name, email, role, status)
values ('AUTH_USER_ID', 'FULL_NAME', 'TEST_EMAIL', 'coordinator', 'active')
on conflict (id) do update set
  full_name = excluded.full_name,
  email = excluded.email,
  role = excluded.role,
  status = excluded.status,
  updated_at = now();

with account_row as (
  insert into public.user_accounts (auth_user_id, full_name, email, account_type, role, status, profile_completion)
  values ('AUTH_USER_ID', 'FULL_NAME', 'TEST_EMAIL', 'coordinator', 'coordinator', 'active', 100)
  on conflict (auth_user_id) do update set
    full_name = excluded.full_name,
    email = excluded.email,
    account_type = excluded.account_type,
    role = excluded.role,
    status = excluded.status,
    profile_completion = excluded.profile_completion,
    updated_at = now()
  returning id
)
insert into public.coordinator_assignments (coordinator_id, entity_type, entity_id)
select id, 'demo_scope', null from account_row
on conflict do nothing;

-- D) Personel test kullanıcısı
-- Beklenen route: /personel
insert into public.profiles (id, full_name, email, role, status)
values ('AUTH_USER_ID', 'FULL_NAME', 'TEST_EMAIL', 'staff', 'active')
on conflict (id) do update set
  full_name = excluded.full_name,
  email = excluded.email,
  role = excluded.role,
  status = excluded.status,
  updated_at = now();

with account_row as (
  insert into public.user_accounts (auth_user_id, full_name, email, account_type, role, status, profile_completion)
  values ('AUTH_USER_ID', 'FULL_NAME', 'TEST_EMAIL', 'staff', 'staff', 'active', 100)
  on conflict (auth_user_id) do update set
    full_name = excluded.full_name,
    email = excluded.email,
    account_type = excluded.account_type,
    role = excluded.role,
    status = excluded.status,
    profile_completion = excluded.profile_completion,
    updated_at = now()
  returning id
)
insert into public.staff_assignments (staff_id, coordinator_id, responsibility_area)
select id, null, 'demo_responsibility_area' from account_row
on conflict do nothing;

-- E) Admin/Super Admin kontrol
-- Beklenen route: /admin
insert into public.profiles (id, full_name, email, role, status)
values ('AUTH_USER_ID', 'FULL_NAME', 'TEST_EMAIL', 'super_admin', 'active')
on conflict (id) do update set
  full_name = excluded.full_name,
  email = excluded.email,
  role = excluded.role,
  status = excluded.status,
  updated_at = now();

insert into public.user_accounts (auth_user_id, full_name, email, account_type, role, status, profile_completion)
values ('AUTH_USER_ID', 'FULL_NAME', 'TEST_EMAIL', 'admin', 'super_admin', 'active', 100)
on conflict (auth_user_id) do update set
  full_name = excluded.full_name,
  email = excluded.email,
  account_type = excluded.account_type,
  role = excluded.role,
  status = excluded.status,
  profile_completion = excluded.profile_completion,
  updated_at = now();
