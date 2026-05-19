# 8E Rol Bazlı Test Kullanıcı Kurulumu

Bu rehber Okyanus İnsani Yardım Derneği staging ortamında rol, panel yönlendirme ve route guard davranışını doğrulamak için hazırlanmıştır. Production kişisel verisi, gerçek bağış kaydı veya gerçek şifre kullanılmamalıdır.

## Güvenlik Notları

- Test kullanıcıları gerçek kullanıcı değildir.
- Test e-posta ve şifreleri yalnızca `.env.local` veya güvenli staging environment içinde tutulur.
- Test e-posta, şifre, gerçek Auth UID veya service role key GitHub'a yazılmaz.
- Metadata tek başına güvenlik kaynağı değildir; asıl kontrol server guard ve Supabase RLS üzerinden yapılır.
- Bu aşamada insert/update/delete yalnızca staging test kullanıcı hazırlığı içindir; uygulama akışı gerçek CRUD yapmaz.
- Test kullanıcıları production öncesi silinmeli veya devre dışı bırakılmalıdır.

## Test Rolleri ve Beklenen Route

| Rol | `profiles.role` | `user_accounts.account_type` | Beklenen route |
| --- | --- | --- | --- |
| Super Admin | `super_admin` | `admin` | `/admin` |
| Admin | `admin` | `admin` | `/admin` |
| Bağışçı | `donor` | `donor` | `/panel/bagisci` |
| Gönüllü | `volunteer` | `volunteer` | `/panel/gonullu` |
| Bağışçı + Gönüllü | `donor` + `volunteer` kaynakları | `donor` + `volunteer` kaynakları | `/panel` |
| Koordinatör | `coordinator` | `coordinator` | `/koordinator` |
| Personel | `staff` | `staff` | `/personel` |

Yetkisiz, pasif veya eksik role sahip kullanıcı güvenli şekilde `/giris?durum=yetkisiz` benzeri giriş ekranına yönlendirilmelidir.

## 1. Supabase Auth Kullanıcısı Oluşturma

1. Supabase Dashboard'a staging proje ile giriş yapın.
2. `Authentication` -> `Users` ekranına gidin.
3. `Add user` seçeneğini açın.
4. Test kullanıcısı için staging e-posta ve şifre girin.
5. `Auto Confirm User` açık olmalıdır.
6. Kullanıcıyı oluşturun.

Gerçek kişi e-postası ve production şifresi kullanmayın. Test hesaplarını isimlendirirken rolü anlaşılır tutun, ancak bu dokümana gerçek değer yazmayın.

## 2. Auth UID Alma

1. Oluşturulan kullanıcıyı `Authentication` -> `Users` listesinde açın.
2. Kullanıcının `User UID` / `ID` değerini kopyalayın.
3. SQL örneklerinde bu değeri `AUTH_USER_ID` placeholder'ının yerine yalnızca staging SQL Editor içinde kullanın.

Bu UID dokümana, Git commit'e veya issue açıklamasına yazılmamalıdır.

## 3. `.env.local` Test Değerleri

Rol bazlı auth smoke test şu env değerlerini destekler:

```bash
TEST_SUPER_ADMIN_EMAIL=
TEST_SUPER_ADMIN_PASSWORD=

TEST_DONOR_EMAIL=
TEST_DONOR_PASSWORD=

TEST_VOLUNTEER_EMAIL=
TEST_VOLUNTEER_PASSWORD=

TEST_COORDINATOR_EMAIL=
TEST_COORDINATOR_PASSWORD=

TEST_STAFF_EMAIL=
TEST_STAFF_PASSWORD=
```

Bu değerler `.env.local` içinde kalır. `.env.example` yalnızca boş placeholder içerir.

## 4. `profiles` Kaydı

Her test kullanıcısı için `profiles.id`, Supabase Auth UID ile aynı olmalıdır.

