# Backend Readiness Checklist

Backend hazırlığının güvenlik odağında tamamlandığını kontrol etmek için kullanılır.

## Supabase Key Kullanımı

- [ ] Smoke test yalnızca `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` veya `NEXT_PUBLIC_SUPABASE_ANON_KEY` kullanıyor.
- [ ] `SUPABASE_SECRET_KEY` ve `SUPABASE_SERVICE_ROLE_KEY` smoke test içinde kullanılmıyor.
- [ ] Service role yalnızca server-side admin/service işlemlerinde kullanılıyor.

## RLS Lockdown

- [ ] `006_lockdown_sensitive_tables.sql` staging ortamında çalıştırıldı.
- [ ] Hassas tablolar public read'e kapalı.
- [ ] Public SELECT policy kalıntıları hassas tablolardan temizlendi.
- [ ] Public tablolar sadece yayınlanmış/public kayıtları döndürüyor.

## Hassas Veri Alanları

- [ ] Bağış verileri varsayılan kapalı.
- [ ] Gönüllü başvuruları varsayılan kapalı.
- [ ] İletişim mesajları varsayılan kapalı.
- [ ] Görev ve iç mesaj tabloları varsayılan kapalı.
- [ ] Personel/kullanıcı/rol tabloları varsayılan kapalı.
- [ ] Sponsorluk ve çocuk verileri varsayılan kapalı.

## 8C Hazırlığı

- [ ] `/admin`, `/panel`, `/koordinator`, `/personel` için proxy/server guard hazırlığı tamamlandı.
- [ ] `NEXT_PUBLIC_ADMIN_DEMO_MODE=true` demo erişimi, `false` auth guard davranışı net.
- [ ] Public login/register ve admin login server action'ları Supabase Auth'a hazır.
- [ ] Role redirect fallback stratejisi belirlendi.
- [ ] Authenticated ownership policy tasarımı hazır.
- [ ] Admin/role-based policy tasarımı hazır.
- [ ] Audit log policy tasarımı hazır.
- [ ] Export yetki/audit modeli hazır.

## 8D Öncesi Ek Kontroller

- [ ] `profiles`, `user_accounts`, `admin_roles`, `role_permissions` read-only doğrulaması RLS ile test edildi.
- [ ] İlk Super Admin kurulum akışı staging ortamında doğrulandı.
- [ ] Bağışçı/gönüllü/koordinatör/personel test hesaplarıyla beklenen panel yönlendirmeleri çalışıyor.

## 8D Authenticated Policy Kontrolleri

- [ ] İlk Super Admin Auth kullanıcısı oluşturuldu.
- [ ] İlk Super Admin için `profiles` kaydı oluşturuldu.
- [ ] İlk Super Admin için `user_accounts` kaydı oluşturuldu.
- [ ] `admin_roles` ve `role_permissions` kayıtları oluşturuldu.
- [ ] `NEXT_PUBLIC_ADMIN_DEMO_MODE=false` staging denemesi yapıldı.
- [ ] `/admin/giris` login testi geçti.
- [ ] `npm run test:supabase-auth` test kullanıcısıyla çalıştı veya test env yoksa kontrollü atladı.
- [ ] 007 authenticated policy staging ortamında çalıştırıldı.
- [ ] Bağışçı kendi verisini görebiliyor.
- [ ] Bağışçı başkasının verisini göremiyor.
- [ ] Gönüllü kendi başvuru/görev verisini görebiliyor.
- [ ] Personel yalnızca kendi görev/mesaj kayıtlarını görebiliyor.
- [ ] Koordinatör yalnızca kendi ekip/faaliyet kapsamına erişiyor.
- [ ] Public lockdown hâlâ korunuyor ve `npm run test:supabase` Security warning 0 veriyor.

## 8E Rol Test Kullanıcı Kontrolleri

