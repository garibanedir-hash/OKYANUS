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
- Env durumuna göre Upstash Redis veya in-memory fallback rate limit
- `consent_metadata.formSecurity` altında güvenlik metadata'sı

15C sonrası rate limit provider arayüzü `lib/security/rateLimitProvider.ts` içinde ayrılmıştır. 15E ile Upstash Redis provider eklendi; `RATE_LIMIT_PROVIDER=upstash` ve Upstash server env değerleri tanımlıysa kalıcı/global limit kullanılır. Env eksikliği veya provider runtime hatasında in-memory fallback devam eder; bu fallback kalıcı ve global güvence değildir.

Kalıcı provider değerlendirmesi:

- Vercel KV: Vercel serverless ortamıyla uyumlu, preview/production ayrımı net yönetilebilir.
- Upstash Redis: Serverless uyumlu ve global limit için olgun seçenek.
- Supabase table/RPC: Ek servis gerektirmez, ancak spam yükünü ana DB'ye taşıyabilir.
- In-memory fallback: Sadece başlangıç bariyeridir.

15D provider kararı ve 15E uygulaması: Önerilen sağlayıcı Upstash Redis'tir ve provider kodu eklendi. Gerekçe: Vercel serverless ile uyumlu REST API, atomic counter/TTL modeli, preview-production env ayrımının kolay kurulması, Supabase ana DB üzerinde spam write yükü oluşturmaması ve ham IP yerine mevcut fingerprint hash ile limit uygulanabilmesi.

Uygulanan limit başlangıcı:

- İletişim formu: fingerprint başına 10 dakikada 8 deneme.
- Gönüllü, bağış, kurban ve yetim hamiliği formları: fingerprint başına 10 dakikada 5 deneme.
- Kayıt formu: fingerprint başına 10 dakikada 4 deneme.
- Günlük gözlem limiti: sonraki izleme aşamasında soft block veya inceleme flag'i olarak değerlendirilecek.

Upstash env/config notları:

- `RATE_LIMIT_PROVIDER=memory` varsayılan güvenli fallback'tir.
- `RATE_LIMIT_PROVIDER=upstash` production önerisidir.
- `UPSTASH_REDIS_REST_URL` ve `UPSTASH_REDIS_REST_TOKEN` yalnızca server env'de tutulmalıdır.
- Key formatı `form:{form}:{fingerprintHash}` olup ham IP saklanmaz.
- Provider metadata'sı client'a teknik detay olarak dönmez; consent/security metadata tarafında denetim izi için özetlenir.

Turnstile pilotu feature flag ile hazırdır:

- `TURNSTILE_ENABLED=false` varsayılanında formlar mevcut davranışı korur.
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` client widget için public değerdir.
- `TURNSTILE_SECRET_KEY` sadece server env'de kalmalıdır.
- Enabled durumda token doğrulaması fail-closed çalışır ve teknik detay public ekrana basılmaz.

15D Turnstile pilot notu:

- Cloudflare resmi test key'leriyle `TURNSTILE_ENABLED=true` lokal/staging pilotu yapıldı.
- `/iletisim`, `/gonullu-ol` ve `/kayit` widget script'i ve token alanını render etti.
- Token yok ve always-fails secret senaryoları genel hata ile reddedildi.
- Always-passes secret senaryosu submit akışına devam etti; oluşan test kaydı cleanup ile silindi.
- Gerçek Vercel Preview/Staging Turnstile key'leri bu repoda bulunmadığı için gerçek tenant pilotu env tanımlanınca tekrar yapılmalıdır.

15E Preview/Staging notu:

- Bu workspace'te gerçek Cloudflare staging key'leri, Upstash staging env değerleri ve Vercel Preview URL bulunmadığı için gerçek Preview browser QA burada tamamlanmış kabul edilmemelidir.
- Preview/Staging env tanımlandığında `/iletisim`, `/gonullu-ol` ve `/kayit` için token yok, geçersiz token, başarılı token, honeypot ve KVKK/consent senaryoları yeniden koşulmalıdır.
- Production'da Turnstile zorunlu açılmadan önce Preview sonucu dokümante edilmelidir.

15F Preview/Staging kapanış notu:

- Preview env için `TURNSTILE_ENABLED=true`, staging Turnstile key'leri, `RATE_LIMIT_PROVIDER=upstash`, staging Upstash REST URL/token, `DONATION_MODE=whatsapp`, `SITE_MAINTENANCE_MODE=false` ve Preview `NEXT_PUBLIC_SITE_URL` birlikte tanımlanmalıdır.
- `npm run check:supabase-env`, `VERCEL_ENV=preview|production` veya `REQUIRE_STRICT_PREVIEW_SECURITY_ENV=true` altında Upstash/Turnstile eksiklerini hata olarak raporlar.
- Gerçek Preview QA ve staging negative harness çıktısı dokümante edilmeden production'da Turnstile zorunlu açılmamalıdır.

15G operasyonel QA notu:

- Bu local workspace'te Vercel CLI, agent-browser CLI, gerçek Cloudflare staging key'leri, Upstash staging env değerleri ve Preview URL bulunmadığı için gerçek Preview browser QA burada tamamlanmış kabul edilmez.
- Yetkili kullanıcı Preview env değerlerini Vercel Dashboard veya CLI ile girdikten sonra yeni Preview deploy almalı ve Preview URL'yi rapora eklemelidir.
- Gerçek browser QA'da `/iletisim`, `/gonullu-ol` ve `/kayit` için Turnstile widget render, token yok, geçersiz token, başarılı token, honeypot ve KVKK/consent senaryoları doğrulanmalıdır.
- Upstash QA'da aynı form/context/fingerprint için limit aşımı DB write öncesi durmalı ve public response teknik provider detayı içermemelidir.
- Staging negative harness yalnızca `REQUIRE_STAGING_NEGATIVE_TESTS=true`, staging project ref allowlist ve staging/preview `NEXT_PUBLIC_SITE_URL` ile çalıştırılmalıdır; production DB üzerinde negatif write/delete test yapılmamalıdır.
- 15G kanıtları olmadan production'da Turnstile zorunlu açılmamalı ve Upstash provider production güvence kabul edilmeden önce gerçek staging sonucu kaydedilmelidir.

Production trafiğinde aşağıdaki ek kontroller önerilir:

- IP veya kullanıcı bazlı rate limit.
- Kritik formlar için captcha veya turnstile benzeri bot koruması.
- Aşırı tekrar eden submitler için audit/alert.
- Public kayıt ve login brute-force davranışı için Supabase Auth rate limitlerinin izlenmesi.
- Cloudflare Turnstile aktif edilirse CSP için `https://challenges.cloudflare.com` staging'de test edilmelidir.

