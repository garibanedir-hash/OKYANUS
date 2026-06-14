# Production Deployment Checklist

Bu liste Okyanus İnsani Yardım Derneği platformu production yayını öncesi son teknik ve operasyonel kontroller için hazırlanmıştır.

## Go / No-Go Kararı

Production deploy veya production env değişikliği için aşağıdaki şartlar release sorumlusu tarafından açıkça işaretlenmelidir.

Go şartları:

- [ ] `npm run lint` geçiyor.
- [ ] `npm run build` geçiyor.
- [ ] `npm run check:supabase-env` geçiyor.
- [ ] `npm run test:supabase` sonucu `Security warning: 0` ve `Missing table: 0`.
- [ ] `npm run audit:security` high seviyede temiz.
- [ ] Service role, Supabase secret, PayTR key/salt, Upstash token ve Turnstile secret public bundle'da yok.
- [ ] `DONATION_MODE` istenen modda; tanıtım production yayını için `whatsapp`.
- [ ] WhatsApp numarası doğru ve public kullanıma uygun.
- [ ] Hukuki sayfalar 200 dönüyor.
- [ ] Admin guard çalışıyor; anon `/admin` erişimi login'e yönleniyor.
- [ ] `receipts-private` ve `manual-receipts-private` protected/public=false.
- [ ] Son commit ve push tamam.

No-go şartları; aşağıdakilerden biri varsa deploy/env değişikliği durur:

- Missing table var.
- Security warning var.
- Service role/secret public bundle'da veya `NEXT_PUBLIC_` env altında.
- Donation mode yanlış.
- Private bucket public.
- Admin anon erişilebilir.
- `okyanusyardim.org` DNS çözmüyor veya Vercel production deployment'a bağlı değil.
- `NEXT_PUBLIC_SITE_URL` production domain dışında bir URL gösteriyor.
- Public rotalar bakım/tadilat sayfasına yönleniyor ve bu yayın planının parçası değil.
- Resmi WhatsApp numarası Vercel Production env içinde doğrulanmadı.
- Ödeme modu yanlışlıkla online.
- PayTR canlı merchant test ve mali/yönetim onayı tamamlanmadan online payment açılıyor.

## 16A Production Operations

- [ ] `docs/production-operations-runbook.md` teknik, operasyon, veri ve yönetim sorumluları tarafından gözden geçirildi.
- [ ] Günlük/haftalık/deploy sonrası monitoring checklist sahipleri atandı.
- [ ] Backup ve restore erişim sorumluları belirlendi.
- [ ] Incident response kararları, bakım modu ve donation mode kapatma koşulları kabul edildi.
- [ ] `npm run smoke:production` production veya preview base URL ile çalıştırıldı veya base URL yoksa kontrollü skip olarak not edildi.
- [ ] Vercel Preview Turnstile/Upstash QA açık operasyonel madde olarak kalıyorsa production `TURNSTILE_ENABLED=true` zorunlu açılmadı.

## 16B Tanıtım Modu Final QA

- [ ] `docs/promotion-launch-final-qa.md` tanıtım yayını öncesi son kontrol referansı olarak tamamlandı.
- [ ] Public rota listesi, WhatsApp yönlendirmeleri, hukuki linkler, SEO/metadata ve mobil kırılım kontrolleri gözden geçirildi.
- [ ] Production env için `SITE_MAINTENANCE_MODE=false`, `DONATION_MODE=whatsapp`, `NEXT_PUBLIC_SITE_URL=https://okyanusyardim.org`, `TURNSTILE_ENABLED=false`, `PAYTR_DEBUG_ON=false` ve `NEXT_PUBLIC_ADMIN_DEMO_MODE=false` doğrulandı.
- [ ] Production resmi WhatsApp numarası Vercel Production env içinde doğrulandı.
- [ ] `npm run smoke:production` gerçek base URL ile çalıştırıldı veya base URL yoksa güvenli skip olarak raporlandı.
- [ ] Public sayfalarda `demo`, `placeholder`, `lorem`, `TODO`, `staging`, `production`, `test`, `payment intent`, `PayTR test` ve `taslak` ifadeleri ziyaretçiye görünmüyor.

## 16C-Fix Domain, Env ve Bakım Modu

- [ ] Vercel Project > Settings > Domains içinde `okyanusyardim.org` eklendi.
- [ ] Vercel Project > Settings > Domains içinde `www.okyanusyardim.org` eklendi veya bilinçli olarak canonical redirect stratejisi dışında bırakıldı.
- [ ] DNS provider tarafında Vercel'in istediği A/CNAME kayıtları girildi.
- [ ] SSL aktif; `http://okyanusyardim.org` HTTPS'e yönleniyor.
- [ ] www/non-www stratejisi net: canonical domain `https://okyanusyardim.org`.
- [ ] Production env içinde `SITE_MAINTENANCE_MODE=false`.
- [ ] Production env içinde `DONATION_MODE=whatsapp`.
- [ ] Production env içinde `DONATION_WHATSAPP_PHONE=<resmi_whatsapp_numarası>`; resmi numara kesinleşmeden GO verilmez.
- [ ] Production env içinde `DONATION_WHATSAPP_MESSAGE=Merhaba, Okyanus İnsani Yardım Derneği bağış çalışmaları hakkında bilgi almak istiyorum.`
- [ ] Production env içinde `NEXT_PUBLIC_SITE_URL=https://okyanusyardim.org`.
- [ ] Production env içinde `TURNSTILE_ENABLED=false`.
- [ ] Production env içinde `RATE_LIMIT_PROVIDER=memory` veya onaylı kalıcı provider değeri.
- [ ] Production env içinde `PAYTR_DEBUG_ON=false`.
- [ ] Production env içinde `NEXT_PUBLIC_ADMIN_DEMO_MODE=false`.
- [ ] Env değişikliği sonrası yeni production deploy veya promote alındı; eski build'in env cache'i kullanılmıyor.
- [ ] `/tadilat` yönlendirmesi görülürse olası sebepler kontrol edildi: `SITE_MAINTENANCE_MODE=true`, yanlış production env, domainin başka deployment/project'e bağlı olması, middleware/bakım guard env okuma sorunu, env güncellemesi sonrası redeploy yapılmaması veya yanlış domain üzerinden test.