- [ ] Test kullanıcıları gerçek kullanıcı veya production kişisel verisiyle ilişkilendirilmedi.
- [ ] Test kullanıcı e-posta/şifreleri yalnızca `.env.local` veya güvenli staging env içinde tutuluyor.
- [ ] Test kullanıcıları production öncesi silinecek veya devre dışı bırakılacak.
- [ ] Metadata tek başına güvenlik kaynağı kabul edilmiyor; server guard + RLS esas alınıyor.
- [ ] `profiles.role` ve `user_accounts.account_type` değerleri rol bazlı test hesaplarında uyumlu.
- [ ] Super Admin/Admin `/admin` dışındaki yetkisiz route davranışlarıyla test edildi.
- [ ] Bağışçı yalnızca bağışçı paneline, gönüllü yalnızca gönüllü paneline yönleniyor.
- [ ] Donor + volunteer hesabı `/panel` ortak girişine yönleniyor.
- [ ] Koordinatör `/koordinator`, personel `/personel` ile sınırlı.
- [ ] `npm run test:supabase-auth` env yoksa kontrollü atlıyor, env varsa login/profile/account/route doğrulaması yapıyor.

## 8F Read-only Veri Bağlantısı Kontrolleri

- [ ] `projects`, `news_posts` ve `reports` public read-only repository üzerinden okunuyor.
- [ ] Supabase env yoksa public sayfalar mock fallback ile açılıyor.
- [ ] Supabase hata/timeout/RLS engelinde uygulama beyaz ekran vermeden mock fallback'e dönüyor.
- [ ] Supabase başarılı ama kayıt boşsa sayfalarda düzgün empty state gösteriliyor.
- [ ] Admin içerik listeleri sadece public içerik tablolarını read-only okuyor; CRUD yok.
- [ ] Admin dashboard yalnızca public içerik sayaçlarını Supabase'ten okuyor.
- [ ] Bağış, gönüllü, mesaj, görev, kullanıcı ve sponsorluk gibi hassas tablolar 8F'de gerçek veri kaynağına bağlanmadı.
- [ ] Repository logları secret/key/token/şifre bilgisi yazmıyor.
- [ ] `npm run test:supabase` sonucu `Security warning: 0` olarak korunuyor.

## 9A Admin Public İçerik CRUD Kontrolleri

- [ ] `009_admin_content_crud_policies.sql` staging ortamında çalıştırıldı.
- [ ] Admin CRUD server action'ları write öncesi `profiles.role` admin/super_admin ve `status = active` doğruluyor.
- [ ] Proje, haber ve rapor create/update işlemleri client tarafına service role taşımadan çalışıyor.
- [ ] Arşivleme hard delete yerine status update ile yapılıyor.
- [ ] Public/anon insert/update/delete policy açılmadı.
- [ ] Hassas tablolar için CRUD veya write policy eklenmedi.
- [ ] Audit log helper best-effort çalışıyor ve audit hatası CRUD işlemini patlatmıyor.
- [ ] Draft/archived kayıtlar public sitede görünmüyor.
- [ ] Server-side validation title/slug/status/numeric/url/metrics alanlarını kontrol ediyor.

## 9B Kurban Modülü Kontrolleri

- [ ] `010_qurban_module.sql` staging ortamında çalıştırıldı.
- [ ] Public/anon yalnızca aktif `qurban_campaigns` kayıtlarını okuyabiliyor.
- [ ] Public/anon kurban siparişi, vekalet, hisse, operasyon, dağıtım, bildirim ve export tablolarını okuyamıyor.
- [ ] Bağışçı yalnızca kendi `donor_account_id` ilişkili kurban kayıtlarını görebiliyor.
- [ ] Koordinatör/personel yalnızca kendisine atanmış kurban operasyon kapsamını görebiliyor.
- [ ] Kurban modülü bu aşamada gerçek ödeme, gerçek kayıt, makbuz veya dosya upload yapmıyor.
- [ ] Vekalet metni yönetim, hukuk danışmanı ve dini danışman onayı olmadan production'da kullanılmıyor.
- [ ] Kurban export ekranında kişisel veri maskeleme varsayılan açık planlandı.
- [ ] Service role key client tarafına taşınmadan read-only/mock akış korunuyor.

## 9C Kurban Kayıt Akışı Kontrolleri

