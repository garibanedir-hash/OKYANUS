# Güvenlik Checklist

## Auth

- [ ] Admin route'ları auth gerektiriyor.
- [ ] `NEXT_PUBLIC_ADMIN_DEMO_MODE=false` olduğunda `/admin`, `/panel`, `/koordinator`, `/personel` route'ları server-side guard ile korunuyor.
- [ ] Demo mode production'da kapalı mı?
- [ ] MFA ihtiyacı değerlendirildi.
- [ ] Oturum süresi ve güvenli çıkış tanımlandı.
- [ ] Supabase env değişkenleri tanımlandı mı?
- [ ] Session refresh test edildi mi?
- [ ] Password reset flow planlandı mı?
- [ ] Rol bazlı test kullanıcıları yalnızca staging/dev ortamda kullanılıyor mu?
- [ ] Test kullanıcı şifreleri sadece `.env.local` veya güvenli staging secret yönetiminde tutuluyor mu?

## RBAC

- [ ] Roller net tanımlandı.
- [ ] UI aksiyonları role göre sınırlandı.
- [ ] Backend/server action yetki kontrolü eklendi.
- [ ] Admin role validation server-side yapılacak mı?
- [ ] Route guard yalnızca client-side görünürlük olarak kalmıyor; proxy/server action/server layout katmanında doğrulanıyor.
- [ ] Bilinmeyen rol güvenli fallback route'a yönlendiriliyor.
- [ ] Admin role validation database (`profiles`, `user_accounts`, `role_permissions`) üzerinden geliyor mu?
- [ ] Metadata tek başına nihai güvenlik kaynağı olarak kullanılmıyor mu?
- [ ] Her rol yalnızca kendi paneline yönleniyor ve diğer panellere erişimi server-side reddediliyor mu?
- [ ] `profiles.role` ve `user_accounts.account_type` uyumu test kullanıcılarıyla doğrulandı mı?
- [ ] Admin public içerik CRUD işlemleri sadece `admin` veya `super_admin` rolüyle yapılabiliyor mu?

## RLS

- [ ] Public read tabloları ayrıldı.
- [ ] Hassas tablolar public read'e kapatıldı.
- [ ] RLS policy'leri staging ortamında test edildi.
- [ ] RLS policy testleri yapıldı mı?
- [ ] Smoke test anon/publishable key ile çalışıyor mu?
- [ ] Service role ile RLS testi yapılmadığı doğrulandı mı?
- [ ] Bağış, gönüllü, iletişim, görev, mesaj, personel, sponsorluk ve çocuk verileri varsayılan kapalı mı?
- [ ] Hassas tablolarda yanlışlıkla public SELECT policy kalmadı mı?
- [ ] RLS, route guard'dan bağımsız şekilde asıl veri güvenliği katmanı olarak korunuyor mu?
- [ ] Authenticated ownership policy staging ortamında test edildi mi?
- [ ] Authenticated user başkasının verisine erişemiyor mu?
- [ ] 8F read-only public bağlantılar sadece `projects`, `news_posts` ve `reports` gibi düşük riskli public tablolara gidiyor mu?
- [ ] Hassas tablolar read-only entegrasyon bahanesiyle public erişime açılmadı mı?
- [ ] 9A write policy'leri yalnızca public içerik tabloları için authenticated admin/super_admin kapsamıyla açıldı mı?
- [ ] Public/anon insert/update/delete kesinlikle kapalı mı?
- [ ] Hard delete yerine archive/status update kullanılıyor mu?
- [ ] Kurban modülünde public/anon yalnızca aktif `qurban_campaigns` kayıtlarını okuyabiliyor mu?
- [ ] `qurban_orders`, `qurban_delegations`, `qurban_shares`, `qurban_operations`, `qurban_distribution_logs`, `qurban_status_logs`, `qurban_notifications` ve `qurban_exports` public erişime kapalı mı?
- [ ] Kurban modülünde insert/update/delete policy sonraki aşamaya bırakıldı mı?
- [ ] Bağışçı, koordinatör ve personel kurban kayıtları ownership/assignment kapsamıyla sınırlandırıldı mı?
- [ ] Kurban başvuru yazımı public tablo insert yerine server-side `create_qurban_order` RPC ile yapılıyor mu?
- [ ] `create_qurban_order` RPC anon/authenticated rollerden revoke edildi mi?
- [ ] Kurban kontenjan rezervasyonu transaction içinde satır kilidiyle kontrol ediliyor mu?
- [ ] 9C.1 sonrası public kurban sayfalarında gereksiz teknik veri kaynağı veya hassas operasyon detayı gösterilmiyor mu?
- [ ] Guest kurban başvuruları panelde e-posta ile otomatik eşleştirilmiyor mu?
- [ ] Yetim hamiliği modülünde public/anon yalnızca aktif `sponsorship_programs` kayıtlarını okuyabiliyor mu?
- [ ] `orphan_profiles`, `sponsorships`, `sponsorship_applications`, `sponsorship_matches`, `sponsorship_payments`, `orphan_updates`, `orphan_sponsorship_notes`, `orphan_assignments`, `sponsorship_notifications`, `sponsorship_exports` ve `sponsorship_status_logs` public erişime kapalı mı?
- [ ] Yetim hamiliği başvuru yazımı public insert policy yerine server-side action ve server-only repository ile yapılıyor mu?
- [ ] Sponsor yalnızca kendi `sponsor_account_id` veya hesap e-postasıyla ilişkili başvuruları okuyabiliyor mu?
- [ ] Sponsor güvenli yetim özetini yalnızca kendi sponsorship ilişkisi üzerinden okuyabiliyor mu?
- [ ] Koordinatör/personel yalnızca kendisine atanmış yetim/sponsorluk görevlerini okuyabiliyor mu?
- [ ] Ortak ödeme tabloları (`payment_intents`, `payment_events`, `payment_provider_events`, `receipts`, `notification_queue`, `payment_status_logs`) public/anon erişime kapalı mı?
- [ ] Authenticated donor yalnızca kendi `donor_account_id` ilişkili payment intent ve receipt kayıtlarını okuyabiliyor mu?
- [ ] Admin/super_admin dışında payment event, provider event, notification queue ve payment status log okunamıyor mu?
- [ ] `sponsored_orphans_safe_view` `security_invoker = true` ve anon erişime kapalı mı?
- [ ] Supabase Security Advisor 9E.1 sonrası payment ve safe view için uyarısız mı?