## 16D Canlı Domain Smoke ve Go/No-Go

- [ ] Canlı smoke şu komutla çalıştırıldı:

```bash
PRODUCTION_SMOKE_BASE_URL=https://okyanusyardim.org PRODUCTION_SMOKE_EXPECTED_WHATSAPP_PHONE=<resmi_whatsapp_numarası> npm run smoke:production
```

- [ ] Public rotalar 200: `/`, `/hakkimizda`, `/projeler`, `/projeler/bir-koli-bir-umut`, `/faaliyetler`, `/kurban`, `/kurban/bagis`, `/yetim-hamiligi`, `/yetim-hamiligi/basvuru`, `/bagis-yap`, `/gonullu-ol`, `/iletisim`, `/seffaflik`, `/faaliyet-raporlari`, `/hukuki`.
- [ ] `/admin` anonim kullanıcıyı `/admin/giris` rotasına yönlendiriyor.
- [ ] `/robots.txt` ve `/sitemap.xml` 200 dönüyor.
- [ ] `/bagis-yap`, `/kurban/bagis`, `/yetim-hamiligi/basvuru` ve proje detay CTA'ları WhatsApp modu sinyali gösteriyor.
- [ ] Online payment form, PayTR iframe veya payment intent sinyali görünmüyor.
- [ ] Header, footer, hukuki linkler ve KVKK/Gizlilik linkleri canlı domain üzerinde kontrol edildi.
- [ ] Mobil kırılımlar canlıda kontrol edildi: 390px, 768px, 1024px, 1440px.
- [ ] Admin sidebar polish canlıda kontrol edildi: kapalı gruplar kompakt, açık grup item/badge hizası düzgün, horizontal scroll yok.

## Vercel ve Environment