- [ ] `011_qurban_order_flow.sql` staging ortamında çalıştırıldı.
- [ ] `/kurban/bagis` formu server action üzerinden kayıt oluşturuyor; client tarafında service role key yok.
- [ ] `create_qurban_order` RPC anon/authenticated rollere açık değil, sadece server-side service role ile çağrılıyor.
- [ ] Vekalet ve KVKK onayı olmadan order oluşturulmuyor.
- [ ] `qurban_orders`, `qurban_delegations`, `qurban_shares` ve `qurban_status_logs` kayıtları aynı DB transaction içinde oluşuyor.
- [ ] `qurban_campaigns.quota_reserved` kontenjan aşımı olmadan artırılıyor.
- [ ] Girişsiz başvurularda `donor_account_id` null kalıyor ve panelde otomatik görünmüyor.
- [ ] Girişli bağışçı başvuruları `donor_account_id` ile panelde görünüyor.
- [ ] Yeni kurban tabloları smoke testte public/protected kapsamına eklendi ve `Security warning: 0` korunuyor.

## 9C.1 Kurban Stabilizasyon Kontrolleri

- [ ] Public `/kurban` sayfası kampanya, kurban türleri, vekalet, kesim, dağıtım ve bilgilendirme sürecini teknik detay göstermeden açıklıyor.
- [ ] `/kurban/[slug]` kampanya adı, türü, bölgesi, birim bedeli, kontenjanı ve bağış CTA davranışını doğru gösteriyor.
- [ ] `/kurban/bagis?kampanya=slug` doğru kampanyayı önden seçiyor.
- [ ] Başarı ekranı sipariş no, vekalet kaydı, ödeme bekliyor durumu ve admin kayıt notunu gösteriyor.
- [ ] Admin kurban bağışları ekranı maskeli kişisel veri ve anlaşılır durum rozetleriyle read-only çalışıyor.
- [ ] Admin kurban dashboard metrikleri Supabase okunabiliyorsa gerçek kayıtları, okunamıyorsa güvenli mock fallback'i gösteriyor.
- [ ] `/panel/kurbanlarim` girişli donor kayıtlarını gösteriyor; guest kayıtların otomatik görünmeyeceğini açıklıyor.
- [ ] Koordinatör/personel kurban ekranları demo/read-only olduğunu belli ediyor ve bağışçı kişisel verisi göstermiyor.
- [ ] `docs/qurban-manual-test-checklist.md` staging manuel testlerinde kullanılıyor.
- [ ] 9D ödeme entegrasyonu öncesi webhook signature, idempotency, server-side tutar doğrulama ve quota release planı hazır.

## 9D Yetim Hamiliği / Sponsorluk Kontrolleri

- [ ] `012_orphan_sponsorship_module.sql` staging ortamında çalıştırıldı.
- [ ] Public/anon yalnızca aktif `sponsorship_programs` kayıtlarını okuyabiliyor.
- [ ] Public/anon `orphan_profiles`, `sponsorships`, `sponsorship_payments`, `orphan_updates`, `orphan_sponsorship_notes`, `orphan_assignments`, `sponsorship_notifications` ve `sponsorship_exports` tablolarını okuyamıyor.
- [ ] Sponsor yalnızca kendi `sponsor_account_id` ilişkili sponsorluk kayıtlarını okuyabiliyor.
- [ ] Sponsor güvenli yetim özetini yalnızca `sponsored_orphans_safe_view` üzerinden görebiliyor.
- [ ] Admin/super_admin yetim hamiliği yönetim ekranlarını okuyabiliyor.
- [ ] Koordinatör/personel yalnızca kendisine atanmış yetim/sponsorluk görevlerini okuyabiliyor.
- [ ] Public `/yetim-hamiligi`, `/yetim-hamiligi/surec` ve `/yetim-hamiligi/basvuru` sayfaları açılıyor.
- [ ] `/yetim-hamiligi/basvuru` gerçek ödeme, düzenli talimat veya sponsorship kaydı oluşturmuyor.
- [ ] Bağışçı `/panel/yetim-sponsorluk` yalnızca güvenli özet gösteriyor.
- [ ] Admin, koordinatör ve personel yetim ekranlarında açık kimlik, açık adres, okul adı, telefon ve aile detayı gösterilmiyor.
- [ ] Service role key client tarafına taşınmadan mock/read-only akış korunuyor.

