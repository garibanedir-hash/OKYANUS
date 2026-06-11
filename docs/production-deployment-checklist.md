# Production Deployment Checklist

Bu liste Okyanus İnsani Yardım Derneği platformu production yayını öncesi son teknik ve operasyonel kontroller için hazırlanmıştır.

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