- [ ] Vercel project doğru GitHub repository ile bağlı.
- [ ] `NEXT_PUBLIC_SUPABASE_URL` tanımlandı.
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` veya `NEXT_PUBLIC_SUPABASE_ANON_KEY` tanımlandı.
- [ ] `SUPABASE_SECRET_KEY` veya `SUPABASE_SERVICE_ROLE_KEY` yalnızca server environment olarak tanımlandı.
- [ ] `NEXT_PUBLIC_ADMIN_DEMO_MODE=false` production öncesi değerlendirildi.
- [ ] Production'da `NEXT_PUBLIC_ADMIN_DEMO_MODE=true` yanlışlıkla verilse bile demo bypass'ın etkisiz kaldığı doğrulandı.
- [ ] `SITE_MAINTENANCE_MODE` yayın stratejisine göre ayarlandı.
- [ ] `MAINTENANCE_BYPASS_TOKEN` gerekiyorsa güvenli şekilde tanımlandı.
- [ ] `DONATION_MODE` (`online` / `whatsapp` / `disabled`) yayın stratejisine göre ayarlandı.
- [ ] `DONATION_MODE=whatsapp` kullanılacaksa `DONATION_WHATSAPP_PHONE` ve mesaj metni doğrulandı.
- [ ] Tanıtım modunun bakım modundan farklı olduğu; siteyi kapatmadan yalnızca public bağış CTA'larını yönlendirdiği doğrulandı.

## Migration ve Supabase

- [ ] Migration dosyaları staging ortamında sırayla test edildi.
- [ ] Seed data yalnızca staging/demo ortamında çalıştırıldı.
- [ ] RLS policy testleri bağışçı, gönüllü, koordinatör, personel ve admin rolleriyle doğrulandı.
- [ ] Storage bucket policy'leri test edildi.
- [ ] İlk Super Admin hesabı güvenli şekilde oluşturuldu.
- [ ] Staging test kullanıcıları production verisi veya gerçek kişi bilgisi içermiyor.
- [ ] Test kullanıcıları production öncesi silindi veya devre dışı bırakıldı.
- [ ] Public içerik tabloları (`projects`, `news_posts`, `reports`) read-only olarak doğrulandı.
- [ ] Hassas tablolar public read-only entegrasyona dahil edilmedi.
- [ ] `010_qurban_module.sql` staging ortamında çalıştırıldı ve kurban RLS policy'leri test edildi.
- [ ] Kurban modülünde public/anon yalnızca aktif kampanyaları okuyabiliyor.
- [ ] Kurban siparişi, vekalet, hisse, operasyon, bildirim ve export tabloları public erişime kapalı.
- [ ] `012_orphan_sponsorship_module.sql` staging ortamında çalıştırıldı ve yetim hamiliği RLS policy'leri test edildi.
- [ ] `013_orphan_sponsorship_application_flow.sql` staging ortamında çalıştırıldı ve başvuru/eşleştirme RLS policy'leri test edildi.
- [ ] Yetim hamiliği modülünde public/anon yalnızca aktif sponsorluk programlarını okuyabiliyor.
- [ ] Yetim profilleri, sponsorluklar, başvurular, eşleştirmeler, durum logları, ödeme hazırlığı, notlar, görevler, bildirimler ve export tabloları public erişime kapalı.
- [ ] `014_common_payment_receipt_notification_infrastructure.sql` staging ortamında çalıştırıldı ve ortak ödeme RLS policy'leri test edildi.
- [ ] `015_fix_sponsored_orphans_safe_view_security.sql` staging ortamında çalıştırıldı.
- [ ] Ödeme niyetleri, eventler, provider eventleri, makbuzlar, bildirim kuyruğu ve ödeme durum logları public/anon erişime kapalı.
- [ ] `sponsored_orphans_safe_view` `security_invoker = true` ve anon erişime kapalı.

## Auth ve Route Guard

- [ ] Admin auth aktif.
- [ ] `/admin/giris` hariç admin route'ları korunuyor.
- [ ] `/panel` account type kontrolüyle korunuyor.
- [ ] `/koordinator` assignment kapsamıyla korunuyor.
- [ ] `/personel` yalnızca kendi verisini gösteriyor.
- [ ] Demo paneller production öncesi kapatıldı veya auth ile korundu.
- [ ] `NEXT_PUBLIC_ADMIN_DEMO_MODE=false` production ortamında doğrulandı.
- [ ] `/giris`, `/kayit`, `/admin/giris` dışındaki korumalı paneller oturumsuz erişimde login sayfasına yönleniyor.
- [ ] Bilinmeyen veya yetkisiz rol güvenli fallback ile panele alınmıyor.
- [ ] İlk Super Admin hesabı oluşturuldu ve audit/security sorumlusu tarafından doğrulandı.
- [ ] Test kullanıcı şifreleri `.env.local`/staging secret dışında hiçbir yere yazılmadı.
- [ ] Metadata tek başına güvenlik kaynağı olarak kullanılmıyor; server guard + RLS asıl sınır.
- [ ] Her rol kendi paneliyle sınırlı ve yasaklı paneller manuel checklist ile doğrulandı.

## Read-only Public Data

- [ ] Supabase env yokken public sayfalar mock fallback ile build oluyor.
- [ ] Supabase hata/timeout durumunda public sayfalar beyaz ekran vermiyor.
- [ ] Supabase başarılı ama public içerik boşsa empty state gösteriliyor.
- [ ] Admin içerik listelerinde sadece read-only veri gösteriliyor; CRUD butonları demo kalıyor.
- [ ] Dashboard gerçek bağış/gönüllü/mesaj/görev verisine bağlanmadı; yalnızca public içerik sayaçları okundu.
- [ ] Repository hata logları secret/key/token/şifre içermiyor.

## Admin Public İçerik CRUD

- [ ] `009_admin_content_crud_policies.sql` staging ortamında uygulanıp test edildi.
- [ ] Proje/haber/rapor create/update/archive işlemleri sadece admin/super_admin hesabıyla çalışıyor.
- [ ] Public/anon insert/update/delete policy açılmadı.
- [ ] Hassas operasyonel tablolara write policy eklenmedi.
- [ ] Hard delete kullanılmıyor; arşivleme status update ile yapılıyor.
- [ ] Audit log helper create/update/archive işlemlerinde best-effort çalışıyor.
- [ ] CRUD formları server-side validation hatalarını kullanıcı dostu gösteriyor.
- [ ] Production öncesi gerçek admin hesabıyla staging smoke/manual CRUD testi yapıldı.

## Kurban Çalışmaları

- [ ] Public `/kurban`, `/kurban/[slug]` ve `/kurban/bagis` sayfaları ödeme öncesi başvuru akışıyla doğrulandı.
- [ ] `011_qurban_order_flow.sql` staging ortamında uygulandı.
- [ ] `/kurban/bagis` ödeme öncesi başvuru, vekalet kabulü ve hisse rezervasyonu oluşturuyor.
- [ ] `/kurban/bagis` gerçek online ödeme, makbuz veya bildirim üretmiyor.
- [ ] Vekalet/KVKK checkbox olmadan başvuru oluşturulamıyor.
- [ ] Başarı ekranı sipariş no, vekalet kaydı, "Ödeme bekleniyor" durumu ve admin kayıt notu gösteriyor.
- [ ] `qurban_campaigns.quota_reserved` kontenjan aşımı olmadan artıyor.
- [ ] Vekalet metni dernek yönetimi, hukuk danışmanı ve dini danışman tarafından onaylandı.
- [ ] Guest kurban başvurularının donor panelinde otomatik görünmeyeceği biliniyor ve destek süreci planlandı.
- [ ] Bağışçı `/panel/kurbanlarim` yalnızca kendi kurban durumlarını görebiliyor.
- [ ] Koordinatör `/koordinator/kurban-operasyon` yalnızca atanmış operasyonları görebiliyor.
- [ ] Personel `/personel/kurban-gorevleri` yalnızca atanmış görevleri görebiliyor.
- [ ] Kurban export kişisel veri maskeleme varsayılan açık şekilde test edildi.
- [ ] Gerçek ödeme/SMS/e-posta/makbuz entegrasyonları ayrı güvenlik testinden geçmeden açılmadı.
- [ ] Kurban smoke test kapsamı `qurban_campaigns` public, diğer kurban tabloları protected olacak şekilde geçti.
- [ ] `docs/qurban-manual-test-checklist.md` staging ortamında tamamlandı.
- [ ] 9D ödeme entegrasyonu için webhook signature, idempotency, server-side tutar doğrulama ve quota release planı hazır.

## Yetim Hamiliği

- [ ] Public `/yetim-hamiligi`, `/yetim-hamiligi/surec` ve `/yetim-hamiligi/basvuru` sayfaları açılıyor.
- [ ] `/yetim-hamiligi/basvuru` server action ile başvuru kaydı oluşturuyor; gerçek ödeme, düzenli talimat veya otomatik sponsorship aktivasyonu yapmıyor.
- [ ] KVKK onayı olmadan yetim hamiliği başvurusu oluşturulmuyor.
- [ ] Girişli sponsor başvurusu panel takibi için `sponsor_account_id` ile ilişkilendiriliyor.
- [ ] Misafir başvuruların panelde otomatik görünmeyeceği operasyon ekibi tarafından biliniyor.
- [ ] Admin `/admin/yetim-hamiligi` ve alt ekranları maskeli/read-only çalışıyor.
- [ ] Admin `/admin/yetim-hamiligi/basvurular/[id]/eslestir` eşleştirme action'ı yalnızca admin/super_admin hesabıyla çalışıyor.
- [ ] Eşleştirme sonrası `sponsorships`, `sponsorship_matches`, `sponsorship_status_logs` ve `orphan_profiles.status` staging'de doğrulandı.
- [ ] Bağışçı `/panel/yetim-sponsorluk` yalnızca kendi güvenli sponsorluk özetlerini gösteriyor.
- [ ] Koordinatör `/koordinator/yetim-sponsorluk` yalnızca atanmış görev mantığını gösteriyor.
- [ ] Personel `/personel/yetim-gorevleri` yalnızca atanmış görev mantığını gösteriyor.
- [ ] Çocuk açık kimliği, açık adres, okul adı, telefon, aile detayı ve hassas sağlık verisi public/admin olmayan panel görünümünde yok.
- [ ] Fotoğraf kullanımı açık rıza ve kurum politikası olmadan açılmadı.
- [ ] Yetim hamiliği metinleri hukuk danışmanı, kurum yönetimi ve çocuk koruma ilkeleri açısından incelendi.
- [ ] Gerçek ödeme/SMS/e-posta/makbuz/dosya entegrasyonları ayrı güvenlik testinden geçmeden açılmadı.
- [ ] Yetim hamiliği smoke test kapsamı `sponsorship_programs` public, hassas yetim tabloları protected olacak şekilde geçti.

## Ortak Ödeme, Makbuz ve Bildirim

- [ ] `/admin/odeme-kayitlari` ortak `payment_intents` read-only ekranı olarak çalışıyor.
- [ ] `/admin/makbuzlar` ortak `receipts` read-only ekranı olarak çalışıyor.
- [ ] `/admin/bildirim-kuyrugu` ortak `notification_queue` read-only ekranı olarak çalışıyor.
- [ ] Supabase env/RLS/migration eksikse bu ekranlar mock fallback ile beyaz ekran vermeden açılıyor.
- [ ] `paymentWriteRepository` server-only kalıyor; service role client tarafına taşınmıyor.
- [ ] Genel bağış, kurban ve yetim ekranları gerçek ödeme yapılmadığını açıkça belirtiyor.
- [ ] Payment provider API çağrısı, canlı webhook endpoint'i, PDF makbuz üretimi ve gerçek SMS/e-posta gönderimi production'a açılmadı.
- [ ] Kart numarası, CVV, banka şifresi veya hassas payment payload saklanmıyor.
- [ ] 10. aşama öncesi provider signature doğrulama, idempotency ve paid finalization planı tamamlandı.
- [ ] `docs/payment-security-stabilization-checklist.md` Security Advisor ve env kontrolü için tamamlandı.
- [ ] `docs/payment-manual-test-checklist.md` staging manuel testinde tamamlandı.
- [ ] PDF makbuz için private storage, erişim yetkisi, dosya silme ve audit planı hazır olmadan production'a açılmadı.
- [ ] Bildirim provider credential, retry, rate limit ve opt-out/KVKK planı hazır olmadan production'a açılmadı.
- [ ] PayTR test credential değerleri Vercel Preview/Staging env içinde server-only tanımlı.
- [ ] PayTR Production env değerleri test onayı ve sözleşme tamamlanmadan eklenmedi.
- [ ] PayTR Merchant Panel Bildirim URL `https://domain.com/api/paytr/callback` olarak doğrulandı.
- [ ] PayTR ok/fail sayfalarının onay/iptal yapmadığı test edildi.
- [ ] Duplicate callback ve hash doğrulama senaryoları production geçişinden önce test edildi.
- [ ] `PAYTR_TEST_MODE=false` yalnızca yönetim, teknik sorumlu ve hukuk/mali süreç onayıyla açılacak.
- [ ] Genel bağış, kurban ve yetim payment intent başlatma akışları staging'de test edildi.
- [ ] `DONATION_MODE=whatsapp` ile `/bagis-yap`, `/kurban/bagis` ve `/yetim-hamiligi/basvuru` form göstermeden WhatsApp bilgilendirme kartı gösteriyor.
- [ ] `DONATION_MODE=disabled` ile bağış form sayfaları geçici kapalı mesajı gösteriyor ve site geneli açık kalıyor.
- [ ] `DONATION_MODE=online` ile mevcut bağış/kurban/yetim online akışları geri geliyor.
- [ ] PayTR env eksikken güvenli hata sayfası doğrulandı.
- [ ] Paid callback sonrası kurban/sponsorluk sınırlı status update sonuçları staging'de kontrol edildi.
- [ ] Kurban quota_completed ve failed/cancelled quota release işlemleri 10C transaction planı olmadan production'a açılmadı.
- [ ] `016_payment_finalization_and_context_state.sql` staging ortamında çalıştırıldı.
- [ ] PayTR callback replay testi `docs/paytr-callback-idempotency-test.md` ile tamamlandı.
- [ ] Callback tutar/para birimi uyuşmazlığı paid finalization çalıştırmıyor.
- [ ] Kurban paid callback sonrası `quota_reserved` azalıyor ve `quota_completed` yalnızca bir kez artıyor.
- [ ] Kurban failed/cancelled callback sonrası reserved quota serbest kalıyor.
- [ ] Yetim paid callback sonrası `last_payment_date` ve `next_payment_date` doğru set ediliyor.
- [ ] Duplicate callback sponsorluk `next_payment_date` değerini ikinci kez ötelemiyor.
- [ ] Receipt/notification duplicate oluşmadığı staging'de doğrulandı.
- [ ] Canlı PayTR açmadan önce gerçek PDF makbuz, gerçek bildirim gönderimi ve muhasebe süreci ayrı onaydan geçti.
- [ ] `017_receipt_pdf_private_storage.sql` staging ortamında çalıştırıldı.
- [ ] `receipts-private` bucket public değil.
- [ ] Admin PDF hazırlama akışı paid receipt için çalışıyor.
- [ ] Donor kendi makbuzunu açabiliyor, başka donor ve anon açamıyor.
- [ ] Makbuz PDF içinde hassas ödeme/provider bilgisi yok.
- [ ] PDF metni, belge statüsü ve issued/onay süreci yönetim ve mali müşavir tarafından onaylandı.
- [ ] PDF dosya saklama ve imha politikası KVKK kapsamında tanımlandı.
- [ ] Makbuz PDF yeniden oluşturma v2/v3 versioning ile eski dosyaları koruyor.
- [ ] Issued makbuz için yeniden oluşturma gerekçesi zorunlu.
- [ ] Makbuz iptali gerekçeli ve audit log kayıtlı.
- [ ] Cancelled makbuz donor download'a kapalı, admin/super_admin erişimi yetki kontrollü.
- [ ] `018_manual_physical_receipts.sql` staging ortamında çalıştırıldı.
- [ ] `manual-receipts-private` bucket public değil.
- [ ] Manuel makbuz liste/oluştur/detay/düzenle/yazdır/PDF download akışları admin hesabıyla test edildi.
- [ ] Manuel makbuz seri/sıra/koçan kullanımı yönetim ve mali müşavir tarafından onaylandı.
- [ ] Manuel makbuz iptal, arşiv ve saklama süresi politikası KVKK/hukuk kapsamında onaylandı.
- [ ] `020_project_activities.sql` staging ortamında çalıştırıldı.
- [ ] Proje faaliyetleri admin ekranlarında oluşturma/düzenleme/durum/görünürlük/iptal/arşiv akışları test edildi.
- [ ] Public proje detay sayfasında yalnızca `completed/public` faaliyetler yayınlandı.
- [ ] Internal faaliyetler ve iç notlar public kullanıcıyla görünmüyor.
- [ ] `project_activities` anon write kapalı, `project_activity_events` protected.
- [ ] Public proje haritasında Gazze, Lübnan, Mısır ve Türkiye bölgeleri doğru görünüyor.
- [ ] Bölge/proje fallback datası production içerik stratejisiyle uyumlu hale getirildi.
- [ ] Harita API key veya üçüncü taraf harita servisi gerektirmiyor.
- [ ] `021_project_regions_and_project_region_fields.sql` staging ortamında çalıştırıldı.
- [ ] Admin panelde `/admin/proje-bolgeleri` üzerinden bölge oluşturma/düzenleme ve public/internal görünürlük test edildi.
- [ ] Proje oluşturma/düzenleme formlarında `region_slug` seçimi kaydediliyor.
- [ ] Public harita Supabase `project_regions` datasını kullanıyor; fallback yalnızca veri yoksa devreye giriyor.
- [ ] Harita altındaki bölge projeleri ve son saha faaliyetleri public kullanıcıda boş blok oluşturmuyor.
- [ ] `022_project_visual_fields.sql` staging ortamında çalıştırıldı.
- [ ] Admin bölge formunda ülke/şehir seçimi koordinatı otomatik dolduruyor; admin enlem/boylam yazmak zorunda kalmıyor.
- [ ] `023_project_media_storage.sql` staging ortamında çalıştırıldı.
- [ ] `project-media` bucket public read, 5 MB limit ve JPG/PNG/WebP MIME sınırıyla doğrulandı.
- [ ] Next.js Server Action upload taşıma limiti `next.config.mjs` içinde 10 MB; uygulama ve bucket görsel kabul limiti 5 MB olarak doğrulandı.
- [ ] Proje, bölge ve faaliyet görsel upload formları admin hesabıyla test edildi.
- [ ] Proje kapak ve thumbnail görselleri admin panelden dosya seçilerek yükleniyor ve public kart/detay görsellerinde görünüyor.