## 9D.1 Yetim Hamiliği Başvuru ve Eşleştirme Kontrolleri

- [ ] `013_orphan_sponsorship_application_flow.sql` staging ortamında çalıştırıldı.
- [ ] `/yetim-hamiligi/basvuru` formu server action üzerinden `sponsorship_applications` kaydı oluşturuyor.
- [ ] Program aktifliği ve aylık destek tutarı server tarafında `sponsorship_programs` kaydından doğrulanıyor.
- [ ] KVKK onayı olmadan başvuru oluşturulmuyor.
- [ ] Honeypot submit gerçek kayıt oluşturmadan güvenli şekilde karşılanıyor.
- [ ] Girişli sponsor başvurusu `sponsor_account_id` ile ilişkilendiriliyor.
- [ ] Misafir başvuruların panelde otomatik görünmeyebileceği dokümante edildi.
- [ ] Admin `/admin/yetim-hamiligi/basvurular` gerçek başvuruları maskeli kişisel veriyle okuyor.
- [ ] Admin eşleştirme action'ı `requireAdminUser()` ile korunuyor.
- [ ] Eşleştirme sonrası `sponsorships`, `sponsorship_matches`, `sponsorship_status_logs` oluşuyor.
- [ ] Eşleştirme sonrası `orphan_profiles.status = sponsored` güncelleniyor.
- [ ] Sponsor panelinde yalnızca kendi başvuru/sponsorluk ve güvenli yetim özeti görünüyor.
- [ ] Yeni yetim tabloları smoke test protected kapsamına eklendi ve `Security warning: 0` korunuyor.

## 9E Ortak Ödeme, Makbuz ve Bildirim Kontrolleri

- [ ] `014_common_payment_receipt_notification_infrastructure.sql` staging ortamında çalıştırıldı.
- [ ] `payment_intents`, `payment_events`, `payment_provider_events`, `receipts`, `notification_queue` ve `payment_status_logs` public/anon erişime kapalı.
- [ ] Authenticated donor yalnızca kendi `donor_account_id` ilişkili payment intent ve receipt kayıtlarını okuyabiliyor.
- [ ] Admin/super_admin ödeme, makbuz, bildirim ve event kayıtlarını okuyabiliyor.
- [ ] Public formlar doğrudan ödeme tablolarına client-side insert yapmıyor.
- [ ] Service role yalnızca `lib/data/paymentWriteRepository.ts` gibi server-only write katmanında kullanılıyor.
- [ ] Gerçek provider API çağrısı, webhook doğrulaması, PDF makbuz üretimi ve SMS/e-posta gönderimi yapılmıyor.
- [ ] Admin ödeme kayıtları, makbuzlar ve bildirim kuyruğu Supabase okunamazsa mock fallback ile açılıyor.
- [ ] Smoke test yeni ödeme tablolarını protected kapsamda doğruluyor ve `Security warning: 0` korunuyor.

## 9E.1 Ödeme Stabilizasyon Kontrolleri

- [ ] `015_fix_sponsored_orphans_safe_view_security.sql` staging ortamında çalıştırıldı.
- [ ] `sponsored_orphans_safe_view` `security_invoker = true` olarak doğrulandı.
- [ ] `sponsored_orphans_safe_view` anon/publishable key ile okunamıyor.
- [ ] `/admin/odeme-kayitlari`, `/admin/makbuzlar` ve `/admin/bildirim-kuyrugu` read-only/mock fallback ile açılıyor.
- [ ] Admin ödeme/makbuz/bildirim ekranlarında canlı aksiyon butonu yok; aksiyonlar pasif/demo.
- [ ] `/panel/bagislarim`, `/panel/kurbanlarim` ve `/panel/yetim-sponsorluk` gerçek ödeme yapılmadığını açıkça gösteriyor.
- [ ] `docs/payment-security-stabilization-checklist.md` ve `docs/payment-manual-test-checklist.md` staging kontrolünde kullanılıyor.

## 10A PayTR Test Entegrasyonu Kontrolleri