## Form validation

- [ ] Client-side validasyon eklendi.
- [ ] Server-side validasyon eklendi.
- [ ] Hata mesajları erişilebilir yazıldı.
- [ ] Kurban formunda vekalet ve KVKK onayı olmadan kayıt oluşmuyor mu?
- [ ] Kurban formu honeypot alanı bot submitlerini gerçek kayıt oluşturmadan karşılıyor mu?
- [ ] Yetim hamiliği başvuru formunda KVKK onayı olmadan kayıt oluşmuyor mu?
- [ ] Yetim hamiliği başvuru formu honeypot alanı bot submitlerini gerçek kayıt oluşturmadan karşılıyor mu?

## Rate limiting

- [ ] Bağış formu için limit uygulandı.
- [ ] Gönüllü formu için limit uygulandı.
- [ ] İletişim formu için limit uygulandı.
- [ ] Login rate limit / brute force koruması planlandı mı?

## File upload security

- [ ] MIME türleri sınırlandı.
- [ ] Dosya boyutu sınırı belirlendi.
- [ ] Private/public bucket ayrımı yapıldı.
- [ ] Dosya path normalizasyonu uygulandı.
- [ ] Storage bucket policy tanımlandı mı?
- [ ] `project-media` bucket public read, admin upload server action ve anon upload kapalı olacak şekilde doğrulandı mı?
- [ ] Proje/bölge/faaliyet görsel upload akışı service role key'i client tarafına taşımıyor mu?
- [ ] Görsel upload server-side MIME ve 5 MB boyut kontrolünden geçiyor mu?
- [ ] Next.js Server Action body limiti 10 MB olarak ayarlı, ancak uygulama/bucket görsel kabul limiti 5 MB olarak korunuyor mu?

## 14B Çerez ve Hukuki Onay Güvenliği

- [ ] `site_cookie_consents` RLS enabled/forced ve anon/public erişime kapalı mı?
- [ ] Çerez tercih mekanizması ilk sürümde DB'ye public insert/update açmadan localStorage/cookie ile çalışıyor mu?
- [ ] Zorunlu çerezler kapatılamıyor, işlevsel/analitik/pazarlama tercihleri ayrı tutuluyor mu?
- [ ] Çerez tercih sürümü değiştiğinde kullanıcıdan yeniden tercih alınması planlandı mı?
- [ ] İletişim, gönüllü, bağış, kurban, yetim ve kayıt formlarında KVKK aydınlatma beyanı ayrı alan olarak geliyor mu?
- [ ] Açık rıza gereken formlarda `explicit_consent_given` ayrı tutuluyor mu?
- [ ] Duyuru/bilgilendirme izni `communication_permission_given` alanında opsiyonel tutuluyor mu?
- [ ] Consent timestamp, metin sürümü, context ve user-agent server tarafında yazılıyor mu?
- [ ] Ham IP toplanmıyorsa bu karar metadata/dokümantasyonda açık mı?
- [ ] Form submitleri public anon table write policy yerine server-only action/repository üzerinden yapılıyor mu?
- [ ] Hukuki metinler, resmi dernek bilgileri ve saklama-imha yaklaşımı nihai hukukçu kontrolüne gönderildi mi?
- [ ] `docs/legal-final-review-checklist.md` hukukçu/yönetim/teknik sorumlu tarafından kapatıldı mı?
- [ ] 024 migration uygulanmadan consent kolonlarına yazan public formlar production'a alınmıyor mu?
- [ ] Migration sonrası form test kayıtları gerekiyorsa kontrollü şekilde temizleniyor veya test olarak işaretleniyor mu?