## Veri Güvenliği ve KVKK

- [ ] Çocuk/sponsorluk verileri maskeli ve sınırlı görünüyor.
- [ ] Bağışçı ve gönüllü kişisel verileri rol bazlı korunuyor.
- [ ] Sponsor yalnızca kendi sponsorluk kayıtlarını görebiliyor.
- [ ] Personel yalnızca kendi görev ve mesajlarını görebiliyor.
- [ ] Koordinatör yalnızca kendi ekip/faaliyet kapsamını görebiliyor.
- [ ] KVKK/hukuk danışmanı yasal metinleri kontrol etti.
- [ ] Veri saklama ve imha politikası belirlendi.

## 14A Hukuki Metinler ve Public Form Onayları

- [ ] `/hukuki` ve `/hukuki/[slug]` sayfaları KVKK Aydınlatma Metni, Açık Rıza Metni, Gizlilik Politikası, Çerez Politikası, Bağış Bilgilendirme ve Şartları, Gönüllü Başvuru Aydınlatma Metni, İletişim Formu Aydınlatma Metni, Kullanım Şartları ve Mesafeli Bağış / Online Ödeme Bilgilendirmesi başlıklarını gösteriyor.
- [ ] Hukuki metinler hukukçu kontrolüne sunuldu; kesin hukuki uygunluk iddiası production metinlerinde kullanılmıyor.
- [ ] Resmi dernek adresi, sicil bilgileri, yetkili iletişim bilgileri ve varsa MERSİS/dernek sicil alanları nihai hukukçu/yönetim kontrolünde tamamlandı.
- [ ] KVKK Aydınlatma Metni ile Açık Rıza Metni ayrı sayfalarda ve formlarda ayrı beyanlarla kullanılıyor.
- [ ] İletişim, gönüllü, bağış, kurban, yetim hamiliği ve kayıt formlarında zorunlu aydınlatma okuma beyanı ile opsiyonel açık rıza/duyuru izni ayrıldı.
- [ ] Çerez Politikası, analitik veya pazarlama aracı eklendiğinde güncellenecek şekilde kontrol edildi.
- [ ] Online ödeme aktif edilmeden önce Bağış Bilgilendirme ve Şartları ile Mesafeli Bağış / Online Ödeme Bilgilendirmesi yeniden gözden geçirildi.
- [ ] `DONATION_MODE=whatsapp` modunda WhatsApp hukuki notu kısa, anlaşılır ve KVKK/Gizlilik linkleriyle görünüyor.
- [ ] Footer hukuki linkleri `/hukuki/...` rotalarına gidiyor ve eski tekil hukuki URL'ler yeni sayfalara yönleniyor.