- [ ] `.env.example` PayTR test env değişkenlerini içeriyor.
- [ ] `lib/payments/paytr.ts` server-only ve hash/token üretimini server tarafında yapıyor.
- [ ] `/odeme/paytr/[intentNo]` PayTR iframe token isteğini server-side başlatıyor.
- [ ] `/odeme/basarili` ve `/odeme/basarisiz` yalnızca bilgilendirme sayfası.
- [ ] `/api/paytr/callback` session kullanmıyor, hash doğruluyor ve sadece başarılı işlemde `OK` dönüyor.
- [ ] Duplicate callback idempotent işleniyor.
- [ ] `payment_provider_events`, `payment_events` ve `payment_status_logs` callback izini tutuyor.
- [ ] Paid callback sonrası makbuz hazırlık ve bildirim kuyruğu taslağı oluşuyor.
- [ ] Kurban/yetim/genel bağış finalization tam iş kuralı sonraki aşamaya kontrollü bırakıldı.

## 10B Payment Intent Başlatma Kontrolleri

- [ ] `/bagis-yap` formu server action ile `general_donation` payment intent oluşturuyor.
- [ ] `DONATION_MODE=whatsapp` veya `disabled` iken `/bagis-yap` formu render edilmiyor ve server action erken güvenli yönlendirme yapıyor.
- [ ] Genel bağışta amount, e-posta ve KVKK server-side doğrulanıyor.
- [ ] Kurban order sonrası `qurban_order` payment intent oluşuyor ve başarı ekranında ödeme linki gösteriliyor.
- [ ] `DONATION_MODE=whatsapp` veya `disabled` iken `/kurban/bagis` ve `/yetim-hamiligi/basvuru` public form başlatma akışları kapalı bilgi/WhatsApp kartına dönüyor.
- [ ] Yetim eşleştirme sonrası `orphan_sponsorship` payment intent oluşuyor.
- [ ] Aynı context için pending/initiated intent tekrar kullanılıyor.
- [ ] Admin ödeme kayıtları yeni intent'leri PayTR provider ve Türkçe durum etiketiyle gösteriyor.
- [ ] PayTR env eksikken ödeme sayfası güvenli hata gösteriyor.
- [ ] Paid callback sonrası kurban ve sponsorluk için sınırlı status update çalışıyor.
- [ ] Canlı ödeme, kart saklama, PDF makbuz ve gerçek bildirim gönderimi hala kapalı.

## 10C Payment Finalization Kontrolleri

- [ ] `016_payment_finalization_and_context_state.sql` staging ortamında çalıştırıldı.
- [ ] `finalize_qurban_payment` paid callback sonrası order, share ve quota durumlarını transaction içinde güncelliyor.
- [ ] `release_qurban_payment_reservation` failed/cancelled/refunded callback sonrası reserved quota değerini idempotent serbest bırakıyor.
- [ ] `finalize_orphan_sponsorship_payment` paid callback sonrası sponsorship kaydını active yapıyor ve ödeme tarihlerini set ediyor.
- [ ] `handle_orphan_sponsorship_payment_failed` başarısız/iptal ödeme sonrası sponsorship kaydını active yapmıyor.
- [ ] `finalize_general_donation_payment` genel bağış için receipt ve notification hazırlık kaydı oluşturuyor.
- [ ] PayTR callback `total_amount` ve `currency` doğrulaması yapıyor.
- [ ] Duplicate callback payment intent, quota, receipt, notification ve sponsorship tarihlerini ikinci kez değiştirmiyor.
- [ ] Admin ödeme kayıtları finalization durumunu read-only gösteriyor.
- [ ] `docs/paytr-callback-idempotency-test.md` staging manuel testlerinde kullanılıyor.
- [ ] Canlı ödeme, kart saklama, PDF makbuz ve gerçek bildirim gönderimi hala kapalı.

## 10D Makbuz PDF ve Private Storage Kontrolleri

