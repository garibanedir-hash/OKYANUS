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

Kök dizindeki `proxy.ts`, `/admin/:path*` matcher’ı ile çalışır. Demo mod açıkken admin route’larını engellemez. Demo kapalı ve Supabase env varsa session kontrolü yapmaya hazırlanmıştır.

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