## 14B Çerez Tercihleri ve Onay Kayıt İzlenebilirliği

- [ ] `024_legal_consent_and_cookie_preferences.sql` staging ortamında çalıştırıldı.
- [ ] `contact_messages`, `volunteer_applications`, `payment_intents`, `qurban_orders` ve `sponsorship_applications` consent kolonlarını içeriyor.
- [ ] `site_cookie_consents` tablosu RLS enabled/forced ve anon/public erişime kapalı.
- [ ] Çerez tercih banner'ı ilk public ziyarette görünüyor; zorunlu, işlevsel, analitik ve pazarlama kategorileri ayrılıyor.
- [ ] Çerez tercihleri yalnızca tarayıcıda local/cookie kaydıyla saklanıyor; ilk sürümde public DB write açılmadı.
- [ ] Footer'daki “Çerez Tercihlerimi Yönet” butonu modalı açıyor.
- [ ] İletişim ve gönüllü formları server action üzerinden kayıt oluşturuyor ve consent timestamp/version/user-agent alanlarını yazıyor.
- [ ] Bağış, kurban, yetim hamiliği ve kayıt akışları aydınlatma, açık rıza ve duyuru iznini ayrı alanlar olarak gönderiyor.
- [ ] Hukuki metin sürümü değişirse `LEGAL_CONSENT_VERSION` ve gerekiyorsa cookie consent sürümü güncelleniyor.
- [ ] Analitik/pazarlama aracı eklenmeden önce Çerez Politikası, tercih paneli ve hukuki kontrol tekrar yapılıyor.
- [ ] 14C final kontrol için `docs/legal-final-review-checklist.md` tamamlandı.
- [ ] 024 migration sonrası `npm run test:supabase` sonucu `site_cookie_consents` missing uyarısı vermiyor.
- [ ] Staging'de iletişim ve gönüllü formu kontrollü test kaydıyla consent alanlarını dolduruyor.

