# Production Security Hardening

Bu doküman canlı yayına çıkış öncesi teknik güvenlik kontrolünü özetler. Hukuki veya mali uygunluk iddiası değildir; ödeme, makbuz, KVKK ve çerez süreçleri ilgili uzmanlar tarafından ayrıca onaylanmalıdır.

## Service Role Güvenliği

- `SUPABASE_SECRET_KEY` ve `SUPABASE_SERVICE_ROLE_KEY` yalnızca server-only helper, Server Action ve API route katmanında kullanılmalıdır.
- Client component, public bundle veya `NEXT_PUBLIC_` env adı altında service role/secret değeri bulunmamalıdır.
- `lib/supabase/admin.ts`, ödeme, makbuz, medya upload ve public form write repository dosyaları `server-only` sınırında tutulmalıdır.
- Build sonrası public bundle kontrolü için `.next/static` içinde `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SECRET_KEY`, `PAYTR_MERCHANT_KEY`, `PAYTR_MERCHANT_SALT` ve `sb_secret` araması yapılmalıdır.

## RLS / Anon Erişim Matrisi

Public read olması makul alanlar:

- Yayınlanmış/public projeler, haberler, raporlar.
- Aktif public proje bölgeleri ve tamamlanmış public proje faaliyetleri.
- Aktif kurban kampanyaları ve yetim hamiliği program özetleri.
- Hukuki/public sayfa verileri.

Anon veya public erişime kapalı kalması gereken alanlar:

- `payment_intents`, `payment_events`, `payment_provider_events`.
- `receipts`, `manual_receipts`, `manual_receipt_events`.
- `notification_queue`, `payment_status_logs`, audit/export logları.
- `profiles`, `user_accounts`, rol ve permission tabloları.
- Kurban operasyon, dağıtım, bildirim, export ve status log tabloları.
- Yetim profilleri, sponsorluk ilişkileri, başvuru detayları ve çocukla ilgili hassas kayıtlar.
- `site_cookie_consents`; ilk sürümde çerez tercihi DB'ye public yazılmaz.

`npm run test:supabase` yalnızca publishable/anon key ile çalışmalı ve write/insert/update/delete yapmamalıdır.

## Storage Bucket Güvenliği

`project-media`:

- Public read olabilir.
- Public/anon upload kapalı kalmalıdır.
- Upload sadece admin Server Action ve server-only service role helper üzerinden yapılmalıdır.
- MIME: JPG, PNG, WebP; dosya limiti 5 MB.
- PDF, SVG, JS veya HTML kabul edilmemelidir.

`receipts-private` ve `manual-receipts-private`:

- `public=false` kalmalıdır.
- Anon read/write kapalı olmalıdır.
- İndirme yalnızca yetki kontrollü API route üzerinden yapılmalıdır.
- Public URL veya doğrudan file path ile makbuz indirme açılmamalıdır.

Smoke test anon key ile bucket görünürlüğünü kontrol eder; private bucket varlığı ve `public=false` durumu Supabase Dashboard üzerinden ayrıca doğrulanmalıdır.

## Admin Route ve Action Guard

- `/admin`, `/panel`, `/koordinator` ve `/personel` route'ları proxy/server guard ile korunur.
- UI'da buton gizlemek güvenlik kabul edilmez; write action'lar `requireAdminUser`, `requireAdmin` veya rol kontrolüyle server tarafında da doğrulama yapmalıdır.
- `NEXT_PUBLIC_ADMIN_DEMO_MODE=false` production için zorunlu kabul edilmelidir.
- Demo bypass veya test kullanıcıları production ortamında aktif bırakılmamalıdır.

## Donation Mode Güvenlik Notu

`DONATION_MODE=whatsapp` iken public bağış, kurban ve yetim hamiliği sayfaları ödeme formu yerine WhatsApp bilgilendirme kartı göstermelidir. Bu modda yeni `payment_intent`, kurban order veya sponsorluk ödeme başlatma akışı tetiklenmemelidir.