## 15A Production Security Hardening

- [ ] `docs/production-security-hardening.md` teknik sorumlu tarafından gözden geçirildi mi?
- [ ] `SUPABASE_SECRET_KEY` ve `SUPABASE_SERVICE_ROLE_KEY` yalnızca server-only helper, Server Action ve API route katmanında kalıyor mu?
- [ ] Build sonrası `.next/static` içinde service role, Supabase secret veya PayTR merchant secret env adları bulunmuyor mu?
- [ ] `NEXT_PUBLIC_` env adları altında secret/service role veya PayTR key/salt yayınlanmıyor mu?
- [ ] `npm run test:supabase` yalnızca anon/publishable key ile çalışıyor ve `Security warning: 0` sonucunu koruyor mu?
- [ ] Smoke test `project-media` public read ve private makbuz bucketlarının anon key ile listelenemediğini kontrol ediyor mu?
- [ ] Private bucket varlığı ve `public=false` ayarı Supabase Dashboard üzerinden ayrıca doğrulandı mı?
- [ ] `payment_intents`, provider eventleri, makbuzlar, notification queue, role/profile tabloları ve operasyon tablolarında anon write/read açığı yok mu?
- [ ] Admin write action'ları UI guard dışında server-side admin/role guard kullanıyor mu?
- [ ] `/api/paytr/callback` hash doğrulamadan ödeme status update yapmıyor ve duplicate callback idempotent kalıyor mu?
- [ ] Makbuz download route'ları oturum/rol/donor ownership kontrolü yapıyor ve cancelled donor download'a kapalı mı?
- [ ] `DONATION_MODE=whatsapp` modunda public bağış sayfaları payment intent/order/sponsorship payment başlatmıyor mu?
- [ ] Production security header'ları uygulanmış ve tam CSP ayrı kontrollü aşamaya not edilmiş mi?
- [ ] Public form spam/rate limit ve captcha ihtiyacı production riski olarak takip listesine alındı mı?
- [ ] Production env için `NEXT_PUBLIC_ADMIN_DEMO_MODE=false`, `DONATION_MODE=whatsapp`, `PAYTR_DEBUG_ON=false` doğrulandı mı?

## 15B Public Form Spam Koruması

- [ ] `docs/form-spam-protection.md` teknik sorumlu tarafından gözden geçirildi mi?
- [ ] İletişim, gönüllü, kayıt, bağış, kurban ve yetim public formları ortak `FormProtectionFields` hidden alanlarını kullanıyor mu?
- [ ] Server action'lar DB write/RPC öncesi `evaluateFormProtection` ile honeypot, timing ve best-effort rate limit kontrolü yapıyor mu?
- [ ] Honeypot dolu submitlerde gerçek kayıt veya payment intent oluşmuyor mu?
- [ ] Form güvenlik metadata'sı mevcut `consent_metadata.formSecurity` altında tutuluyor mu?
- [ ] Ham IP saklanmadan hash/fingerprint yaklaşımı kullanılıyor mu?
- [ ] Input uzunluk, e-posta, telefon, şifre ve serbest metin kontrolleri server tarafında yapılıyor mu?
- [ ] `DONATION_MODE=whatsapp` modunda bağış/kurban/yetim action'ları DB write veya payment intent başlatmadan duruyor mu?
- [ ] In-memory rate limitin serverless ortamda best-effort olduğu ve kalıcı çözüm için Redis/KV/Supabase seçeneği gerektiği dokümante edildi mi?
- [ ] Turnstile/hCaptcha/reCAPTCHA seçenekleri secret client'a taşınmadan server verification modeliyle planlandı mı?
- [ ] Anon write negatif testleri staging cleanup planı olmadan production DB üzerinde çalıştırılmıyor mu?

## 15C Rate Limit Provider, Turnstile Pilot ve Negatif Test Harness

- [ ] `lib/security/rateLimitProvider.ts` kalıcı provider eklenebilir arayüzle hazır mı?
- [ ] In-memory provider'ın production için yalnızca best-effort olduğu ekip tarafından biliniyor mu?
- [ ] Production için kalıcı/global rate limit provider kararı Upstash Redis olarak dokümante edildi mi?
- [ ] `TURNSTILE_ENABLED=false` varsayılanında iletişim, gönüllü, kayıt ve online formlar bozulmadan çalışıyor mu?
- [ ] `TURNSTILE_SECRET_KEY` client component, public bundle veya `NEXT_PUBLIC_` env içine taşınmıyor mu?
- [ ] `NEXT_PUBLIC_TURNSTILE_SITE_KEY` yalnızca public widget key olarak kullanılıyor mu?
- [ ] Turnstile enabled olduğunda token yoksa server action fail-closed ve kullanıcı dostu hata veriyor mu?
- [ ] Turnstile verification metadata'sı `consent_metadata.turnstile` altında teknik secret olmadan tutuluyor mu?
- [ ] `npm run test:security:negative` varsayılan ortamda write/delete yapmadan güvenli skip veriyor mu?
- [ ] Negatif test harness yalnızca `REQUIRE_STAGING_NEGATIVE_TESTS=true` ve allowlist project ref ile çalışıyor mu?
- [ ] Harness production domain veya production project ref üzerinde çalışmayı reddediyor mu?
- [ ] Hassas tablolara anon insert/read başarılı olursa security warning üretecek şekilde kontrol edildi mi?
- [ ] Cloudflare Turnstile script'i aktif edilecekse CSP ve browser QA staging'de tekrar yapılacak mı?