## 15A Production Security Hardening

- [ ] `docs/production-security-hardening.md` production yayını öncesi teknik sorumlu tarafından kapatıldı.
- [ ] `next.config.mjs` temel security header'larını uyguluyor: nosniff, strict referrer policy, frame policy ve minimal permissions policy.
- [ ] Tam Content-Security-Policy ayrı bir staging test aşamasına bırakıldı; Supabase Storage, WhatsApp, Vercel ve Next/Image kaynaklarıyla kırılma riski değerlendirildi.
- [ ] `.env.example` production-safe varsayımları gösteriyor; gerçek secret değerler yalnızca Vercel/Supabase secret yönetiminde tutuluyor.
- [ ] Production Vercel env içinde `NEXT_PUBLIC_ADMIN_DEMO_MODE=false`, `DONATION_MODE=whatsapp`, `PAYTR_DEBUG_ON=false`, doğru `NEXT_PUBLIC_SITE_URL` ve doğrulanmış WhatsApp hattı var.
- [ ] Supabase service role/secret key public bundle'a veya `NEXT_PUBLIC_` env adlarına taşınmadı.
- [ ] Build sonrası `.next/static` secret/env adı taraması temiz.
- [ ] `npm run test:supabase` storage kontrolü dahil `Security warning: 0` veriyor.
- [ ] `project-media` public read, JPG/PNG/WebP ve 5 MB sınırıyla doğrulandı; anon upload kapalı.
- [ ] `receipts-private` ve `manual-receipts-private` private/public=false ve anon read/write kapalı olarak Dashboard'da doğrulandı.
- [ ] `/admin`, `/panel`, `/koordinator`, `/personel` oturumsuz erişimde güvenli login yönlendirmesi veriyor.
- [ ] `/api/receipts/[receiptNo]/download` ve `/api/manual-receipts/[receiptNo]/download` anon erişimde dosya döndürmüyor.
- [ ] `/bagis-yap`, `/kurban/bagis`, `/yetim-hamiligi/basvuru` WhatsApp modunda form/payment intent başlatmadan bilgilendirme kartı gösteriyor.
- [ ] PayTR callback hash, tutar/para birimi ve idempotency kontrolü canlı ödeme açılmadan önce staging senaryolarıyla tekrar doğrulanacak.
- [ ] Public form rate limit/captcha eksikliği kalan production riski olarak takip edildi.

