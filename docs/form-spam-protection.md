# Public Form Spam Protection

Bu doküman public formlar için 15B ve 15C aşamalarında eklenen spam koruma yaklaşımını açıklar. Amaç public write yüzeyini genişletmeden, kullanıcı deneyimini bozmadan ve Turnstile/Captcha entegrasyonunu kontrollü feature flag ile yöneterek başlangıç güvenliğini artırmaktır.

## Kapsam

Korunan public form akışları:

- İletişim formu
- Gönüllü başvuru formu
- Kayıt formu
- Online modda genel bağış formu
- Online modda kurban bağış başvurusu
- Online modda yetim hamiliği başvurusu

`DONATION_MODE=whatsapp` modunda bağış, kurban ve yetim hamiliği sayfaları form yerine WhatsApp bilgilendirme kartı gösterir; server action tarafında da online mode guard DB write öncesi korunur.

## Ortak Helper

`lib/security/formProtection.ts` server-only çalışır ve şu kontrolleri sağlar:

- `validateHoneypot(formData)`
- `validateSubmissionTiming(formData)`
- `getClientFingerprint(headers)`
- `checkBasicRateLimit(input)`
- `buildFormSecurityMetadata(input)`
- `validateTextLength`, `validateEmailFormat`, `validatePhoneFormat`

`lib/security/rateLimitProvider.ts` kalıcı rate limit sağlayıcıları için ortak arayüzü tanımlar. İlk sürümde in-memory provider fallback olarak kalır; Vercel KV, Upstash Redis veya Supabase RPC-backed provider aynı arayüze eklenebilir.

`lib/security/turnstile.ts` server-only Turnstile doğrulamasını yapar. `TURNSTILE_SECRET_KEY` bu dosya dışında kullanılmamalı, client componentlere taşınmamalıdır.

`components/forms/FormProtectionFields.tsx` her public forma ortak hidden alanları ekler:

- `website`
- `companyWebsite`
- `formStartedAt`
- `TURNSTILE_ENABLED=true` ve site key tanımlıysa `cf-turnstile-response`

Honeypot alanları normal kullanıcıya görünmez ve tab sırasına girmez.

## Honeypot Yaklaşımı

Botlar hidden alanları doldurursa server action kayıt oluşturmadan sessizce başarılıya yakın bir kullanıcı akışına döner. Teknik hata veya “bot yakalandı” mesajı gösterilmez.

Bu yaklaşım iletişim ve gönüllü formlarında gerçek kayıt oluşmasını engeller; kayıt formunda ise hesap oluşturulmadan başarıya yakın yönlendirme yapılır.

## Form Timing Yaklaşımı

`formStartedAt` client tarafında form render anında üretilir. Server tarafında çok hızlı submitler risk metadata’sı olarak işaretlenir.

İlk sürümde timing kontrolü katı bloklayıcı değildir. Bunun nedeni yavaş/hızlı cihazlar, otomatik doldurma araçları ve erişilebilirlik yardımcılarının yanlış pozitif üretebilmesidir.

## Input Validation Sınırları

Server action katmanında DB write veya RPC öncesi şu temel kontroller yapılır:

- Ad soyad: 3-120 karakter
- E-posta: format ve en fazla 160 karakter
- Telefon: makul karakter seti ve en fazla 30 karakter
- Şehir: en fazla 80 karakter
- Konu: 3-160 karakter
- Mesaj/not/açıklama: form bağlamına göre 500-1500 karakter
- Şifre: kayıt formunda 8-128 karakter ve tekrar eşleşmesi
- Sayısal alanlar: tutar, yaş, hisse/adet ve destek periyodu server tarafında doğrulanır

Client-side `maxLength` sadece kullanım kolaylığıdır; nihai kontrol server action içinde kalır.

## Consent Kayıtlarıyla İlişki

Spam koruma metadata’sı mevcut `consent_metadata` alanına `formSecurity` nesnesi olarak eklenir. Yeni migration gerekmez.

Metadata ham IP içermez. Fingerprint hash, user-agent var/yok bilgisi, timing flagleri ve best-effort rate limit sayacı tutulur.

## Rate Limit Stratejisi

İlk sürümde dependency eklemeden in-memory best-effort rate limit uygulanır:

- Varsayılan: form + fingerprint başına 10 dakikada 8 deneme
- Kayıt formu: 10 dakikada 4 deneme

Serverless/Vercel ortamında memory-based limit kalıcı ve küresel değildir. 15C ile provider arayüzü hazırlandı, ancak kalıcı provider bilinçli olarak bağlanmadı.

Değerlendirilen seçenekler:

- Vercel KV: Vercel ortamıyla doğal uyumlu, preview/production ayrımı yönetilebilir. Production için güçlü adaydır.
- Upstash Redis: Serverless uyumlu, global rate limit için olgun ve düşük operasyon yükü sunar. Vercel KV yoksa önerilen seçenektir.
- Supabase table/RPC: Ek provider gerektirmez, ancak yüksek hacimli spam trafiğini ana DB'ye taşıyabilir. Audit ihtiyacı yüksekse dikkatli tasarlanmalıdır.
- In-memory fallback: Dependency gerektirmez, fakat yalnızca temel bariyer sağlar ve çok instance ortamında global güvence vermez.

Production önerisi: Tanıtım yayını sonrası gerçek spam hacmine göre Vercel KV veya Upstash Redis tercih edilmeli; ham IP yerine hashlenmiş IP/fingerprint kullanılmalı ve saklama süresi kısa tutulmalıdır. Supabase tabanlı çözüm seçilirse RLS, retention ve write amplification etkisi ayrıca gözden geçirilmelidir.

## Turnstile / Captcha Değerlendirmesi

İlk tanıtım döneminde honeypot + server-side validation + best-effort rate limit yeterli başlangıç seviyesi olabilir.

15C ile Cloudflare Turnstile pilot entegrasyonu feature flag ile hazırlandı:

- `TURNSTILE_ENABLED=false`: formlar mevcut şekilde çalışır.
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`: client widget için public site key.
- `TURNSTILE_SECRET_KEY`: sadece server-side verification için secret.

`TURNSTILE_ENABLED=true` olduğunda server action token doğrulamasını input validation ve consent validation öncesi yapar. Token yoksa, secret eksikse veya provider verification başarısızsa fail-closed davranılır ve kullanıcıya teknik detay içermeyen genel hata döner.

Alternatifler:

- Cloudflare Turnstile
- hCaptcha
- reCAPTCHA

Turnstile veya captcha aktif edilecekse:

- Client token form submit ile gönderilmeli.
- Server action token’ı provider endpointinde doğrulamalı.
- Verification secret client bundle’a veya `NEXT_PUBLIC_` env içine taşınmamalı.
- Başarısız doğrulama teknik bilgi sızdırmadan genel hata dönmeli.
- CSP eklenirse `https://challenges.cloudflare.com` script/frame kaynağı staging üzerinde test edilmelidir.

## Anon Write Negatif Test Planı

Read-only smoke test canlı veriyi kirletmeden RLS görünürlüğünü doğrular. Gerçek insert/update negatif testleri ayrı script ile yalnızca staging ortamında çalıştırılmalıdır.

Komut:

```bash
npm run test:security:negative
```

Varsayılan davranış güvenli skip'tir. Gerçek negatif write denemesi için:

```bash
REQUIRE_STAGING_NEGATIVE_TESTS=true NEGATIVE_TEST_ALLOWLIST_PROJECT_REF=staging_project_ref npm run test:security:negative
```

Guard koşulları:

- `REQUIRE_STAGING_NEGATIVE_TESTS=true` olmadan write/delete denenmez.
- Supabase project ref `NEGATIVE_TEST_ALLOWLIST_PROJECT_REF` içinde değilse script durur.
- `NEXT_PUBLIC_SITE_URL` production domain gibi görünüyorsa script durur.
- Başarılı insert/upload büyük security warning sayılır ve mümkünse cleanup denenir.
- Constraint/not-null hataları `INCONCLUSIVE` raporlanır; bu tek başına RLS'in kapalı olduğunu kanıtlamaz.

Anon ile doğrudan yazılamaması gerekenler:

- `payment_intents`
- `payment_events`
- `payment_provider_events`
- `receipts`
- `manual_receipts`
- `manual_receipt_events`
- `notification_queue`
- `project_activity_events`
- `profiles`, `user_accounts`, rol/permission tabloları
- private storage bucket read/write
- `site_cookie_consents` public insert/update

Kontrollü submit gerekenler:

- `contact_messages`: yalnızca server action + service role repository üzerinden
- `volunteer_applications`: yalnızca server action + service role repository üzerinden
- Bağış/kurban/yetim akışları: yalnızca ilgili server action/RPC ve donation mode guard üzerinden

Staging negatif testlerinde her test kaydı açıkça işaretlenmeli ve test sonunda temizlenmelidir.

## Manuel Test Listesi

- Honeypot boşken normal form validasyonları çalışıyor.
- Honeypot doluyken DB kaydı oluşmuyor.
- KVKK/açık rıza zorunlulukları server tarafında korunuyor.
- Çok uzun metinler DB’ye gitmeden reddediliyor.
- Geçersiz e-posta ve telefon reddediliyor.
- `DONATION_MODE=whatsapp` modunda ödeme/başvuru kaydı oluşmuyor.

## Production İzleme Notları

- Kısa sürede artan form hatası veya tekrar submit logları izlenmelidir.
- İletişim/gönüllü başvurularında olağan dışı yoğunluk görülürse Turnstile entegrasyonu 15C/16A kapsamında ele alınmalıdır.
- Rate limit provider eklenirse secret değerleri server env’de tutulmalı ve public bundle taraması tekrar yapılmalıdır.