## 15D Turnstile Pilot ve Provider Kararı

- [ ] Cloudflare resmi test key'leriyle `TURNSTILE_ENABLED=true` lokal/staging pilotu yapıldı mı?
- [ ] Token yok senaryosu DB write oluşturmadan kullanıcı dostu genel hata veriyor mu?
- [ ] Always-fails test secret ile dummy token reddediliyor mu?
- [ ] Always-passes test secret ile dummy token submit akışına devam ediyor ve test kaydı temizleniyor mu?
- [ ] Gerçek Vercel Preview/Staging Turnstile site key ve secret key tanımlanınca aynı senaryolar tekrar koşulacak mı?
- [ ] Secret scan `.next/static` içinde `TURNSTILE_SECRET_KEY` ve diğer server secret env adlarını bulmuyor mu?
- [ ] Negative harness `NEXT_PUBLIC_SITE_URL` boş veya production gibi olduğunda çalışmayı reddediyor mu?
- [ ] Staging allowlist olmadan `test:security:negative` write/delete yapmadan duruyor mu?
- [ ] Upstash Redis 15E entegrasyonu için env, key formatı, TTL ve fingerprint hash planı kabul edildi mi?

## 15E Upstash Redis ve Staging Güvenlik QA

- [ ] `.env.example` `RATE_LIMIT_PROVIDER=memory`, `UPSTASH_REDIS_REST_URL` ve `UPSTASH_REDIS_REST_TOKEN` alanlarını içeriyor mu?
- [ ] `RATE_LIMIT_PROVIDER=memory` varsayılanında public formlar 15B/15C davranışını koruyor mu?
- [ ] `RATE_LIMIT_PROVIDER=upstash` ve Upstash env değerleri tanımlıysa `lib/security/rateLimitProvider.ts` kalıcı Redis provider kullanıyor mu?
- [ ] Upstash env eksik veya provider runtime hatasında sistem build'i kırmadan memory fallback'e dönüyor mu?
- [ ] Upstash token `NEXT_PUBLIC_` env altında, client componentlerde veya public bundle içinde görünmüyor mu?
- [ ] Rate limit key formatı ham IP saklamadan `form:{form}:{fingerprintHash}` standardını kullanıyor mu?
- [ ] İletişim için 10 dakikada 8, gönüllü/bağış/kurban/yetim için 10 dakikada 5, kayıt için 10 dakikada 4 deneme sınırı uygulanıyor mu?
- [ ] Rate limit aşımında DB/RPC/Auth write başlamadan kullanıcı dostu genel hata dönüyor mu?
- [ ] Gerçek Vercel Preview/Staging ortamında Cloudflare Turnstile key'leriyle token yok/geçersiz/başarılı senaryoları tekrar koşuldu mu?
- [ ] Staging allowlist ve staging/preview `NEXT_PUBLIC_SITE_URL` ile `npm run test:security:negative` çalıştırıldı mı?
- [ ] Build sonrası `.next/static` içinde `UPSTASH_REDIS_REST_TOKEN`, `TURNSTILE_SECRET_KEY`, Supabase service role ve PayTR secret env adları bulunmuyor mu?
- [ ] Tam CSP eklenecekse `https://challenges.cloudflare.com` script/frame/connect kaynakları Preview üzerinde ayrıca test edildi mi?

## 15F Preview QA ve Güvenlik Kapanışı

- [ ] Vercel Preview env içinde `TURNSTILE_ENABLED=true`, staging Turnstile site key/secret key, `RATE_LIMIT_PROVIDER=upstash` ve staging Upstash env değerleri tanımlandı mı?
- [ ] `npm run check:supabase-env` Preview/Production veya `REQUIRE_STRICT_PREVIEW_SECURITY_ENV=true` modunda Turnstile/Upstash env eksiklerini hata olarak yakalıyor mu?
- [ ] Gerçek Preview URL üzerinde `/iletisim`, `/gonullu-ol`, `/kayit`, `/bagis-yap`, `/kurban/bagis` ve `/yetim-hamiligi/basvuru` route'ları kontrol edildi mi?
- [ ] Turnstile widget, token yok, geçersiz token ve başarılı token senaryoları DB write ve kullanıcı mesajları açısından doğrulandı mı?
- [ ] Upstash limit aşımı aynı form/context/fingerprint için DB write öncesi duruyor mu?
- [ ] Preview QA sırasında oluşan test kayıtları temizlendi veya açık test kaydı olarak işaretlendi mi?
- [ ] `npm run test:security:negative` staging allowlist ve staging/preview `NEXT_PUBLIC_SITE_URL` ile çalıştırıldı mı?
- [ ] Negative harness çıktısında hassas tablo/bucket anon read/write/delete başarılı sonucu yok mu?
- [ ] Production'da Turnstile zorunlu açılmadan önce Preview sonucu, CSP notu ve rollback planı dokümante edildi mi?

