# Public Form Spam Protection

Bu doküman public formlar için 15B, 15C, 15D ve 15E aşamalarında eklenen spam koruma yaklaşımını açıklar. Amaç public write yüzeyini genişletmeden, kullanıcı deneyimini bozmadan, Turnstile/Captcha entegrasyonunu kontrollü feature flag ile yöneterek ve kalıcı rate limit sağlayıcısını server-side tutarak başlangıç güvenliğini artırmaktır.

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

`lib/security/rateLimitProvider.ts` kalıcı rate limit sağlayıcıları için ortak arayüzü tanımlar. 15E ile Upstash Redis provider eklendi; in-memory provider env eksikliği veya provider runtime hatasında güvenli fallback olarak kalır.

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

Metadata ham IP içermez. Fingerprint hash, user-agent var/yok bilgisi, timing flagleri ve rate limit sayacı tutulur.

## Rate Limit Stratejisi

Varsayılan güvenli fallback olarak dependency eklemeden in-memory best-effort rate limit uygulanır:

- Varsayılan/iletişim formu: form + fingerprint başına 10 dakikada 8 deneme
- Gönüllü, bağış, kurban ve yetim hamiliği formları: 10 dakikada 5 deneme
- Kayıt formu: 10 dakikada 4 deneme

Serverless/Vercel ortamında memory-based limit kalıcı ve küresel değildir. 15E ile Upstash Redis provider eklendi; `RATE_LIMIT_PROVIDER=upstash` ve gerekli Upstash env değerleri tanımlıysa global/persistent limit kullanılır, env eksik veya provider erişilemez ise sistem build'i kırmadan memory fallback'e döner.

Değerlendirilen seçenekler:

- Vercel KV: Vercel ortamıyla doğal uyumlu, preview/production ayrımı yönetilebilir. Production için güçlü adaydır.
- Upstash Redis: Serverless uyumlu, global rate limit için olgun ve düşük operasyon yükü sunar. Vercel KV yoksa önerilen seçenektir.
- Supabase table/RPC: Ek provider gerektirmez, ancak yüksek hacimli spam trafiğini ana DB'ye taşıyabilir. Audit ihtiyacı yüksekse dikkatli tasarlanmalıdır.
- In-memory fallback: Dependency gerektirmez, fakat yalnızca temel bariyer sağlar ve çok instance ortamında global güvence vermez.

15D karar önerisi ve 15E uygulaması: Kalıcı/global rate limit için Upstash Redis tercih edilmiştir. Vercel serverless ortamıyla uyumlu çalışır, atomic counter + TTL modeli basittir, preview/production env ayrımı net yapılabilir ve ana Supabase DB'yi spam trafiğiyle yormaz. Vercel KV zaten provision edilmişse aynı Redis uyumlu modelle ayrıca değerlendirilebilir; ancak yeni kurulum için Upstash Redis daha taşınabilir ve açık sağlayıcı kararıdır.

15E implementasyon durumu:

- `RATE_LIMIT_PROVIDER=upstash` env flag'i desteklenir.
- `UPSTASH_REDIS_REST_URL` ve `UPSTASH_REDIS_REST_TOKEN` yalnızca server env'de tutulur.
- Upstash REST API doğrudan `fetch` ile kullanılır; ek npm dependency eklenmedi.
- Key formatı `form:{form}:{fingerprintHash}` şeklindedir.
- Pencere mantığı `INCR`, `EXPIRE NX` ve `TTL` komutlarıyla transaction içinde yürütülür.
- Günlük pencere ve soft block modeli sonraki gözlem aşamasına bırakılmıştır.
- Ham IP saklanmayacak; mevcut fingerprint hash yaklaşımı korunacak.
- Rate limit metadata'sında provider adı, persistent flag, count, remaining, resetAt ve windowSeconds tutulur.
- Upstash env eksik veya provider runtime hatası varsa memory fallback kullanılır. Bu production için geçici güvenlik ağıdır; kalıcı/global güvence olarak kabul edilmemelidir.

## Turnstile / Captcha Değerlendirmesi

İlk tanıtım döneminde honeypot + server-side validation + best-effort rate limit yeterli başlangıç seviyesi olabilir.

15C ile Cloudflare Turnstile pilot entegrasyonu feature flag ile hazırlandı:

- `TURNSTILE_ENABLED=false`: formlar mevcut şekilde çalışır.
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`: client widget için public site key.
- `TURNSTILE_SECRET_KEY`: sadece server-side verification için secret.

`TURNSTILE_ENABLED=true` olduğunda server action token doğrulamasını input validation ve consent validation öncesi yapar. Token yoksa, secret eksikse veya provider verification başarısızsa fail-closed davranılır ve kullanıcıya teknik detay içermeyen genel hata döner.

15D pilot sonucu:

- `TURNSTILE_ENABLED=false` varsayılanında public formlar widget render etmeden çalışır.
- Cloudflare resmi test key'leri ile `TURNSTILE_ENABLED=true` yerel staging pilotunda `/iletisim`, `/gonullu-ol` ve `/kayit` sayfalarında widget script'i ve `cf-turnstile-response` alanı render edildi.
- Token yok senaryosu genel hata ile reddedildi.
- Always-fails test secret ile dummy token genel hata ile reddedildi.
- Always-passes test secret ile dummy token form submit akışına devam etti; oluşan test iletişim kaydı temizlendi.
- Gerçek staging Cloudflare key'leri bu repoda/env içinde bulunmadığı için gerçek tenant/sitekey pilotu ayrıca Vercel Preview/Staging üzerinde yapılmalıdır.

15E Preview/Staging notu:

- Gerçek Cloudflare staging key'leri, Upstash staging env değerleri ve Vercel Preview URL bu workspace içinde bulunmadığı için gerçek Preview browser QA bu aşamada çalıştırılamadı.
- Preview QA için `TURNSTILE_ENABLED=true`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `RATE_LIMIT_PROVIDER=upstash`, `UPSTASH_REDIS_REST_URL` ve `UPSTASH_REDIS_REST_TOKEN` staging/preview ortamında tanımlanmalıdır.
- Preview'da token yok, geçersiz token, başarılı token, honeypot, KVKK/consent ve rate limit senaryoları gerçek tarayıcıda tekrar doğrulanmalıdır.

15F Preview/Staging kapanış kriterleri:

- Vercel Preview env içinde `TURNSTILE_ENABLED=true`, gerçek Cloudflare staging site key/secret key, `RATE_LIMIT_PROVIDER=upstash` ve staging Upstash REST URL/token tanımlanmalıdır.
- `npm run check:supabase-env`, `VERCEL_ENV=preview` veya `REQUIRE_STRICT_PREVIEW_SECURITY_ENV=true` altında Turnstile/Upstash env eksiklerini hata olarak işaretler.
- Preview browser QA'da `/iletisim`, `/gonullu-ol` ve `/kayit` için widget render, token yok, geçersiz token ve başarılı token senaryoları doğrulanmalıdır.
- Upstash QA'da aynı form/context/fingerprint ile limit aşımı DB write öncesi durmalı ve kullanıcıya genel rate limit mesajı dönmelidir.
- Bu yerel workspace'te Vercel CLI, Cloudflare staging key'leri, Upstash staging env değerleri ve Preview URL bulunmadığı için gerçek Preview QA sonucu “bekliyor” kabul edilmelidir.

15G operasyonel kapanış kriterleri:

- Gerçek Vercel Preview deploy, Dashboard/CLI erişimi olan yetkili kullanıcı tarafından env değerleri girildikten sonra alınmalıdır.
- Preview env için `TURNSTILE_ENABLED=true`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `RATE_LIMIT_PROVIDER=upstash`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `DONATION_MODE=whatsapp`, `SITE_MAINTENANCE_MODE=false` ve Preview `NEXT_PUBLIC_SITE_URL` birlikte tanımlanmalıdır.
- Bu workspace'te Vercel CLI, agent-browser CLI, staging secret değerleri ve Preview URL bulunmadığı için 15G gerçek browser QA burada tamamlanmış sayılmaz.
- Preview QA çıktısında `/iletisim`, `/gonullu-ol` ve `/kayit` için widget render, token yok, geçersiz token, başarılı token, honeypot, KVKK/consent ve Upstash limit aşımı kanıtları yer almalıdır.
- Test submitleri oluşursa staging veritabanında temizlenmeli veya açıkça test kaydı olarak işaretlenmelidir.
- Production'da `TURNSTILE_ENABLED=true` zorunlu yapılmadan önce 15G Preview kanıtı, negative harness sonucu ve public bundle secret scan sonucu kayda geçirilmelidir.

Cloudflare'ın resmi test key belgeleri: https://developers.cloudflare.com/turnstile/troubleshooting/testing/

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
- `NEXT_PUBLIC_SITE_URL` boşsa veya staging/preview/test/localhost olarak görünmüyorsa script durur.
- Başarılı insert/upload büyük security warning sayılır ve mümkünse cleanup denenir.
- Constraint/not-null hataları `INCONCLUSIVE` raporlanır; bu tek başına RLS'in kapalı olduğunu kanıtlamaz.

15E/15F/15G sonucu: Bu workspace'te gerçek staging project ref, staging URL ve allowlist env değerleri bulunmadığı için harness yalnızca güvenli guard/default modunda çalıştırılmalıdır. Gerçek staging allowlist testi, staging Supabase project ref ve preview/staging URL açıkça sağlandıktan sonra koşulmalıdır; production DB üzerinde negatif write/delete testi yapılmamalıdır.

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
- İletişim/gönüllü başvurularında olağan dışı yoğunluk görülürse Turnstile üretim aktivasyonu ve Upstash limit eşikleri ayrı onayla sıkılaştırılmalıdır.
- Rate limit provider eklenirse secret değerleri server env’de tutulmalı ve public bundle taraması tekrar yapılmalıdır.