```sql
insert into public.profiles (id, full_name, email, role, status)
values ('AUTH_USER_ID', 'FULL_NAME', 'TEST_EMAIL', 'ROLE', 'active')
on conflict (id) do update set
  full_name = excluded.full_name,
  email = excluded.email,
  role = excluded.role,
  status = excluded.status,
  updated_at = now();
```

Not: Staging şeması `profiles.role` alanında enum kullanıyorsa, `ROLE` değerinin staging enum içinde desteklendiğini doğrulayın. Rol genişletmesi henüz yapılmadıysa portal rol doğrulamasında `user_accounts.role` ve `user_accounts.account_type` kaynakları kullanılmalıdır.

## 5. `user_accounts` Kaydı

`auth_user_id`, Supabase Auth UID ile eşleşmelidir. `role` ve `account_type` aynı rol ailesine işaret etmelidir.

```sql
insert into public.user_accounts (auth_user_id, full_name, email, account_type, role, status, profile_completion)
values ('AUTH_USER_ID', 'FULL_NAME', 'TEST_EMAIL', 'ACCOUNT_TYPE', 'ROLE', 'active', 100)
on conflict (auth_user_id) do update set
  full_name = excluded.full_name,
  email = excluded.email,
  account_type = excluded.account_type,
  role = excluded.role,
  status = excluded.status,
  profile_completion = excluded.profile_completion,
  updated_at = now();
```

## 6. `donor_profiles` Kaydı

Bağışçı test kullanıcısı için `user_accounts.id` üzerinden ilişki kurulur.

```sql
with account_row as (
  select id from public.user_accounts where auth_user_id = 'AUTH_USER_ID'
)
insert into public.donor_profiles (user_account_id, preferred_donation_types, communication_permission)
select id, array['general_support'], false from account_row
on conflict do nothing;
```

## 7. `volunteer_profiles` Kaydı

Gönüllü test kullanıcısı için `user_accounts.id` üzerinden ilişki kurulur.

```sql
with account_row as (
  select id from public.user_accounts where auth_user_id = 'AUTH_USER_ID'
)
insert into public.volunteer_profiles (user_account_id, interest_areas, application_status, city)
select id, array['field_support'], 'approved', null from account_row
on conflict do nothing;
```

## 8. `coordinator_assignments` Kaydı

Koordinatör test kullanıcısı için demo kapsam kaydı eklenir. Gerçek faaliyet veya ekip verisi bağlanmaz.

```sql
with account_row as (
  select id from public.user_accounts where auth_user_id = 'AUTH_USER_ID'
)
insert into public.coordinator_assignments (coordinator_id, entity_type, entity_id)
select id, 'demo_scope', null from account_row
on conflict do nothing;
```

## 9. `staff_assignments` Kaydı

Personel test kullanıcısı için demo sorumluluk alanı eklenir. Gerçek görev veya kişisel veri bağlanmaz.

```sql
with account_row as (
  select id from public.user_accounts where auth_user_id = 'AUTH_USER_ID'
)
insert into public.staff_assignments (staff_id, coordinator_id, responsibility_area)
select id, null, 'demo_responsibility_area' from account_row
on conflict do nothing;
```

## 10. Hazır SQL Yardımcı Dosyası

Rol bazlı örnekler için:

- `docs/sql/008e_test_user_setup_examples.sql`

Bu dosya migration değildir; yalnızca staging SQL Editor'da placeholder'lar değiştirilerek test kullanıcı hazırlığına rehberlik eder.

## 11. Doğrulama

1. `.env.local` içine yalnızca staging test hesaplarının env değerlerini ekleyin.
2. `NEXT_PUBLIC_ADMIN_DEMO_MODE=false` ile gerçek guard davranışını açın.
3. `npm run test:supabase-auth` çalıştırın.
4. Her rol için login, `profiles`, `user_accounts`, rol ve beklenen redirect sonucunu kontrol edin.

Env değeri olmayan roller testte `atlandı` görünür ve bu tek başına hata değildir.
