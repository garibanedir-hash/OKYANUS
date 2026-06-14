# Production Operations Runbook

Bu runbook Okyanus İnsani Yardım Derneği platformu canlıya çıktıktan sonra izleme, hata takibi, backup/restore ve olay müdahalesi için operasyonel referanstır. Bu aşama yeni özellik açma aşaması değildir; `DONATION_MODE=whatsapp` korunur, PayTR online ödeme canlıya alınmaz, RLS gevşetilmez ve public write yüzeyi genişletilmez.

## Operasyon Sahipliği

- Teknik sorumlu: deploy, Vercel logları, build/runtime hataları, smoke test ve rollback kararını takip eder.
- Veri sorumlusu: Supabase tabloları, RLS/Security Advisor uyarıları, backup/restore ve hassas veri erişimini takip eder.
- Operasyon sorumlusu: WhatsApp hattı, form dönüşleri, bağış/makbuz operasyonu ve yanlış yönlendirme risklerini takip eder.
- Yönetim/mali sorumlu: PayTR canlıya alma, makbuz statüsü, ödeme/iadeler ve muhasebe onaylarını verir.
- Hukuk/KVKK sorumlusu: hukuki sayfalar, consent alanları, veri saklama/imha ve olay sonrası bildirim gerekliliğini değerlendirir.

## Günlük Kontrol Listesi

- Public ana sayfa, bağış, kurban, yetim hamiliği, iletişim, gönüllü ve hukuki sayfalar 200 dönüyor.
- Vercel runtime/build logs içinde yeni `error`, `Unhandled`, `500`, `timeout`, `PayTR`, `receipt`, `rate-limit` veya `storage` artışı yok.
- Supabase Dashboard Security Advisor yeni RLS/protected table uyarısı göstermiyor.
- `payment_provider_events`, `payment_events`, `payment_status_logs` ve `notification_queue` beklenmeyen artış veya tekrar eden hata göstermiyor.
- `contact_messages` ve `volunteer_applications` beklenen hacimde; spam paterni, tekrar eden fingerprint veya honeypot tuzağı artışı yok.
- `DONATION_MODE=whatsapp` ve WhatsApp telefonu doğru.
- `receipts-private` ve `manual-receipts-private` public değil.
- Storage kullanım oranı ve Vercel/Supabase kota uyarıları kontrol edildi.

## Haftalık Kontrol Listesi

- `npm run lint`, `npm run build`, `npm run check:supabase-env`, `npm run test:supabase`, `npm run audit:security` son main üzerinde çalıştırıldı.
- `npm run smoke:production` production veya preview base URL ile çalıştırıldı.
- Supabase backup ayarı, son backup zamanı ve restore erişimi Dashboard/provider üzerinden doğrulandı.
- Storage bucket policy'leri ve hassas bucket public=false durumu tekrar kontrol edildi.
- Admin route anon erişimi ve makbuz download anon erişimi spot kontrol edildi.
- Hukuki sayfalar, footer linkleri, cookie tercih akışı ve consent version notları kontrol edildi.
- Açık operasyon maddeleri gözden geçirildi: gerçek Vercel Preview Turnstile/Upstash QA tamamlanmadan production'da `TURNSTILE_ENABLED=true` zorunlu yapılmaz.

## Deploy Sonrası Kontrol Listesi

- Deploy tamamlandı ve son commit/push bilgisi release notuna işlendi.
- `npm run smoke:production` production base URL ile çalıştı.
- `/admin` anon erişimde login'e yönleniyor.
- Admin login gerçek yetkili hesapla çalışıyor.
- `/bagis-yap`, `/kurban/bagis`, `/yetim-hamiligi/basvuru` WhatsApp modunda payment intent veya başvuru write başlatmıyor.
- `/hukuki`, `/robots.txt`, `/sitemap.xml` 200 dönüyor.
- `npm run test:supabase` çıktısı `Security warning: 0` ve `Missing table: 0` olarak doğrulandı.
- `receipts-private` ve `manual-receipts-private` Dashboard'da public=false.
- Vercel logs ilk 15-30 dakika izlendi; tekrar eden 500 veya provider hata piki yok.

