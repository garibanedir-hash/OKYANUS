# İlk Super Admin Kurulum Rehberi

Bu rehber 8C sonrası Supabase Auth ve rol tabanlı panel koruması test edilirken ilk yönetici hesabının nasıl hazırlanacağını açıklar.

## 1. Supabase Auth kullanıcısı oluşturma

1. Supabase Dashboard içinde Authentication > Users alanından ilk kullanıcıyı oluştur.
2. E-posta doğrulamasını production öncesi zorunlu hale getir.
3. Kullanıcı için geçici şifre belirlenirse ilk girişte şifre değişikliği akışı planlanmalıdır.
4. Kullanıcı detay ekranından `auth.users.id` değerini kopyala. Aşağıdaki SQL örneklerinde bu değer `AUTH_USER_ID` olarak geçer.

## 2. Rol bilgisini bağlama

8C aşamasında route guard metadata tabanlı rol okumaya hazırdır. Staging testinde Auth user metadata içine aşağıdaki değerlerden biri eklenebilir:

- `role: "super_admin"`
- `roles: ["super_admin"]`

8D aşamasında bu geçici yaklaşım, `profiles`, `user_accounts`, `admin_roles` ve `role_permissions` tablolarındaki server-side read-only doğrulamayla değiştirilecektir.

## 3. Veritabanı kayıtları

İlk Super Admin için önerilen kayıt ilişkisi:

- `profiles.id` veya `profiles.auth_user_id`: Supabase Auth user id ile eşleşir.
- `profiles.role`: `super_admin`
- `user_accounts.auth_user_id`: aynı Auth user id
- `role_permissions`: Super Admin için tüm yönetim modüllerinde yetkili.

Staging SQL örneği:

```sql
-- Placeholder değerleri değiştir:
-- AUTH_USER_ID: Supabase Auth kullanıcısının UUID değeri
-- ADMIN_EMAIL: İlk admin e-postası
-- FULL_NAME: Görünecek yönetici adı

insert into public.profiles (id, full_name, email, role, status)
values ('AUTH_USER_ID', 'FULL_NAME', 'ADMIN_EMAIL', 'super_admin', 'active')
on conflict (id) do update set
  full_name = excluded.full_name,
  email = excluded.email,
  role = excluded.role,
  status = excluded.status,
  updated_at = now();

insert into public.user_accounts (auth_user_id, full_name, email, account_type, role, status, profile_completion)
values ('AUTH_USER_ID', 'FULL_NAME', 'ADMIN_EMAIL', 'Admin', 'super_admin', 'active', 100)
on conflict (auth_user_id) do update set
  full_name = excluded.full_name,
  email = excluded.email,
  account_type = excluded.account_type,
  role = excluded.role,
  status = excluded.status,
  profile_completion = excluded.profile_completion,
  updated_at = now();

insert into public.admin_roles (role, label, description)
values ('super_admin', 'Super Admin', 'Tüm yönetim modüllerine erişebilen ilk yönetici rolü.')
on conflict (role) do update set
  label = excluded.label,
  description = excluded.description;
```

`role_permissions` tablo yapısı text tabanlı olduğu için Super Admin yetkileri şu şekilde seed edilebilir:

```sql
insert into public.role_permissions (role, permission_module, permission_action, allowed)
select 'super_admin', module_name, action_name, true
from unnest(array[
  'projects',
  'donations',
  'receipts',
  'volunteers',
  'events',
  'sponsorships',
  'tasks',
  'messages',
  'staff',
  'users',
  'reports',
  'export',
  'settings',
  'legal',
  'audit_logs'
]) as module_name
cross join unnest(array[
  'view',
  'create',
  'edit',
  'delete',
  'publish',
  'export',
  'assign',
  'approve'
]) as action_name
on conflict (role, permission_module, permission_action) do update set
  allowed = excluded.allowed;
```

## 4. Demo moddan auth moda geçiş

1. Supabase env değerleri Vercel/Staging ortamına girilir.
2. `001-007` migration zinciri staging ortamında test edilir.
3. `npm run test:supabase` sonucunda `Security warning: 0` doğrulanır.
4. İlk Super Admin için `profiles`, `user_accounts`, `admin_roles` ve `role_permissions` kayıtları oluşturulur.
5. `TEST_AUTH_EMAIL` ve `TEST_AUTH_PASSWORD` yalnızca `.env.local` veya güvenli staging env içine eklenir.
6. `npm run test:supabase-auth` ile giriş ve read-only profil/rol sorguları test edilir.
7. `NEXT_PUBLIC_ADMIN_DEMO_MODE=false` yapılır.
8. Uygulama yeniden deploy edilir.
9. `/admin/giris` üzerinden Super Admin hesabıyla giriş yapılır.
10. `/admin`, `/panel`, `/koordinator`, `/personel` route guard davranışları ayrı ayrı test edilir.

## 5. Beklenen yönlendirmeler

- `super_admin` veya `admin`: `/admin`
- `coordinator` veya `koordinator`: `/koordinator`
- `staff`, `personnel` veya `personel`: `/personel`
- `donor`: `/panel/bagisci`
- `volunteer`: `/panel/gonullu`
- `donor + volunteer`: `/panel`

## 6. Güvenlik notu

Metadata tabanlı rol okuma yalnızca 8C hazırlık seviyesindedir. Production için nihai güvenlik; server-side guard, RLS policy, role_permissions doğrulaması ve audit log ile birlikte uygulanmalıdır.