## 15B Public Form Spam Koruması

- [ ] `docs/form-spam-protection.md` production yayını öncesi teknik sorumlu tarafından kapatıldı.
- [ ] Public formlar ortak honeypot ve `formStartedAt` hidden alanlarını render ediyor.
- [ ] İletişim ve gönüllü formlarında honeypot doluyken DB kaydı oluşmadığı staging'de doğrulandı.
- [ ] Kayıt formunda honeypot/rate limit kontrolü Supabase Auth signup çağrısından önce çalışıyor.
- [ ] Genel bağış, kurban ve yetim action'ları online mode dışında payment/order/application write başlatmıyor.
- [ ] Server-side input validation çok uzun mesaj, geçersiz e-posta/telefon ve geçersiz sayısal alanları DB öncesi reddediyor.
- [ ] Consent kayıtları `consent_metadata.formSecurity` ile form güvenlik metadata'sını taşıyor.
- [ ] In-memory rate limitin production için best-effort olduğu ve kalıcı Redis/KV provider ihtiyacının takip edildiği biliniyor.
- [ ] Turnstile/Captcha entegrasyonu spam artışı halinde ayrı aşama olarak planlandı.
- [ ] Anon write negatif testleri yalnızca staging ve cleanup planıyla yapılacak.

## 15C Rate Limit Provider ve Turnstile Pilot

- [ ] `.env.example` `TURNSTILE_ENABLED`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY` ve `TURNSTILE_SECRET_KEY` alanlarını içeriyor.
- [ ] Production'da Turnstile anahtarları provision edilmeden `TURNSTILE_ENABLED=false` kalıyor.
- [ ] Turnstile pilotu açılacaksa önce Vercel Preview/Staging env'de site key ve secret key tanımlanıyor.
- [ ] `TURNSTILE_SECRET_KEY` yalnızca server environment olarak tanımlı; `NEXT_PUBLIC_` altında secret yok.
- [ ] Turnstile aktif edilirse `/iletisim`, `/gonullu-ol`, `/kayit` ve online donation formları gerçek tarayıcıda tokenlı/tokensız test ediliyor.
- [ ] Kalıcı rate limit provider seçimi yapılmadan in-memory limitin yalnızca best-effort olduğu production risk notunda kalıyor.
- [ ] Vercel KV veya Upstash Redis seçilecekse preview/production ayrımı, hash/fingerprint retention ve KVKK veri minimizasyonu ayrıca onaylanıyor.
- [ ] `npm run test:security:negative` production env'de çalıştırılmıyor; staging için project ref allowlist ve cleanup planı zorunlu.
- [ ] Negatif test harness çıktısında security warning varsa production deploy durduruluyor.
- [ ] Smoke test read-only kalıyor; write negatif testleri ayrı komut ve ayrı onayla yönetiliyor.

## 15D Turnstile Staging Pilot ve Rate Limit Kararı

- [ ] Cloudflare test key'leriyle `TURNSTILE_ENABLED=true` pilotunda `/iletisim`, `/gonullu-ol` ve `/kayit` widget render ediyor.
- [ ] Token yok ve fail-secret senaryoları DB write oluşturmadan genel hata veriyor.
- [ ] Pass-secret senaryosu submit akışına devam ediyor; oluşan test kayıtları temizleniyor.
- [ ] Gerçek Vercel Preview/Staging Turnstile key'leri tanımlanmadan production'da `TURNSTILE_ENABLED=true` yapılmıyor.
- [ ] CSP eklenecekse `https://challenges.cloudflare.com` script/frame kaynağı staging'de doğrulanıyor.
- [ ] Negative security harness staging allowlist ve staging/preview/test `NEXT_PUBLIC_SITE_URL` olmadan çalışmıyor.
- [ ] Current/default ortamda `npm run test:security:negative` write/delete yapmadan skip veya guard sonucu veriyor.
- [ ] Kalıcı rate limit provider önerisi Upstash Redis olarak kabul edildi; 15E provider entegrasyonu tamamlandı, ancak gerçek Upstash env tanımlanmadan memory fallback tek başına production güvence sayılmıyor.

## 15E Upstash Redis, Preview Turnstile QA ve Staging Negative Test