## Bakılacak Loglar

- Vercel deployment logs: build hatası, env eksikliği, Next.js runtime exception.
- Vercel function/runtime logs: `/api/paytr/callback`, makbuz download route'ları, public form server action hataları.
- Supabase logs: Auth hataları, PostgREST RLS/permission hataları, storage hata ve kota uyarıları.
- Supabase Security Advisor: RLS, function/search_path, exposed table/view uyarıları.
- Application DB kayıtları: `payment_provider_events.processing_error`, `payment_events.raw_event_summary`, `payment_status_logs`, `notification_queue.error_message`.
- Audit kayıtları: admin create/update/archive, makbuz görüntüleme, makbuz iptal/hazırlama olayları.

## Monitoring Checklist

### A) Public Site

- `/` 200.
- `/bagis-yap` 200.
- `/kurban/bagis` 200.
- `/yetim-hamiligi/basvuru` 200.
- `/iletisim` 200.
- `/gonullu-ol` 200.
- `/hukuki` 200.
- `/robots.txt` ve `/sitemap.xml` 200.
- Public sayfalarda teknik stack trace veya env adı görünmüyor.

### B) Admin

- `/admin` anon erişim login'e yönlendiriyor.
- Admin login çalışıyor.
- Admin dashboard 500 vermiyor.
- Proje/bölge/faaliyet upload sistemi admin hesabıyla çalışıyor.
- Admin write action'ları server-side role guard kullanıyor.

### C) Supabase

- Public read tabloları beklenen şekilde okunuyor.
- Protected table warning yok.
- Missing table yok.
- `project-media` bucket erişimi public görseller için çalışıyor.
- `receipts-private` public değil.
- `manual-receipts-private` public değil.
- Smoke test yalnızca anon/publishable key ile çalışıyor.

### D) Formlar

- İletişim formu kayıt alıyor.
- Gönüllü formu kayıt alıyor.
- KVKK/consent alanları doluyor.
- Honeypot bot submit gerçek kayıt oluşturmadan engelleniyor.
- Rate limit DB/Auth write öncesi çalışıyor.
- Form logları tam e-posta, telefon, mesaj metni veya ham IP içermiyor.

### E) Donation Mode

- `DONATION_MODE=whatsapp` iken payment intent oluşmuyor.
- WhatsApp linkleri doğru public numaraya gidiyor.
- KVKK/Gizlilik linkleri WhatsApp bilgilendirme kartlarında görünüyor.
- `DONATION_MODE=online` yanlışlıkla açılmadı.
- `DONATION_MODE=disabled` yalnızca operasyonel durdurma gerektiğinde kullanılıyor.

### F) PayTR

- Production'da online açılmadan gerçek merchant test yapılmalı.
- Callback hash doğrulaması korunuyor.
- Duplicate callback idempotent.
- Provider event özet olarak loglanıyor; tam payload public loglara yazılmıyor.
- Tutar ve para birimi uyuşmazlığında paid finalization çalışmıyor.
- `PAYTR_TEST_MODE=false` yalnızca yönetim, teknik ve mali onayla açılacak.

### G) Makbuz

- Private bucket public değil.
- Download route auth istiyor.
- Cancelled makbuz donor tarafından indirilemiyor.
- Manuel makbuz download yalnızca admin/super_admin.
- PDF oluşturma/yenileme metadata, status ve audit iziyle takip ediliyor.
- File path public URL gibi gösterilmiyor.

## Error Logging Yaklaşımı

- Secret loglanmaz: service role, PayTR key/salt, Upstash token, Turnstile secret, Vercel token ve auth/session değerleri public veya runtime loglara yazılmaz.
- Kullanıcının hassas verileri tam metin loglanmaz: e-posta, telefon, açık adres, kimlik, IBAN, kart bilgisi, form mesajı ve çocuk/yetim hassas verisi maskelenir veya hiç yazılmaz.
- Form hatalarında yalnızca context, error code, timestamp, request category, rate limit provider özeti ve hash/fingerprint gibi teknik özet tutulur.
- Payment callback hatalarında provider payload'ın tamamı public loglara yazılmaz; `payloadSummary` gibi sınırlı alanlar kullanılır.
- Kullanıcıya teknik stack trace dönmez; `app/error.tsx` genel hata mesajı gösterir.
- Admin tarafında hata izlenebilir, fakat secret ve tam kişisel veri içermez.
- `lib/observability/safeLogger.ts` konsol logları için redaction helper olarak kullanılabilir; büyük logging servisi entegrasyonu yapılmadı.