- [ ] `017_receipt_pdf_private_storage.sql` staging ortamında çalıştırıldı.
- [ ] `receipts-private` bucket private olarak oluşturuldu.
- [ ] `lib/receipts/receiptPdfGenerator.ts` server-side PDF buffer üretiyor.
- [ ] `lib/receipts/receiptStorage.ts` PDF upload, SHA-256, file metadata ve download helperlarını sağlıyor.
- [ ] `/admin/makbuzlar` paid payment receipt için PDF Hazırla action'ını gösteriyor.
- [ ] `/api/receipts/[receiptNo]/download` admin ve doğru donor dışındaki erişimi engelliyor.
- [ ] `/panel/bagislarim`, `/panel/kurbanlarim`, `/panel/yetim-sponsorluk` yalnızca kullanıcının kendi makbuz linkini gösteriyor.
- [ ] Receipt `file_path` public URL olarak kullanılmıyor.
- [ ] `docs/receipt-pdf-private-storage.md` ve `docs/receipt-manual-test-checklist.md` staging testinde kullanılıyor.
- [ ] Canlı ödeme, gerçek muhasebe entegrasyonu ve gerçek bildirim gönderimi hala kapalı.

## 10F-M Manuel / Fiziksel Makbuz Kontrolleri

- [ ] `018_manual_physical_receipts.sql` staging ortamında çalıştırıldı.
- [ ] `manual_receipts` ve `manual_receipt_events` anon/public erişime kapalı.
- [ ] `manual-receipts-private` bucket public değil.
- [ ] `/admin/makbuzlar/manuel` liste, filtre ve mock fallback ile açılıyor.
- [ ] `/admin/makbuzlar/manuel/yeni` server action ile manuel makbuz oluşturuyor.
- [ ] Detay, düzenleme ve A4 yatay yazdırma önizleme ekranları admin guard altında çalışıyor.
- [ ] PDF üretimi `manual-receipts/{year}/{receiptNo}/v1.pdf` path standardını kullanıyor.
- [ ] `/api/manual-receipts/[receiptNo]/download` yalnızca admin/super_admin erişimine açık.
- [ ] İptal gerekçesi zorunlu ve event/audit log'a yazılıyor.
- [ ] Manuel makbuzlar dijital `receipts` ve PayTR/payment intent akışını değiştirmiyor.

## 11A Proje Faaliyetleri Kontrolleri

- [ ] `020_project_activities.sql` staging ortamında çalıştırıldı.
- [ ] `project_activities` tablosu RLS enabled/forced.
- [ ] `project_activity_events` anon/public erişime kapalı.
- [ ] Anon yalnızca `visibility = public` ve `status = completed` faaliyetlerin güvenli kolonlarını okuyabiliyor.
- [ ] Admin proje listesinde her proje için `Faaliyetler` bağlantısı görünüyor.
- [ ] `/admin/projeler/[id]/faaliyetler` liste, filtre ve demo fallback ile açılıyor.
- [ ] Yeni faaliyet oluşturma, düzenleme, tamamlandı işaretleme, public/internal görünürlük, iptal ve arşiv action'ları server-side admin guard ile çalışıyor.
- [ ] Public proje detay sayfasında yalnızca completed/public faaliyetler görünüyor.
- [ ] `internal_notes`, `estimated_cost`, `responsible_user_id`, `metadata`, `created_by` ve `updated_by` public mapping'e taşınmıyor.
- [ ] Smoke test `project_activities: OK - public completed read` ve `project_activity_events: OK - protected` sonucunu veriyor.

## 11A.2 Public Proje Haritası Kontrolleri

- [ ] `/` ana sayfasında “Nerelerde Çalışıyoruz?” bölümü görünüyor.
- [ ] `/projeler` sayfasında Gazze, Lübnan, Mısır ve Türkiye bölgeleri harita üzerinde gösteriliyor.
- [ ] Bölge seçilince ilgili proje kartları listeleniyor.
- [ ] Proje filtrelerinde bölge ve kategori seçenekleri çalışıyor.
- [ ] Supabase proje verisinde bölge alanı yoksa slug/title/location fallback mapping boş sayfa oluşturmuyor.
- [ ] Harita bağımlılıksız SVG/HTML/CSS olarak çalışıyor; API key gerektirmiyor.

## 11A.3 Proje Bölgeleri ve Bölgeye Bağlı Projeler