Detaylı plan ve staging negatif test listesi için `docs/form-spam-protection.md` kullanılmalıdır.

## Anon Write Negatif Test Harness

`npm run test:supabase` read-only kalır. Staging üzerinde doğrudan anon insert/upload negatif testleri için ayrı komut hazırdır:

```bash
npm run test:security:negative
```

Varsayılan çalıştırma write/delete yapmadan skip verir. Gerçek negatif test için:

```bash
REQUIRE_STAGING_NEGATIVE_TESTS=true NEGATIVE_TEST_ALLOWLIST_PROJECT_REF=staging_project_ref npm run test:security:negative
```

Bu script boş veya production domain gibi görünen `NEXT_PUBLIC_SITE_URL` değerinde, staging/preview/test/localhost olmayan site URL'lerinde ya da allowlist dışında kalan Supabase project ref üzerinde çalışmayı reddeder. Başarılı anon insert/upload sonucu production deploy öncesi durdurucu security warning kabul edilmelidir.

15E/15F/15G kapsamında gerçek staging project ref ve staging/preview URL bu workspace'te bulunmadığı için negatif harness production'a dokunmadan guard/default davranışıyla doğrulanır; gerçek staging allowlist testi env değerleri sağlandıktan sonra ayrıca çalıştırılmalıdır.

## Env ve Production Config Checklist

- `SITE_MAINTENANCE_MODE=false`, yayın stratejisi gerektiriyorsa geçici olarak true.
- `NEXT_PUBLIC_ADMIN_DEMO_MODE=false`.
- `DONATION_MODE=whatsapp`.
- `DONATION_WHATSAPP_PHONE` doğrulanmış public iletişim hattı.
- `NEXT_PUBLIC_SITE_URL` production domain.
- Supabase publishable/anon key public, service role key yalnızca server env.
- `RATE_LIMIT_PROVIDER=upstash` production önerisi; `UPSTASH_REDIS_REST_URL` ve `UPSTASH_REDIS_REST_TOKEN` yalnızca server env.
- `TURNSTILE_ENABLED=true` production'a alınacaksa önce Vercel Preview/Staging QA tamamlanır.
- Preview/production ortamlarında `RATE_LIMIT_PROVIDER=upstash` seçili ama Upstash env eksikse deploy öncesi check hata vermelidir.
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

## 16A Monitoring, Safe Logging ve Operasyon

Production güvenliği canlı yayından sonra izlenebilirlik ve müdahale planıyla birlikte ele alınmalıdır. Operasyonel ana referans `docs/production-operations-runbook.md` dosyasıdır.

Safe logging prensipleri:

- Service role, Supabase secret, PayTR merchant key/salt, Upstash token, Turnstile secret, auth token ve session/cookie değerleri loglanmaz.
- Tam e-posta, telefon, açık adres, kimlik, IBAN, kart/CVV, form mesajı ve çocuk/yetim hassas verisi runtime loglara yazılmaz.
- Payment callback raw provider payload public loglara yazılmaz; callback route sadece sınırlı `payloadSummary` ve provider event kayıtlarıyla izlenir.
- Kullanıcıya teknik stack trace dönmez; global error page genel hata mesajı gösterir.
- Yeni console log noktalarında `lib/observability/safeLogger.ts` tercih edilir.

Production operasyon go/no-go:

- `npm run test:supabase` çıktısında `Security warning: 0` ve `Missing table: 0` olmadan release yapılmaz.
- Private makbuz bucketları public görünürse release durur ve incident kabul edilir.
- `DONATION_MODE=whatsapp` tanıtım production yayını için korunur.
- PayTR online ödeme, gerçek merchant test ve yönetim/mali onay tamamlanmadan açılmaz.
- Vercel Preview Turnstile/Upstash QA tamamlanmadan production'da `TURNSTILE_ENABLED=true` zorunlu yapılmaz.

Production smoke:

```bash
npm run smoke:production
```

Bu komut `PRODUCTION_SMOKE_BASE_URL` veya `NEXT_PUBLIC_SITE_URL` ile public HTTP route status/body kontrolü yapar; secret kullanmaz, write/delete yapmaz ve Supabase DB/Storage'a dokunmaz. Base URL yoksa güvenli şekilde skip verir.