## Backup Planı

- Supabase database backup provider/Dashboard üzerinden yönetilir; otomatik backup sıklığı, retention süresi ve erişim yetkileri production öncesi netleştirilir.
- Migration dosyaları Git ile korunur; schema değişikliği mutlaka migration dosyasıyla yapılır.
- Storage backup ayrıca planlanır: `project-media`, `receipts-private` ve `manual-receipts-private` bucketları ayrı hassasiyet seviyeleriyle ele alınır.
- `receipts-private` ve `manual-receipts-private` hassas belge içerir; backup erişimi sadece yetkili teknik/veri/mali sorumlularla sınırlandırılır.
- `project-media` public görsel içerir; yine de silinme/bozulma senaryosu için bucket export veya provider backup prosedürü tutulur.
- Env secret backup yönetimi Git dışında yapılır: Vercel/Supabase dashboard, parola kasası veya kurumun onaylı secret yönetimi kullanılır.
- Restore provası en az staging ortamında yapılmalıdır; production restore ilk kez kriz anında denenmemelidir.
- Backup erişimi MFA ve en az yetki prensibiyle sınırlandırılır; erişen kişi, tarih ve amaç kayıt altına alınır.

## Restore Senaryoları

### Yanlış Migration Sonrası Geri Dönüş

- Belirti: deploy sonrası table missing, RLS hata artışı, admin/public ekranlarda 500 veya veri uyumsuzluğu.
- İlk kontrol: son migration, Supabase migration history, Vercel logs ve `npm run test:supabase` çıktısı.
- Müdahale: yeni deploy durdurulur, etkilenen akış maintenance veya donation mode ile sınırlandırılır, migration diff incelenir.
- Geri alma / restore: mümkünse forward-fix migration hazırlanır; veri kaybı varsa son DB backup staging'e restore edilip fark çıkarılır, production restore yönetim onayıyla yapılır.
- Son kontrol: smoke test, Security Advisor, kritik public/admin route kontrolü ve etkilenen kayıtların örnek doğrulaması.

### Silinen Public Proje Görseli

- Belirti: proje kartı/detay görseli kırık, Vercel logs image/storage 404 gösteriyor.
- İlk kontrol: admin proje kaydı `cover_image_url`, `project-media` object path ve Supabase Storage logs.
- Müdahale: public sayfa kırılmasını azaltmak için fallback görsel/placeholder doğrulanır.
- Geri alma / restore: `project-media` backup'tan object geri yüklenir veya admin panelden aynı görsel yeniden yüklenir.
- Son kontrol: proje liste/detay sayfası, sitemap etkisi ve CDN/cache davranışı kontrol edilir.

### Yanlışlıkla Silinen Admin İçerik

- Belirti: public proje/haber/rapor görünmüyor veya admin listesinde eksik.
- İlk kontrol: audit log, ilgili tablo status/archive alanı, son deploy ve admin işlem zamanı.
- Müdahale: hard delete değil archive/status update ise status geri alınır; hard delete şüphesinde write işlemleri sınırlandırılır.
- Geri alma / restore: backup staging'e restore edilip tekil kayıt güvenli şekilde çıkarılır; production'a kontrollü insert/update yapılır.
- Son kontrol: public read, admin detay, audit notu ve ilgili sitemap/route kontrol edilir.

### Makbuz PDF Erişim Problemi