- [ ] `021_project_regions_and_project_region_fields.sql` staging ortamında çalıştırıldı.
- [ ] `project_regions` tablosunda Gazze, Lübnan, Mısır ve Türkiye seed kayıtları görünüyor.
- [ ] `/admin/proje-bolgeleri` liste, oluşturma, düzenleme, public/internal ve pasif akışları admin guard altında çalışıyor.
- [ ] `/admin/projeler/yeni` ve `/admin/projeler/[id]/duzenle` içinde “Çalışma Bölgesi” select alanı görünüyor.
- [ ] `projects.region_slug`, `country`, `city`, `region_label` alanları kaydediliyor.
- [ ] Public harita önce Supabase `project_regions` datasını, hata/boş durumda fallback datasını kullanıyor.
- [ ] Harita altındaki “Bu Bölgede Yürütülen Projeler” ve “Son Saha Faaliyetleri” alanları boş görünmüyor.
- [ ] Smoke test `project_regions: OK - public active read` sonucunu veriyor.

## 11B Proje Medya Upload Kontrolleri

- [ ] `023_project_media_storage.sql` staging ortamında çalıştırıldı.
- [ ] `project-media` bucket public read, admin server action upload ve anon upload kapalı olarak doğrulandı.
- [ ] Proje kapak/thumbnail, bölge kapak ve faaliyet kapak görselleri dosya seçilerek yükleniyor.
- [ ] Server Action upload body limiti 10 MB; uygulama ve storage görsel kabul limiti 5 MB olarak korunuyor.
- [ ] Upload helper `server-only` kalıyor ve service role key client tarafına taşınmıyor.
- [ ] MIME yalnızca JPG/PNG/WebP, dosya boyutu en fazla 5 MB.
- [ ] Public kartlar ve detay sayfaları yüklenen public URL değerlerini kullanıyor.
- [ ] URL ile ekleme yalnızca gelişmiş/yedek seçenek olarak kalıyor.

## 14A Hukuki Görünüm ve Form Onayları

- [ ] `/hukuki/[slug]` route'u legal metinleri tek veri kaynağından render ediyor.
- [ ] KVKK Aydınlatma Metni ve Açık Rıza Metni public sitede ayrı metinler olarak sunuluyor.
- [ ] İletişim, gönüllü, bağış, kurban, yetim hamiliği ve kayıt formlarında aydınlatma beyanı, açık rıza ve duyuru/iletişim izni ayrı checkbox alanlarıyla gösteriliyor.
- [ ] `DONATION_MODE=whatsapp` davranışı korunuyor; form yerine WhatsApp bilgilendirme kartı ve kısa KVKK/Gizlilik notu gösteriliyor.
- [ ] Bu aşamada PayTR ödeme akışı, makbuz sistemi, Supabase RLS ve admin büyük özellik geliştirmeleri değiştirilmedi.
- [ ] Hukuki metinler hukukçu kontrolüne sunulacak; resmi adres, sicil ve yetkili iletişim bilgileri nihai kontrolde tamamlanacak.
- [ ] Çerez politikası analitik/pazarlama araçları eklendiğinde güncellenecek.
- [ ] Online ödeme aktif edilmeden önce bağış bilgilendirme ve mesafeli bağış/online ödeme metinleri yeniden gözden geçirilecek.

## 14B Hukuki Onay Kayıtları ve Çerez Tercihleri

