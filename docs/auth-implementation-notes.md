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

## Route guard kapsamı

8C ile proxy guard kapsamı şu route gruplarını içerir:

- `/admin` ve `/admin/*`
- `/panel` ve `/panel/*`
- `/koordinator` ve `/koordinator/*`
- `/personel` ve `/personel/*`

Koruma dışında kalan route'lar:

- Public site sayfaları
- `/giris`
- `/kayit`
- `/admin/giris`
- `/tadilat`
- `/api`
- `/_next` ve statik assetler

`NEXT_PUBLIC_ADMIN_DEMO_MODE=true` iken local/dev ortamda tüm paneller demo önizleme için açık kalır. Production runtime'da `NEXT_PUBLIC_ADMIN_DEMO_MODE=true` verilmiş olsa bile demo bypass etkisiz kalır; korumalı route'lar Supabase session ve database rol kontrolü ister.

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

## 8C role-based yönlendirme

`lib/auth/roleRedirect.ts` rol ve hesap türlerini normalize eder:

- `super_admin`, `admin`, içerik/bağış/gönüllü/raporlama yönetim rolleri → `/admin`
- `coordinator`, `koordinator` → `/koordinator`
- `staff`, `personnel`, `personel` → `/personel`
- `donor`, `bağışçı` → `/panel/bagisci`
- `volunteer`, `gönüllü` → `/panel/gonullu`
- `donor + volunteer`, `Bağışçı + Gönüllü` → `/panel`

Bilinmeyen rol güvenli fallback olarak `/giris` yoluna yönlendirilir.

## Demo mode → gerçek mode geçişi

1. Supabase env değişkenleri eklenir.
2. `NEXT_PUBLIC_ADMIN_DEMO_MODE=false` yapılır.
3. İlk Super Admin hesabı oluşturulur ve metadata/rol bağlantısı yapılır.
4. `/admin/giris` üzerinden giriş test edilir.
5. Proxy session ve route guard kontrolü doğrulanır.
6. Profiles/admin_roles/user_accounts/role_permissions sorgusu gerçek tabloya bağlanır.

## Güvenlik sınırı

Route guard erişim katmanıdır; asıl veri güvenliği RLS ile sağlanmalıdır. Bağışçı yalnızca kendi bağışlarını, sponsor yalnızca kendi sponsorluklarını, gönüllü yalnızca kendi başvuru/görevlerini, personel yalnızca kendi görev/mesajlarını ve koordinatör yalnızca kendi ekip/faaliyet kapsamını görebilmelidir. Yetim/çocuk verileri maskeli ve sınırlı kalmalıdır.

## 8D Read-only profil/rol doğrulama

8D ile `lib/auth/routeGuard.ts` şu kaynaklardan rol okumaya hazırlanmıştır:

- `user_accounts.role` ve `user_accounts.account_type`
- `profiles.role`
- `role_permissions` üzerinden modül/aksiyon yetkileri
- Supabase Auth metadata (`role`, `roles`, `account_type`) yalnızca yardımcı sinyal olarak değerlendirilebilir; metadata tek başına güvenlik kaynağı değildir.

Demo mode açıkken local/dev sorguları erişimi engellemez. Demo mode kapatıldığında Supabase session yoksa veya read-only database rol sorguları yetkili rol döndürmezse erişim reddedilir. Production seviyesinde asıl güvenlik server guard + RLS doğrulamasıdır.

## 8E Rol Bazlı Test Kullanıcıları

8E aşamasında test kullanıcıları yalnızca staging rol/yönlendirme doğrulaması için hazırlanır. Bu kullanıcılar gerçek kullanıcı değildir; gerçek bağış, gerçek CRUD, dosya upload veya production kişisel verisiyle ilişkilendirilmez.

- Test şifreleri `.env.local` veya güvenli staging env içinde kalır, GitHub'a yazılmaz.
- Test kullanıcıları production öncesi silinir veya devre dışı bırakılır.
- Her rol kendi paneliyle sınırlıdır: bağışçı `/panel/bagisci`, gönüllü `/panel/gonullu`, ikili hesap `/panel`, koordinatör `/koordinator`, personel `/personel`, admin/super admin `/admin`.
- Yetkisiz veya eksik role sahip kullanıcı güvenli giriş ekranına yönlendirilir.
- Kurulum rehberi: `docs/role-test-users-setup.md`
- Manuel route checklist: `docs/role-route-test-checklist.md`

## Profile ve admin_roles ilişkisi

Auth user id, `profiles.id` ile eşleşmelidir. Rol bilgisi `profiles.role` üzerinden okunabilir. Daha gelişmiş ihtiyaçlarda `admin_roles` ve permission tabloları eklenebilir.

## Şifre sıfırlama akışı

Supabase password reset e-postası kullanılabilir. Reset URL’i admin login domain’iyle uyumlu ayarlanmalıdır.

## E-posta doğrulama önerisi

Admin kullanıcıları için e-posta doğrulama zorunlu olmalıdır. Davet akışı Super Admin onayıyla yönetilmelidir.

## 16F Admin Davet E-postası Production Ayarları

Admin kullanıcı/personel davetleri `inviteUserByEmail` ile server-side çalışır. Davet linki `redirectTo` parametresiyle canlı domain üzerinden kurulmalıdır:

- Production redirect: `https://www.okyanus.org.tr/giris`
- Local geliştirme redirect: `http://localhost:3000/giris`

Kod tarafında `lib/config/siteUrl.ts` helper'ı `NEXT_PUBLIC_SITE_URL`, `SITE_URL` ve güvenli fallback değerlerini değerlendirir. Production runtime'da env eksikse veya yanlışlıkla localhost/http verilirse davet redirect'i `https://www.okyanus.org.tr/giris` değerine düşer. Service role yalnızca server-side repository/action içinde kullanılmalıdır.

Supabase Dashboard checklist:

- Authentication -> URL Configuration -> Site URL: `https://www.okyanus.org.tr`
- Authentication -> URL Configuration -> Redirect URLs:
  - `https://www.okyanus.org.tr/**`
  - `http://localhost:3000/**`
- Authentication -> Email Templates -> Invite user subject:
  - `Okyanus Yönetim Paneli Daveti`
- Authentication -> SMTP Settings:
  - Custom SMTP aktif edilmeli.
  - Sender name: `Okyanus İnsani Yardım Derneği`
  - From email: `info@okyanus.org.tr` veya `no-reply@okyanus.org.tr`

Supabase Invite user HTML template önerisi:

```html
<p>Merhaba,</p>

<p>Okyanus İnsani Yardım Derneği yönetim paneline kullanıcı olarak davet edildiniz.</p>

<p>Hesabınızı oluşturmak ve giriş işleminizi tamamlamak için aşağıdaki bağlantıya tıklayabilirsiniz:</p>

<p><a href="{{ .ConfirmationURL }}">Davetiyeyi kabul et</a></p>

<p>Bu davet size kurum yetkilisi tarafından gönderilmiştir. Daveti siz talep etmediyseniz bu e-postayı dikkate almayabilirsiniz.</p>

<p>Okyanus İnsani Yardım Derneği</p>
```

Template içinde `{{ .ConfirmationURL }}` korunmalıdır. İngilizce `You have been invited`, `Supabase Auth` gönderen adı ve `powered by Supabase` benzeri default footer production e-postasında kalmamalıdır. Custom SMTP kurulmadan gönderen adı hâlâ Supabase/Auth varsayılanı gibi görünebilir; ilk test kurum içi e-posta adresine gönderilerek doğrulanmalıdır.

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