- Belirti: admin/donor download 404/403 veriyor veya dosya kaydı var ama PDF yok.
- İlk kontrol: receipt status, file bucket/path, `diagnoseReceiptPdfState`, bucket public=false ve download route auth sonucu.
- Müdahale: yetki problemi ile storage missing problemi ayrılır; cancelled donor download'ın kapalı olması beklenen davranıştır.
- Geri alma / restore: PDF metadata hazır ama object yoksa backup'tan dosya döndürülür veya admin PDF yenileme akışı yetkili onayla çalıştırılır.
- Son kontrol: admin download, donor ownership download, cancelled donor 403 ve audit log kontrol edilir.

### Payment Callback Tutarsızlığı

- Belirti: PayTR callback 400/500, amount/currency mismatch veya duplicate beklenmeyen status.
- İlk kontrol: `payment_provider_events`, `payment_events`, PayTR merchant panel callback kaydı ve Vercel function logs.
- Müdahale: online ödeme açıksa geçici olarak kapatılır; mevcut durumda production online açılmadığı için PayTR canlıya alma durdurulur.
- Geri alma / restore: yanlış status varsa mali/yönetim onayı olmadan elle paid yapılmaz; provider kanıtı ve DB event zinciriyle düzeltme planı hazırlanır.
- Son kontrol: duplicate callback idempotency, finalization sonucu, receipt/notification duplicate oluşmadığı ve audit notu.

### Storage Bucket Policy Hatası

- Belirti: private makbuz bucket public görünüyor, anon list/read başarılı veya admin upload indirme hataları artıyor.
- İlk kontrol: Supabase bucket public flag, storage policies, `npm run test:supabase`, negative harness staging sonucu.
- Müdahale: private bucket public olduysa acil incident kabul edilir; public erişim kapatılır, link/cache etkisi değerlendirilir.
- Geri alma / restore: policy migration veya dashboard ayarı geri alınır; gerekiyorsa dosya pathleri rotate edilir ve erişim logları incelenir.
- Son kontrol: anon download/list başarısız, admin/donor route yetkili çalışıyor, Security Advisor temiz.

## Incident Response Planı

### Site Tamamen Açılmıyor

- Vercel status, son deploy, build logs ve domain/DNS kontrol edilir.
- Önce son sağlıklı deployment'a rollback veya Vercel promote/rollback değerlendirilir.
- Supabase outage varsa public fallback sayfaları ve maintenance kararı değerlendirilir.
- Olay, başlangıç zamanı, etki ve alınan aksiyon release/incident notuna yazılır.

### Admin Panel Açılmıyor

- `/admin/giris`, auth callback, Supabase Auth ve role/profile kayıtları kontrol edilir.
- Public site etkilenmiyorsa donation mode değiştirilmez.
- Admin aksiyonları durdurulur; kritik içerik gerekiyorsa rollback veya env kontrolü yapılır.

### Form Spam Saldırısı

- Vercel logs, form security metadata, rate limit provider ve honeypot oranı incelenir.
- Upstash aktif değilse production kalıcı provider aktivasyonu için operasyon onayı alınır.
- Gerekirse `DONATION_MODE=disabled` veya ilgili form geçici olarak kapatılır; public write policy açılmaz.
- Turnstile production zorunlu açılmadan önce Preview QA kanıtı gerekir.

### Yanlış WhatsApp Numarası

- `DONATION_WHATSAPP_PHONE` doğrulanır.
- Vercel env düzeltilir ve yeni deploy alınır.
- `npm run smoke:production` ve manuel CTA kontrolü yapılır.
- Yanlış numara üzerinden gelen kullanıcı etkisi operasyon tarafından takip edilir.

### Bağış Butonu Ödeme Formuna Gidiyor

- `DONATION_MODE` değeri kontrol edilir; production tanıtım yayını için `whatsapp` olmalı.
- `/bagis-yap`, `/kurban/bagis`, `/yetim-hamiligi/basvuru` route'ları manuel kontrol edilir.
- Yanlışlıkla `online` ise acil env düzeltmesi ve redeploy yapılır.
- PayTR canlı ödeme açılmadıysa payment intent oluşup oluşmadığı DB'den kontrol edilir.

### Private Makbuz Public Görünür Oldu