## 15G Vercel Preview ve Staging Negative Kapanışı

- [ ] Vercel Preview Dashboard/CLI üzerinden `TURNSTILE_ENABLED=true`, staging Turnstile key'leri, `RATE_LIMIT_PROVIDER=upstash`, staging Upstash URL/token, `DONATION_MODE=whatsapp`, `SITE_MAINTENANCE_MODE=false` ve Preview `NEXT_PUBLIC_SITE_URL` tanımlandı mı?
- [ ] Yetkili kullanıcı yeni Preview deploy aldı ve Preview URL rapora işlendi mi?
- [ ] Preview URL üzerinde `/`, `/iletisim`, `/gonullu-ol`, `/kayit`, `/bagis-yap`, `/kurban/bagis`, `/yetim-hamiligi/basvuru`, `/hukuki`, `/robots.txt` ve `/sitemap.xml` kontrol edildi mi?
- [ ] Turnstile widget render, token yok, geçersiz token ve başarılı token senaryoları gerçek tarayıcıda DB write etkisiyle doğrulandı mı?
- [ ] Upstash rate limit aynı form/context/fingerprint için limit aşımında DB write öncesi duruyor ve kullanıcıya genel hata dönüyor mu?
- [ ] `npm run test:security:negative` staging allowlist project ref ve staging/preview `NEXT_PUBLIC_SITE_URL` ile çalıştırıldı mı?
- [ ] Negative harness production domain, boş URL veya allowlist dışı project ref için çalışmayı reddediyor mu?
- [ ] Preview QA sırasında oluşan test kayıtları temizlendi veya test kaydı olarak işaretlendi mi?
- [ ] Public bundle secret scan `UPSTASH_REDIS_REST_TOKEN`, `TURNSTILE_SECRET_KEY`, Supabase service role ve PayTR secret değerleri için temiz mi?
- [ ] Bu repo workspace'inde Vercel CLI, agent-browser CLI, staging secret'lar veya Preview URL yoksa 15G gerçek QA sonucu “bekliyor” olarak raporlandı mı?

## Payment webhook security

- [ ] 9E'de canlı provider webhook endpoint'i açılmadığı doğrulandı.
- [ ] Gelecek webhook için signature doğrulama planı eklendi.
- [ ] Payment intent ve provider event idempotency alanları hazırlandı.
- [ ] Tutar ve para birimi server-side doğrulama planı hazırlandı.
- [ ] Kart numarası, CVV veya banka şifresi gibi hassas ödeme verisi saklanmadığı doğrulandı.
- [ ] Provider raw payload yalnızca güvenli özet olarak tutulacak; secret veya tam kart verisi loglanmayacak.

## Audit logs

- [ ] Kritik admin işlemleri loglanıyor.
- [ ] Loglarda hassas veri maskeleniyor.
- [ ] Audit log silme kapalı.
- [ ] Export işlemleri audit log'a düşüyor mu?
- [ ] Personel rol değişiklikleri audit log'a düşüyor mu?
- [ ] Public içerik create/update/archive işlemleri audit helper'a best-effort yazılıyor mu?
- [ ] Kurban vekalet, ödeme, kesim, dağıtım ve export işlemleri production öncesi audit planına eklendi mi?
- [ ] Kurban order create, vekalet kabulü, hisse rezervasyonu ve quota rezervasyonu status/audit log'a düşüyor mu?
- [ ] Kurban başarı ekranında ödeme bekliyor durumu ve admin kayıt notu teknik detay vermeden gösteriliyor mu?
- [ ] Yetim hamiliği başvuru, eşleştirme, sponsorship oluşturma ve orphan sponsorlu durum geçişleri status/audit log'a düşüyor mu?

## PII masking

- [ ] E-posta maskeleme var.
- [ ] Telefon maskeleme var.
- [ ] Export dosyalarında PII sınırlandı.
- [ ] Export kişisel verileri maskeliyor mu?
- [ ] Kurban bağışçı ekranlarında e-posta/telefon maskeli gösteriliyor mu?
- [ ] Kurban export ekranında kişisel veri maskeleme varsayılan açık mı?
- [ ] Admin kurban bağışları ekranında donor adı, e-posta ve telefon maskeli mi?
- [ ] Yetim hamiliği admin ve panel ekranlarında çocuk açık kimliği, açık adresi, okul adı, telefon ve aile detayı gösterilmiyor mu?
- [ ] Sponsor panelinde yalnızca yetim kodu, güvenli ad/rumuz, yaş grubu, bölge ve eğitim özeti gösteriliyor mu?
- [ ] İç mesajlarda hassas veri paylaşımı engelleniyor mu?