- [ ] `RATE_LIMIT_PROVIDER=memory`, `UPSTASH_REDIS_REST_URL` ve `UPSTASH_REDIS_REST_TOKEN` env alanları tanımlı; gerçek token değerleri yalnızca Vercel server env'de tutuluyor.
- [ ] Production için önerilen ayar `RATE_LIMIT_PROVIDER=upstash`; Upstash staging ve production token/URL değerleri birbirinden ayrı tutuluyor.
- [ ] Upstash env eksikse veya provider erişilemezse memory fallback çalışıyor, ancak bu durum production için kalıcı güvence kabul edilmiyor.
- [ ] Vercel Preview ortamında `TURNSTILE_ENABLED=true`, Cloudflare staging site key/secret key ve gerekirse Upstash staging env değerleriyle browser QA tamamlandı.
- [ ] Preview QA'da `/iletisim`, `/gonullu-ol` ve `/kayit` için widget render, token yok, geçersiz token, başarılı token, honeypot ve KVKK/consent senaryoları doğrulandı.
- [ ] Preview QA sırasında oluşan test iletişim/gönüllü/kayıt kayıtları temizlendi veya test kaydı olarak işaretlendi.
- [ ] `npm run test:security:negative` yalnızca staging allowlist project ref ve staging/preview `NEXT_PUBLIC_SITE_URL` ile çalıştırıldı; production DB üzerinde negatif write/delete testi yapılmadı.
- [ ] Negative harness çıktısında hassas tablo/bucket anon read/write/delete başarılı sonucu yok; varsa production deploy durduruldu.
- [ ] Build sonrası `.next/static` secret scan `UPSTASH_REDIS_REST_TOKEN`, `TURNSTILE_SECRET_KEY`, Supabase service role ve PayTR secret env adları için temiz.
- [ ] Tam CSP eklenmeden önce `https://challenges.cloudflare.com` kaynakları Turnstile Preview QA ile uyumlu olacak şekilde ayrıca test edilecek.

## 15F Preview Security QA Kapanışı

- [ ] Vercel Preview env şu değerlerle hazırlanıyor: `TURNSTILE_ENABLED=true`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `RATE_LIMIT_PROVIDER=upstash`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `DONATION_MODE=whatsapp`, `SITE_MAINTENANCE_MODE=false`, `NEXT_PUBLIC_SITE_URL=<preview-url>`.
- [ ] Preview ve production Upstash/Turnstile secret değerleri ayrı tutuluyor; staging token production'a, production token preview'a karıştırılmıyor.
- [ ] `npm run check:supabase-env` Preview/Production veya `REQUIRE_STRICT_PREVIEW_SECURITY_ENV=true` modunda eksik Turnstile/Upstash env değerlerinde fail veriyor.
- [ ] Yeni Preview deploy build'i geçiyor ve Preview URL erişilebilir durumda.
- [ ] `/iletisim`, `/gonullu-ol` ve `/kayit` gerçek tarayıcıda Turnstile widget, token yok/geçersiz/başarılı token ve KVKK/consent senaryolarıyla doğrulandı.
- [ ] Upstash staging rate limit aynı fingerprint/context için limit aşımında DB write öncesi kullanıcı dostu hata veriyor.
- [ ] `/bagis-yap`, `/kurban/bagis` ve `/yetim-hamiligi/basvuru` Preview'da `DONATION_MODE=whatsapp` davranışını koruyor.
- [ ] Staging negative security harness allowlist project ref ile çalıştırıldı; production DB üzerinde negatif write/delete yapılmadı.
- [ ] Public bundle secret scan Preview build sonrası temiz.
- [ ] Bu checklist maddeleri tamamlanmadan production'da `TURNSTILE_ENABLED=true` zorunlu hale getirilmiyor.

## 15G Gerçek Preview/Staging Kapanışı

- [ ] Vercel Dashboard veya CLI erişimi olan yetkili kullanıcı Preview env değerlerini girdi.
- [ ] Yeni Preview deploy alındı; Preview URL raporda açıkça belirtildi.
- [ ] Preview route kontrolü yapıldı: `/`, `/iletisim`, `/gonullu-ol`, `/kayit`, `/bagis-yap`, `/kurban/bagis`, `/yetim-hamiligi/basvuru`, `/hukuki`, `/robots.txt`, `/sitemap.xml`.
- [ ] `DONATION_MODE=whatsapp` Preview üzerinde korundu; online ödeme formu veya payment intent başlatma akışı görünmedi.
- [ ] Turnstile gerçek browser QA sonucu kaydedildi: widget render, token yok, geçersiz token, başarılı token.
- [ ] Upstash staging rate limit sonucu kaydedildi; limit aşımı DB write öncesi genel hata ile durdu.
- [ ] Staging negative security harness `REQUIRE_STAGING_NEGATIVE_TESTS=true`, staging project ref allowlist ve staging/preview URL ile çalıştırıldı.
- [ ] Negative harness production DB üzerinde çalıştırılmadı; hassas tablo/bucket başarılı anon write/read sonucu bulunmadı.
- [ ] Preview QA sırasında oluşan test kayıtları temizlendi veya test kaydı olarak işaretlendi.
- [ ] Public bundle secret scan tekrar temiz; server-only secret değerleri public bundle'a taşınmadı.
- [ ] Bu workspace'te Vercel CLI, agent-browser CLI, staging secret'lar veya Preview URL yoksa gerçek 15G QA tamamlanmış sayılmadı ve kalan risk olarak işaretlendi.

## Export ve Raporlama

- [ ] Export işlemleri yetki kontrolünden geçiyor.
- [ ] Export işlemleri audit/export log'a düşüyor.
- [ ] CSV injection önlemleri test edildi.
- [ ] Kişisel veri maskeleme varsayılan olarak açık.

## Operasyon

- [ ] Domain ve SSL doğru.
- [ ] Backup stratejisi tanımlandı.
- [ ] Monitoring ve hata takibi planlandı.
- [ ] Payment webhook güvenliği ayrı test edildi.
- [ ] Son `npm run lint`, `npm run build`, `npm run check:supabase-env`, `npm run test:supabase` kontrolleri geçti.
- [ ] Son `npm run test:supabase-auth` rol test env yoksa kontrollü atladı veya tanımlı test kullanıcılarında rol/profile/account doğrulamasını geçti.

## Son Onay

- [ ] Yönetim onayı alındı.
- [ ] Teknik sorumlu onayı alındı.
- [ ] Hukuk/KVKK onayı alındı.
- [ ] Yayın geri dönüş planı hazır.
