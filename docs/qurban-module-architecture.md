# 9B Kurban Çalışmaları Modülü

Bu doküman Okyanus İnsani Yardım Derneği için kurban kampanyası, vekalet, kesim, dağıtım, bağışçı bilgilendirme ve raporlama akışının 9B kapsamındaki mimarisini açıklar.

## Modül Amacı

Kurban modülü sıradan bir bağış projesi olarak ele alınmaz. Amaç; kurban türü, vekalet, ödeme durumu, hisse/adet takibi, kesim planı, dağıtım ve bilgilendirme süreçlerini ayrı statülerle izlenebilir hale getirmektir.

9B kapsamı kurban veri modeli, RLS hazırlığı ve demo/read-only ekranların başlangıcıdır:

- Gerçek ödeme başlatılmaz.
- Gerçek SMS/e-posta gönderilmez.
- Makbuz, PDF veya dosya upload yapılmaz.
- Hassas tablolar public erişime açılmaz.

9C ile ödeme öncesi başvuru akışı başlatılmıştır:

- `/kurban/bagis` güvenli server action ile `qurban_orders` kaydı oluşturabilir.
- Vekalet kabulü `qurban_delegations` içinde kaydedilir.
- `share_count` kadar `qurban_shares` rezervasyonu yapılır.
- `qurban_campaigns.quota_reserved` transaction içinde artırılır.
- Kayıt `payment_pending` durumunda kalır; gerçek ödeme hâlâ yoktur.

9C.1 stabilizasyon kapsamı:

- Public sayfalarda kurban türü, bölge, birim bedel, kontenjan ve süreç dili sadeleştirilmiştir.
- Başarı ekranı sipariş numarası, vekalet kaydı ve "Ödeme bekleniyor" durumunu açık gösterir.
- Admin, bağışçı paneli, koordinatör ve personel ekranlarında read-only/demo kapsamı netleştirilmiştir.
- Guest başvuruların admin kayıtlarında görüneceği, ancak bağışçı paneline otomatik düşmeyeceği belirtilmiştir.
- Ödeme, makbuz, SMS/e-posta, gerçek PDF/dosya upload ve operasyon write aksiyonları 9D ve sonrası için kapalı kalır.

## Kurban Süreç Akışı

1. Kurban türü seçilir.
2. Kampanya ve hisse/adet belirlenir.
3. Vekalet metni onaylanır.
4. Bağış/ödeme durumu takip edilir.
5. Kesim operasyonu planlanır.
6. Kesim tamamlandı durumu işlenir.
7. Dağıtım kaydı ve raporlama hazırlanır.
8. Bağışçı bilgilendirme kuyruğu oluşturulur.

## Veri Modeli

Yeni migration:

- `supabase/migrations/010_qurban_module.sql`
- `supabase/migrations/011_qurban_order_flow.sql`

Enumlar:

- `qurban_type`
- `qurban_region_type`
- `qurban_campaign_status`
- `qurban_order_status`
- `qurban_delegation_status`
- `qurban_operation_status`
- `qurban_payment_status`

Tablolar:

- `qurban_campaigns`: public aktif kampanya bilgileri.
- `qurban_orders`: bağışçı kurban siparişi, ödeme ve vekalet durumları.
- `qurban_delegations`: vekalet onay kayıtları.
- `qurban_shares`: hisse/adet bazlı takip.
- `qurban_operations`: kesim ve dağıtım operasyon planı.
- `qurban_distribution_logs`: dağıtım özetleri.
- `qurban_status_logs`: durum değişim geçmişi.
- `qurban_notifications`: bağışçı bilgilendirme hazırlığı.
- `qurban_exports`: export hazırlık kayıtları.

9C ekleri:

- `qurban_orders.kvkk_accepted`
- `qurban_orders.contact_permission`
- `qurban_orders.source`
- `qurban_orders.created_by`
- `qurban_orders.updated_by`
- `qurban_delegations.kvkk_accepted`
- `qurban_delegations.source`
- `qurban_shares.share_index`
- `qurban_shares.reserved_at`
- `qurban_status_logs.event_type`

## Public Kurban Akışı

Public route'lar:

- `/kurban`
- `/kurban/[slug]`
- `/kurban/bagis`

`/kurban` sadece aktif kampanyaları listeler. `/kurban/[slug]` kampanya detayını, vekalet metni önizlemesini ve kontenjan bilgisini gösterir. `/kurban/bagis` 9C itibarıyla ödeme öncesi başvuru, vekalet kabulü ve hisse/adet rezervasyonu oluşturabilir. Ödeme işlemi, makbuz ve bildirim hâlâ kapalıdır.

## Admin Kurban Operasyonu

Admin route'ları:

- `/admin/kurban`
- `/admin/kurban/kampanyalar`
- `/admin/kurban/bagislar`
- `/admin/kurban/vekaletler`
- `/admin/kurban/kesim-takibi`
- `/admin/kurban/dagitimlar`
- `/admin/kurban/bildirimler`
- `/admin/kurban/raporlar`
- `/admin/kurban/export`

Admin ekranları operasyon yazılımı diliyle kompakt KPI, filtre bar, tablo ve durum rozetleri kullanır. Kurban bağışları ekranı authenticated RLS üzerinden gerçek `qurban_orders` kayıtlarını okuyabilir; write aksiyonları hâlâ admin UI içinde açılmamıştır.

## Bağışçı Kurban Takip Paneli

Yeni route:

- `/panel/kurbanlarim`

Bağışçı paneli şu durumları gösterir:

- Vekalet durumu
- Ödeme durumu
- Kesim durumu
- Dağıtım durumu
- Makbuz durumu
- Bilgilendirme durumu

Giriş yapan bağışçı ile oluşturulan kayıtlar `donor_account_id` üzerinden panelde görünebilir. Girişsiz oluşturulan kayıtların sonradan hesapla eşleştirilmesi sonraki aşamaya bırakılmıştır; e-posta tek başına güvenlik kaynağı değildir.

## Koordinatör ve Personel Görevleri

Koordinatör route'u:

- `/koordinator/kurban-operasyon`

Personel route'u:

- `/personel/kurban-gorevleri`

Koordinatör yalnızca kendisine atanmış operasyonları, personel yalnızca kendisine atanmış kesim/dağıtım görevlerini görmelidir. 010 migration bu read policy hazırlığını `user_accounts.auth_user_id` eşleşmesiyle kurar.

## Vekalet Süreci

Bu aşamadaki vekalet metni demo/taslak niteliğindedir.

Production öncesi:

- Dernek yönetimi metni onaylamalıdır.
- Hukuk danışmanı KVKK, vekalet ve bağış şartları açısından incelemelidir.
- Dini danışman kurban ve vekalet metnini ilmi açıdan değerlendirmelidir.

Onay tamamlanmadan demo metin production bağış akışında kullanılmamalıdır.

## Ödeme Entegrasyonu Öncesi Notlar

Kurban bağışı akışı 9C.1 sonunda ödeme öncesi başvuru kaydı oluşturabilir durumdadır. Ödeme provider entegrasyonu açılmadan önce:

- Idempotency modeli hazırlanmalı.
- Webhook signature doğrulanmalı.
- Tutar, para birimi ve kampanya kontenjanı server-side kontrol edilmelidir.
- Başarılı ödeme sonrası `payment_status`, `order_status` ve hisse durumları atomik güncellenmelidir.
- Başarısız veya iptal edilen ödeme için quota release stratejisi belirlenmelidir.
- Guest kayıtların bağışçı hesabıyla güvenli eşleştirme süreci tasarlanmalıdır.

## RLS ve Güvenlik Notları

- Public/anon yalnızca `status = active` olan `qurban_campaigns` kayıtlarını okuyabilir.
- Public/anon `qurban_orders`, `qurban_delegations`, `qurban_shares`, `qurban_operations`, `qurban_distribution_logs`, `qurban_status_logs`, `qurban_notifications` ve `qurban_exports` tablolarını okuyamaz.
- Donor kendi `donor_account_id` ilişkili kurban siparişlerini okuyabilir.
- Koordinatör/personel yalnızca atanmış operasyon kapsamını okuyabilir.
- Admin/super_admin yönetim ekranları için read policy hazırlanmıştır.
- Insert/update/delete policy bu aşamada açılmamıştır.
- Service role key client tarafına taşınmaz.
- Kurban başvuru yazımı server action üzerinden service role ile `create_qurban_order` RPC çağrılarak yapılır.
- `create_qurban_order` RPC public/anon/authenticated rollere açık değildir; server-only write katmanı kullanır.

## Export ve Raporlama

Export ekranı demo hazırlıktır. Varsayılan kişisel veri maskeleme açık olmalıdır. Gerçek CSV/XLSX/PDF üretimi açılmadan önce:

- Audit/export log yazımı doğrulanmalı.
- CSV injection önlemleri uygulanmalı.
- Export yetkisi admin/super_admin ile sınırlandırılmalı.
- PII alanları minimum görünürlük ilkesiyle maskelenmelidir.

## Sonraki Aşamalar

- 010 ve 011 migration staging ortamında çalıştırılıp manuel checklist ile doğrulanmalı.
- RLS policy'leri test kullanıcılarıyla doğrulanmalı ve `Security warning: 0` korunmalı.
- 9D ödeme entegrasyonu için provider, webhook, idempotency ve quota release tasarımı tamamlanmalı.
- Kesim/dağıtım write action'ları koordinatör/personel rol sınırlarıyla hazırlanmalı.
- Bildirim ve makbuz entegrasyonu gerçek provider testlerinden sonra açılmalıdır.