## Backup

- [ ] Veritabanı backup planı var.
- [ ] Storage backup planı var.
- [ ] Restore testi yapıldı.

## Admin route protection

- [ ] Middleware/server guard var.
- [ ] Yetkisiz erişim ekranı var.
- [ ] Public site admin linki göstermiyor.
- [ ] proxy.ts admin route guard için hazır mı?
- [ ] /admin/giris route'u koruma dışı mı?
- [ ] /giris ve /kayit public auth route'ları koruma dışında mı?
- [ ] /panel route'ları bağışçı/gönüllü account type ile korunuyor mu?
- [ ] /koordinator route'ları koordinatör rolü ve assignment kapsamı ile korunuyor mu?
- [ ] /personel route'ları sadece kendi görev/mesaj/profil verisine erişiyor mu?
- [ ] /tadilat redirect loop dışında mı?
- [ ] `/admin/giris`, `/giris` ve `/kayit` route'ları auth guard dışında kalıyor mu?
- [ ] Demo mode production'da kapatılıyor mu?
- [ ] Production'da `NEXT_PUBLIC_ADMIN_DEMO_MODE=true` verilse bile demo bypass etkisiz kalıyor mu?
- [ ] Yetkisiz route mesajı kullanıcı dostu ve teknik detaylardan arındırılmış mı?

## Environment variables

- [ ] Gizli anahtarlar client bundle'a girmiyor.
- [ ] Production/staging env ayrıldı.
- [ ] Secret rotation planlandı.
- [ ] Secret/service role key client tarafına sızmıyor mu?
- [ ] Production secret management planlandı mı?
- [ ] Test kullanıcı env değerleri GitHub'a veya public deploy loglarına yazılmıyor mu?
- [ ] Read-only public sorgular yalnızca publishable/anon key ile yapılıyor; service role key kullanılmıyor.
- [ ] Kurban write akışı service role kullanıyorsa sadece server-only repository içinde mi?
- [ ] Kurban form client component'i secret veya service role env import etmiyor mu?
- [ ] Kurban order write repository `server-only` sınırında kalıyor mu?
- [ ] Yetim hamiliği repository'si read-only/mock çalışıyor ve client tarafına service role taşımıyor mu?
- [ ] Yetim hamiliği write repository `server-only` sınırında kalıyor ve service role client tarafına taşınmıyor mu?
- [ ] Payment write repository `server-only` sınırında kalıyor ve service role client tarafına taşınmıyor mu?
- [ ] PayTR helper ve callback kodu server-only kalıyor, `PAYTR_MERCHANT_KEY`/`PAYTR_MERCHANT_SALT` client bundle'a taşınmıyor mu?
- [ ] Public bağış, kurban ve yetim formları payment tablolara doğrudan client-side yazmıyor mu?
- [ ] `DONATION_MODE=whatsapp` veya `disabled` iken public bağış/kurban/yetim formları render edilmiyor ve yeni payment intent başlatmıyor mu?
- [ ] WhatsApp telefon/mesaj bilgisi public-safe kabul ediliyor; PayTR merchant key/salt veya Supabase service role secret client bundle'a taşınmıyor mu?
- [ ] `.env.local` Git'e dahil değil ve Vercel production env değerleri public/server ayrımıyla tanımlı mı?
- [ ] Production öncesi `NEXT_PUBLIC_ADMIN_DEMO_MODE=false` ve `SITE_MAINTENANCE_MODE` durumu doğrulanıyor mu?

## Error handling

- [ ] Kullanıcıya güvenli hata mesajı gösteriliyor.
- [ ] Teknik detaylar public ekrana basılmıyor.
- [ ] Kritik hatalar loglanıyor.
- [ ] Supabase read-only hata/timeout durumunda public sayfa mock fallback veya empty state ile açılıyor.
- [ ] Read-only repository logları secret/key/token/şifre içermiyor.
- [ ] Kurban Supabase read hatalarında admin/panel ekranları güvenli mock fallback veya boş state ile açılıyor mu?
- [ ] Yetim hamiliği Supabase read hatalarında public/admin/panel ekranları güvenli mock fallback veya boş state ile açılıyor mu?

## Logging

- [ ] Server logları merkezi takip ediliyor.
- [ ] Hassas veri loglara yazılmıyor.
- [ ] Log retention süresi tanımlı.

## KVKK/data retention