- [ ] `024_legal_consent_and_cookie_preferences.sql` staging ortamında çalıştırıldı.
- [ ] Form kayıt tablolarında `kvkk_acknowledged`, `explicit_consent_given`, `communication_permission_given`, `consent_text_version`, `consent_given_at`, `consent_user_agent` ve `consent_metadata` alanları bulunuyor.
- [ ] `site_cookie_consents` tablosu oluşturuldu ancak ilk sürümde public insert/update policy açılmadı.
- [ ] Smoke test `site_cookie_consents: OK - protected` sonucunu veriyor.
- [ ] `LegalConsentFields` ortak component'i context bazlı aydınlatma, açık rıza ve duyuru izni checkboxlarını ayrı render ediyor.
- [ ] İletişim ve gönüllü formları server action ile `contact_messages` ve `volunteer_applications` kayıtlarına consent alanlarını yazıyor.
- [ ] Genel bağış payment intent metadata ve consent kolonları legal consent bilgisini taşıyor.
- [ ] Kurban başvurusunda RPC akışı korunuyor; order sonrası consent audit alanları `qurban_orders` kaydına yazılıyor.
- [ ] Yetim hamiliği başvurusu `sponsorship_applications` kaydına consent audit alanlarını yazıyor.
- [ ] Kayıt formu Supabase Auth metadata'sına KVKK, duyuru izni, kullanım şartları ve consent sürüm bilgisini yazıyor.
- [ ] `docs/legal-consent-and-cookies.md` hukukçu ve teknik sorumlu kontrolünde güncel tutuluyor.
- [ ] `docs/legal-final-review-checklist.md` 14C kapanışı için tamamlandı.
- [ ] 024 migration uygulanmadan `/iletisim` ve `/gonullu-ol` form submit doğrulaması tamamlandı kabul edilmiyor.
- [ ] Migration sonrası `site_cookie_consents` smoke testte protected görünüyor ve missing değildir.

## 15A Production Security Hardening

- [ ] `docs/production-security-hardening.md` backend/security yayın kontrolünde kullanılıyor.
- [ ] Service role client sadece `server-only` dosyalarda, Server Action veya API route sınırında kullanılıyor.
- [ ] Public bundle secret/env adı taraması build sonrası temiz.
- [ ] RLS smoke testi anon/publishable key ile çalışıyor, service role kullanmıyor ve write işlemi yapmıyor.
- [ ] Hassas ödeme, makbuz, bildirim, rol/profil, kurban operasyon ve yetim/sponsorluk tabloları anon/public erişime kapalı kalıyor.
- [ ] `site_cookie_consents` RLS enabled/forced ve public insert/update policy içermiyor.
- [ ] `project-media` bucket public read; upload/update/delete yalnızca admin server action ve service role helper üzerinden.
- [ ] `receipts-private` ve `manual-receipts-private` bucketları private; download API route'ları oturum, rol ve ownership kontrolü yapıyor.
- [ ] `/api/paytr/callback` hash doğrulama, tutar/para birimi doğrulama, provider event log ve idempotency kontrollerini koruyor.
- [ ] Admin write action'ları `requireAdminUser`/server-side role guard olmadan kayıt değiştirmiyor.
- [ ] `DONATION_MODE=whatsapp` public bağış sayfalarında payment intent, order veya sponsorship payment başlatmıyor.
- [ ] Public form validation, honeypot ve consent kontrolleri mevcut; rate limit/captcha production riski olarak planlandı.
- [ ] Security headers uygulandı; tam CSP kırılma riski nedeniyle ayrı staging test maddesi olarak bırakıldı.

## 15B Public Form Spam Koruması

- [ ] `docs/form-spam-protection.md` backend/security yayın kontrolünde kullanılıyor.
- [ ] `lib/security/formProtection.ts` server-only kalıyor ve public bundle'a secret veya ham IP taşımıyor.
- [ ] Public form server action'ları honeypot ve best-effort rate limit kontrolünü DB/RPC/Auth çağrısından önce yapıyor.
- [ ] `FormProtectionFields` iletişim, gönüllü, kayıt, bağış, kurban ve yetim formlarında ortak hidden alanları sağlıyor.
- [ ] Form timing çok hızlı submitleri metadata risk flag olarak işaretliyor, erişilebilirlik nedeniyle katı bloklama yapmıyor.
- [ ] `contact_messages`, `volunteer_applications`, `payment_intents`, `qurban_orders` ve `sponsorship_applications` consent metadata'sında `formSecurity` bilgisi taşıyabiliyor.
- [ ] Anon doğrudan sensitive tablo write açılmadı; public submitler server-only repository/action sınırında kalıyor.
- [ ] Kalıcı rate limit provider eklenirse Redis/KV/Supabase tasarımı ve KVKK veri minimizasyonu tekrar gözden geçirilecek.
