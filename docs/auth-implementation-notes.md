# Auth Implementation Notları

## Supabase Auth giriş akışı

Admin login formu e-posta/şifre alır ve Supabase `signInWithPassword` akışına hazırdır. Demo mod açıkken gerçek giriş yapılmaz.

## Admin login sayfası

Route:

- `/admin/giris`

Bu route proxy korumasından muaftır. Sayfada demo mod açıklaması, güvenlik notu ve siteye dönüş linki bulunur.

## Cookie tabanlı session mantığı

`@supabase/ssr` ile browser, server ve proxy tarafında cookie tabanlı session yönetimi hazırlanmıştır. Session refresh proxy helper üzerinden yapılabilir.

## Next.js 16 proxy yaklaşımı

Kök dizindeki `proxy.ts`, bakım modu ve admin session yenileme/koruma hazırlığını birlikte yönetir. Matcher public route'ları, admin route'larını ve panel route'larını kapsar; statik assetler, `_next` dosyaları ve temel public dosyalar dışarıda bırakılır.

Bakım modunda public route'lar `/tadilat` sayfasına yönlenir. `/admin`, `/admin/giris`, `/panel`, `/koordinator`, `/personel` ve `/api` route'ları geliştirme/demo erişimi için açık bırakılmıştır.

## Admin route guard

`lib/auth/adminGuard.ts` içinde:

- `isDemoMode`
- `isSupabaseConfigured`
- `getCurrentUser`
- `getCurrentAdminProfile`
- `requireAdmin`
- `hasAdminRole`
- `getAdminGuardState`

fonksiyonları hazırdır.

## Panel route guard stratejisi

Bu aşamada gerçek auth zorunluluğu açılmamıştır; demo mode korunur. 8B ve sonrasında önerilen guard kapsamı:

- `/admin`: Supabase session + admin role kontrolü.
- `/panel`: bağışçı/gönüllü session ve account type kontrolü.
- `/koordinator`: koordinatör rolü ve `coordinator_assignments` kapsam kontrolü.
- `/personel`: personel rolü ve sadece kendi `staff_assignments`/task/message kayıtları.
- `/giris`, `/kayit`, `/admin/giris`: koruma dışında kalır.
- `/tadilat`: bakım sayfası her zaman redirect loop dışındadır.

Panel route guard'ları UI seviyesine bırakılmamalı; proxy/server layout/server action katmanında da doğrulanmalıdır.

## Demo mode → gerçek mode geçişi

1. Supabase env değişkenleri eklenir.
2. `NEXT_PUBLIC_ADMIN_DEMO_MODE=false` yapılır.
3. `/admin/giris` üzerinden giriş test edilir.
4. Proxy session kontrolü doğrulanır.
5. Profiles/admin_roles sorgusu gerçek tabloya bağlanır.

## Profile ve admin_roles ilişkisi

Auth user id, `profiles.id` ile eşleşmelidir. Rol bilgisi `profiles.role` üzerinden okunabilir. Daha gelişmiş ihtiyaçlarda `admin_roles` ve permission tabloları eklenebilir.

## Şifre sıfırlama akışı

Supabase password reset e-postası kullanılabilir. Reset URL’i admin login domain’iyle uyumlu ayarlanmalıdır.

## E-posta doğrulama önerisi

Admin kullanıcıları için e-posta doğrulama zorunlu olmalıdır. Davet akışı Super Admin onayıyla yönetilmelidir.

## Rate limiting / brute force notu

Login endpoint’i rate limiting ve bot korumasıyla desteklenmelidir. Çok sayıda başarısız giriş audit/security log’a yazılmalıdır.

## Audit log ile auth olayları

Loglanması önerilen auth olayları:

- Başarılı giriş
- Başarısız giriş denemesi
- Çıkış
- Şifre sıfırlama isteği
- Rol değişikliği
- Kullanıcı askıya alma / aktif etme