`DONATION_MODE=online` açılmadan önce PayTR gerçek testleri, callback idempotency, tutar/para birimi doğrulaması, makbuz ve bildirim süreçleri tekrar kontrol edilmelidir.

## PayTR Callback Güvenliği

- `/api/paytr/callback` public route olabilir, ancak status update yalnızca PayTR hash doğrulaması geçtikten sonra yapılmalıdır.
- Duplicate callback idempotent işlenmelidir.
- Tutar ve para birimi server tarafında beklenen payment intent ile karşılaştırılmalıdır.
- Provider event payload özetlenmeli; secret, kart veya hassas ödeme bilgisi loglanmamalıdır.
- Başarısız callbackler teknik secret sızdırmayan düz yanıtlar dönmelidir.

## Makbuz ve Private Dosya Güvenliği

- Dijital ve manuel makbuz PDF dosyaları private bucket içinde kalmalıdır.
- Donor yalnızca kendi issued/uygun makbuzunu indirebilmelidir.
- Cancelled makbuz donor download'a kapalı kalmalıdır.
- Manuel makbuz indirme admin/super_admin ile sınırlandırılmalıdır.
- File path kullanıcıya public URL gibi sunulmamalıdır.

## Form Spam ve Rate Limit Riski

15B sonrası public formlar ortak `FormProtectionFields` ve `lib/security/formProtection.ts` helper'ı ile temel korumadan geçer:

- Honeypot alanları: `website`, `companyWebsite`
- Timing alanı: `formStartedAt`
- Server-side input uzunluk ve format validation
- Ham IP saklamadan fingerprint hash
- In-memory best-effort rate limit
- `consent_metadata.formSecurity` altında güvenlik metadata'sı

Bu koruma dependency eklemeden başlangıç bariyeri sağlar. Buna rağmen serverless memory rate limit kalıcı olmadığı için production trafiğinde aşağıdaki ek kontroller önerilir:

- IP veya kullanıcı bazlı rate limit.
- Kritik formlar için captcha veya turnstile benzeri bot koruması.
- Aşırı tekrar eden submitler için audit/alert.
- Public kayıt ve login brute-force davranışı için Supabase Auth rate limitlerinin izlenmesi.

Detaylı plan ve staging negatif test listesi için `docs/form-spam-protection.md` kullanılmalıdır.

## Env ve Production Config Checklist

- `SITE_MAINTENANCE_MODE=false`, yayın stratejisi gerektiriyorsa geçici olarak true.
- `NEXT_PUBLIC_ADMIN_DEMO_MODE=false`.
- `DONATION_MODE=whatsapp`.
- `DONATION_WHATSAPP_PHONE` doğrulanmış public iletişim hattı.
- `NEXT_PUBLIC_SITE_URL` production domain.
- Supabase publishable/anon key public, service role key yalnızca server env.
- PayTR production credential değerleri canlı ödeme onayı olmadan aktif edilmez.
- `PAYTR_DEBUG_ON=false`.
- `.env.local`, `.vercel` ve test credential değerleri Git'e dahil edilmez.

## Security Headers

Bu aşamada düşük kırılma riskiyle şu header'lar uygulanır:

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: SAMEORIGIN`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

Tam `Content-Security-Policy` ayrı bir aşamada, Next/Image, Supabase Storage, WhatsApp ve Vercel kaynaklarıyla birlikte test edilerek eklenmelidir.

## Production Öncesi Son Kontrol

- `npm run lint`
- `npm run build`
- `npm run check:supabase-env`
- `npm run test:supabase`
- `npm run audit:security`
- Anon `/admin` erişimi login'e yönleniyor.
- Anon makbuz download endpointleri 401/redirect veriyor.
- `project-media` görseller public, private makbuz bucketları public değil.
- WhatsApp modunda bağış sayfaları payment intent başlatmıyor.
- Cookie banner ve hukuki linkler production domain üzerinde çalışıyor.
