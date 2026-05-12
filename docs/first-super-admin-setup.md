# İlk Super Admin Kurulum Rehberi

Bu rehber 8C sonrası Supabase Auth ve rol tabanlı panel koruması test edilirken ilk yönetici hesabının nasıl hazırlanacağını açıklar.

## 1. Supabase Auth kullanıcısı oluşturma

1. Supabase Dashboard içinde Authentication > Users alanından ilk kullanıcıyı oluştur.
2. E-posta doğrulamasını production öncesi zorunlu hale getir.
3. Kullanıcı için geçici şifre belirlenirse ilk girişte şifre değişikliği akışı planlanmalıdır.

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

## 4. Demo moddan auth moda geçiş

1. Supabase env değerleri Vercel/Staging ortamına girilir.
2. `NEXT_PUBLIC_ADMIN_DEMO_MODE=false` yapılır.
3. Uygulama yeniden deploy edilir.
4. `/admin/giris` üzerinden Super Admin hesabıyla giriş yapılır.
5. `/admin`, `/panel`, `/koordinator`, `/personel` route guard davranışları ayrı ayrı test edilir.

## 5. Beklenen yönlendirmeler

- `super_admin` veya `admin`: `/admin`
- `coordinator` veya `koordinator`: `/koordinator`
- `staff`, `personnel` veya `personel`: `/personel`
- `donor`: `/panel/bagisci`
- `volunteer`: `/panel/gonullu`
- `donor + volunteer`: `/panel`

## 6. Güvenlik notu

Metadata tabanlı rol okuma yalnızca 8C hazırlık seviyesindedir. Production için nihai güvenlik; server-side guard, RLS policy, role_permissions doğrulaması ve audit log ile birlikte uygulanmalıdır.