- Acil güvenlik olayı kabul edilir.
- Bucket public=false yapılır, storage policies geri alınır.
- Erişim logları, etkilenen pathler ve cache etkisi incelenir.
- KVKK/hukuk sorumlusu bilgilendirilir; olay notu ve düzeltme kanıtı tutulur.

### PayTR Callback Hata Üretmeye Başladı

- Vercel function logs, PayTR panel callback denemeleri ve `payment_provider_events.processing_error` kontrol edilir.
- Hash/config hatası varsa online ödeme kapalı tutulur.
- Duplicate veya amount mismatch ise elle paid yapılmaz; provider kanıtı gerekir.
- Production online payment canlı değilse canlıya alma kararı ertelenir.

### Supabase RLS Warning Oluştu

- Security Advisor çıktısı ve ilgili migration diff incelenir.
- Public/anon policy genişlemesi varsa deploy no-go kabul edilir.
- RLS gevşetilmez; forward-fix migration ile daraltma yapılır.
- `npm run test:supabase` Security warning 0 dönene kadar release yapılmaz.

### Service Role Sızıntı Şüphesi

- Public bundle, logs, Git history ve Vercel env adları incelenir.
- Secret rotate edilir; eski key revoke edilir.
- Vercel/Supabase audit erişimleri gözden geçirilir.
- Olay KVKK/güvenlik sorumlusuna bildirilir ve postmortem yazılır.

### Depolama Limiti Doldu

- Supabase Storage kullanım ekranı, büyük objectler ve son uploadlar incelenir.
- Makbuz private dosyaları silinmez; saklama/imha politikası dışında müdahale yapılmaz.
- Public `project-media` optimize/cleanup adayları admin/yönetim onayıyla belirlenir.
- Kota artırımı veya lifecycle/backup stratejisi planlanır.

## Bakım Modu, Donation Mode ve PayTR Kapatma Kararları

- Site bakım moduna alınır: public site 500 veriyor, veri bütünlüğü riski var, yanlış migration yayında, auth/global routing ciddi bozuk veya private veri sızıntısı şüphesi var.
- Donation mode `disabled` yapılır: bağış CTA'ları yanlış yere gidiyor, WhatsApp hattı kullanılamıyor, form spam saldırısı kontrol dışı veya hukuki/onay metni kritik hatalı.
- Donation mode `whatsapp` yapılır: online ödeme hazır değil, PayTR/receipt/notification testleri eksik, operasyon manuel yönlendirme istiyor.
- PayTR online ödeme kapatılır: callback hash/config hatası, amount/currency mismatch, duplicate finalization şüphesi, mali onay eksikliği veya gerçek merchant test tamamlanmadı.

## Health Check / Smoke Script

`npm run smoke:production` yalnızca public HTTP route kontrolü yapar. Base URL için `PRODUCTION_SMOKE_BASE_URL` veya `NEXT_PUBLIC_SITE_URL` kullanır. Base URL yoksa güvenli şekilde SKIPPED döner.

Kontrol edilen rotalar:

- `/`
- `/hukuki`
- `/bagis-yap`
- `/kurban/bagis`
- `/yetim-hamiligi/basvuru`
- `/iletisim`
- `/gonullu-ol`
- `/robots.txt`
- `/sitemap.xml`

Script secret kullanmaz, write/delete yapmaz, Supabase DB veya Storage'a dokunmaz.

## Go / No-Go Kısa Kararı

Go için `docs/production-deployment-checklist.md` içindeki go/no-go bölümü tamamlanmalıdır. `Security warning`, missing table, public service role/secret, yanlış donation mode, public private bucket, anon admin erişimi veya PayTR canlı test tamamlanmadan online ödeme açılması no-go kabul edilir.

## Açık Operasyonel Maddeler

- Gerçek Vercel Preview Turnstile/Upstash QA external dashboard/env erişimi bekliyor.
- Bu QA tamamlanmadan production'da `TURNSTILE_ENABLED=true` zorunlu açılmayacak.
- Donation mode production tanıtım yayını için `whatsapp` kalacak.
- PayTR online ödeme ve canlı merchant flow ayrı onay/test aşaması olmadan açılmayacak.