- [ ] Veri minimizasyonu uygulandı.
- [ ] Saklama süreleri belirlendi.
- [ ] Silme/anonimleştirme akışı tanımlandı.
- [ ] Export işlemleri yetkiye bağlı mı?
- [ ] İç mesajlara sadece katılımcılar erişebiliyor mu?
- [ ] Görevleri sadece yetkili roller görüntülüyor mu?
- [ ] Supabase Realtime kullanılacaksa kanal erişimleri sınırlandırıldı mı?
- [ ] Bağışçı yalnızca kendi bağışlarını görebiliyor mu?
- [ ] Bağışçı yalnızca kendi kurban siparişi ve vekalet durumunu görebiliyor mu?
- [ ] Sponsor yalnızca kendi sponsorluklarını görebiliyor mu?
- [ ] Yetim/çocuk verileri maskeleniyor mu?
- [ ] Yetim hamiliği güncellemelerinde açık adres, okul adı, kimlik, telefon, aile detayı ve hassas fotoğraf engelleniyor mu?
- [ ] Gönüllü yalnızca kendi başvurularını ve görevlerini görebiliyor mu?
- [ ] Personel yalnızca kendi görevlerine erişiyor mu?
- [ ] Koordinatör sadece kendi ekibine erişiyor mu?
- [ ] Koordinatör/personel yalnızca kendisine atanmış kurban operasyonlarını görebiliyor mu?
- [ ] Kullanıcı rol değişiklikleri audit log'a düşüyor mu?
- [ ] Panel erişimleri server-side doğrulanıyor mu?
- [ ] Public kayıt spam/rate limit ile korunuyor mu?
- [ ] Hesap oluşturma KVKK onayı alıyor mu?
- [ ] KVKK Aydınlatma Metni ve Açık Rıza Metni public sitede ayrı sayfalar ve ayrı checkbox beyanları olarak sunuluyor mu?
- [ ] İletişim ve gönüllü formlarında zorunlu aydınlatma beyanı, opsiyonel açık rıza/duyuru izninden ayrıldı mı?
- [ ] Bağış, kurban ve yetim hamiliği formlarında bağış şartları/KVKK bağlantıları görünüyor ve opsiyonel iletişim izni ayrı tutuluyor mu?
- [ ] WhatsApp yönlendirmelerinde kullanıcıya paylaşacağı bilgilerin talebin yanıtlanması amacıyla değerlendirileceği kısa şekilde bildiriliyor mu?
- [ ] Resmi dernek adresi, sicil bilgileri ve yetkili iletişim bilgileri nihai hukukçu/yönetim kontrolünde tamamlanacak mı?
- [ ] Çerez politikası, analitik veya pazarlama aracı eklendiğinde güncellenecek mi?
- [ ] Online ödeme açılmadan önce bağış bilgilendirme ve online ödeme metinleri güncel ödeme akışına göre tekrar kontrol edilecek mi?
- [ ] Hukuki metinler hukukçu kontrolüne sunulmadan kesin uygunluk iddiasıyla yayımlanmıyor mu?

## Deployment security

- [ ] HTTPS zorunlu.
- [ ] Security headers ayarlandı.
- [ ] Dependency audit süreci var.
- [ ] Production build doğrulanıyor.
- [ ] Test kullanıcıları production ortamında kullanılmıyor.
- [ ] Test kullanıcıları production öncesi silindi veya devre dışı bırakıldı.
- [ ] Server guard + RLS doğrulaması, UI görünürlüğünden bağımsız olarak geçerli.
- [ ] `npm run test:supabase` production öncesi `Security warning: 0` veriyor.

## PayTR Test Entegrasyon Güvenliği

- [ ] `/odeme/paytr/[intentNo]` yalnızca PayTR iframe gösteriyor; kart alanı geliştirmiyor.
- [ ] `/api/paytr/callback` session kullanmıyor ve sadece hash doğrulamasıyla işlem yapıyor.
- [ ] PayTR ok/fail sayfaları ödeme onayı veya iptali yapmıyor.
- [ ] Duplicate callback idempotent işleniyor.
- [ ] Callback payload summary hassas secret veya tam kart verisi içermiyor.
- [ ] Production öncesi `PAYTR_TEST_MODE=false` geçişi yazılı onay ve test tamamlanmadan yapılmıyor.

## 10B Payment Intent Başlatma Güvenliği

- [ ] Genel bağış payment intent server action ile oluşturuluyor; client doğrudan payment tablolarına yazmıyor.
- [ ] Kurban payment intent tutarı server-side oluşturulan order toplamından geliyor.
- [ ] Yetim sponsorship payment intent tutarı server-side sponsorship/program değerinden geliyor.
- [ ] Aynı context için bekleyen intent tekrar kullanılıyor; duplicate pending kayıt oluşmuyor.
- [ ] PayTR env eksikliği kullanıcıya güvenli ve teknik detay içermeyen mesajla gösteriliyor.
- [ ] Public ödeme sayfasında merchant key/salt, hash veya teknik callback detayı gösterilmiyor.

## 10C Callback Finalization Güvenliği

- [ ] `016_payment_finalization_and_context_state.sql` RPC fonksiyonları public/anon/authenticated execute yetkisine kapalı.
- [ ] RPC fonksiyonları `security definer` kullanıyorsa `search_path = public` olarak sabit.
- [ ] PayTR callback hash doğrulaması payment intent güncellemesinden önce yapılıyor.
- [ ] Callback `total_amount` server-side payment intent tutarıyla kuruş bazında karşılaştırılıyor.
- [ ] Tutar/para birimi uyuşmazlığı paid finalization çalıştırmıyor.
- [ ] Duplicate provider event `payment_provider_events.processed = true` ise tekrar finalization çalıştırmıyor.
- [ ] Terminal payment intent durumları (`paid/failed/cancelled/refunded`) replay callback ile yeniden işlenmiyor.
- [ ] Kurban quota ve sponsorluk tarih güncellemeleri idempotent RPC içinde yapılıyor.
- [ ] Receipt ve notification queue kayıtları duplicate oluşmayacak şekilde hazırlanıyor.
- [ ] Callback logları merchant key/salt, kart bilgisi veya hassas provider payload içermiyor.

## 10D Makbuz PDF ve Private Storage Güvenliği

- [ ] `receipts-private` bucket public değil.
- [ ] Receipt PDF dosyaları public URL ile paylaşılmıyor.
- [ ] `/api/receipts/[receiptNo]/download` anon/public erişimi reddediyor.
- [ ] Admin/super_admin dışındaki kullanıcılar yalnızca kendi `donor_account_id` ilişkili makbuzunu açabiliyor.
- [ ] `donor_account_id = null` guest kayıtlar donor e-postasıyla otomatik açılmıyor.
- [ ] Client componentlere service role key veya storage bucket credential taşınmıyor.
- [ ] Client HTML içinde `file_path` yetki bypass edecek şekilde kullanılmıyor.
- [ ] PDF içinde kart bilgisi, provider raw payload, hash, merchant key/salt, service role key veya IP yok.
- [ ] PDF üretimi ve download audit log best-effort yazıyor.
- [ ] Storage bucket private kontrolü Supabase panelden manuel doğrulanıyor.

## 10F Makbuz Versioning ve Workflow Güvenliği

- [ ] PDF yeniden oluşturma eski storage dosyasını silmiyor veya üzerine yazmıyor.
- [ ] Yeni PDF sürümleri `v1/v2/v3` path standardını izliyor.
- [ ] `receipts.file_path` yalnızca aktif/latest versiyonu gösteriyor.
- [ ] `issued` makbuz yeniden oluşturma gerekçesi zorunlu.
- [ ] `cancelled` makbuz donor download'a kapalı.
- [ ] Admin/super_admin cancelled makbuzun mevcut dosyasını audit log ile görüntüleyebiliyor.
- [ ] `receipt.pdf.regenerate`, `receipt.issue` ve `receipt.cancel` audit kayıtları best-effort yazılıyor.
- [ ] Service role key client tarafına taşınmıyor.

## 10F-M Manuel / Fiziksel Makbuz Güvenliği

- [ ] `manual_receipts` ve `manual_receipt_events` RLS enabled/forced.
- [ ] Anon/public kullanıcı manuel makbuz kayıtlarını okuyamıyor veya yazamıyor.
- [ ] Admin/super_admin dışındaki kullanıcılar ilk sürümde manuel makbuz PDF download açamıyor.
- [ ] `manual-receipts-private` bucket public değil.
- [ ] Manuel makbuz PDF path'i client tarafında yetki yerine kullanılmıyor.
- [ ] TCKN/VKN gibi alanlar listede maskeli veya minimum gösteriliyor.
- [ ] İptal gerekçesi zorunlu, dosya silinmiyor ve event/audit izi korunuyor.
- [ ] Service role key sadece server-only repository/storage katmanında kullanılıyor.
- [ ] Manuel makbuz hukuki/mali metinleri production öncesi yönetim, mali müşavir ve hukuk onayından geçiyor.

## 11A Proje Faaliyetleri Güvenliği

- [ ] `project_activities` RLS enabled/forced ve anon write kapalı.
- [ ] `project_activity_events` anon/public erişime kapalı.
- [ ] Public proje sayfası yalnızca completed/public faaliyetleri gösteriyor.
- [ ] Public mapping `internal_notes`, maliyet, sorumlu kullanıcı id, metadata ve admin id alanlarını döndürmüyor.
- [ ] Admin write action'ları `requireAdminUser()` ile korunuyor.
- [ ] Public görünürlük sadece `status = completed` kayıtlar için açılıyor.
- [ ] İptal gerekçesi zorunlu ve event/audit izi korunuyor.
- [ ] Service role key client componentlere veya public route'lara taşınmıyor.

## 11A.3 Proje Bölgeleri Güvenliği

- [ ] `project_regions` RLS enabled/forced.
- [ ] Anon/public yalnızca `is_active = true` ve `visibility = public` bölgeleri okuyabiliyor.
- [ ] Anon/public `project_regions` insert/update/delete yapamıyor.
- [ ] Bölge yönetimi server action ve `requireAdminUser()` üzerinden çalışıyor.
- [ ] Public harita internal/pasif bölgeleri göstermiyor.
- [ ] `project_regions.metadata` içinde secret, iç not veya kişisel veri tutulmuyor.
- [ ] Service role key client componentlere taşınmıyor.
