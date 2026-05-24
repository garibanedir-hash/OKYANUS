# 9E Ortak Ödeme, Makbuz ve Bildirim Altyapısı

Bu aşama Okyanus İnsani Yardım Derneği için genel bağış, kurban bağışı ve yetim hamiliği/sponsorluk akışlarını aynı ödeme hazırlık modeline bağlamak için tasarlanmıştır.

9E gerçek ödeme entegrasyonu değildir. Canlı POS, iyzico, PayTR, Stripe, banka API çağrısı, gerçek webhook doğrulaması, PDF makbuz üretimi veya SMS/e-posta gönderimi yapılmaz.

## Neden Ortak Ödeme Altyapısı?

Genel bağış, kurban ve yetim hamiliği farklı iş süreçlerine sahiptir; fakat ödeme niyeti, ödeme durum geçmişi, makbuz hazırlığı ve bildirim kuyruğu ortak bir omurga üzerinden yönetilebilir. Bu sayede provider seçimi değişse bile iş kayıtları aynı modelde kalır.

## Bağlamlar

`payment_context_type` şu bağlamları destekler:

- `general_donation`
- `qurban_order`
- `orphan_sponsorship`
- `project_donation`
- `campaign_donation`
- `manual_admin_entry`

Kurban için `context_id = qurban_orders.id`, yetim hamiliği için `context_id = sponsorships.id` veya hazırlık aşamasında `sponsorship_applications.id`, genel bağış için ise donation kaydı varsa onun id değeri kullanılabilir.

## Payment Intents

`payment_intents` provider-bağımsız ödeme niyetidir. Tutar, para birimi, bağlam, donor hesabı, provider adı, provider referansı, idempotency key ve durum alanlarını tutar.

Hassas ödeme verisi saklanmaz. Kart numarası, CVV, banka şifresi, tam provider payload veya imza secret alanları bu tabloda yer almamalıdır.

## Payment Events ve Webhook Hazırlığı

`payment_events` ödeme niyetine bağlı olay geçmişini tutar. `payment_provider_events` ileride provider webhook event özetlerinin idempotent şekilde kaydedilmesi için hazırlandı.

9E'de canlı webhook endpoint'i yoktur. 10. aşamada provider callback geldiğinde signature doğrulaması yapılmalı, `provider_event_id` ve `idempotency_key` tekrar işleme karşı kontrol edilmelidir.

## Makbuz Hazırlığı

`receipts` ödeme niyeti veya bağlam üzerinden makbuz hazırlık durumunu izler. `pending`, `prepared`, `issued`, `cancelled` ve `failed` durumları desteklenir.

Bu aşamada PDF üretimi yoktur. `file_url` yalnızca manuel/demo hazırlık alanı olarak kalır.

## Bildirim Kuyruğu

`notification_queue` ödeme, makbuz, kurban ve sponsorluk bilgilendirmelerini provider bağımsız kuyruk olarak tutar. Kanal seçenekleri e-posta, SMS, WhatsApp ve sistem bildirimidir.

Bu aşamada gerçek gönderim yoktur. Kuyruk kayıtları admin ekranında read-only görünür.

## Idempotency

`payment_intents.idempotency_key` unique tutulur. `paymentWriteRepository.createPaymentIntent` aynı idempotency key ile tekrar çağrılırsa mevcut ödeme niyetini döndürür.

Provider callback entegrasyonu açıldığında `payment_provider_events.provider_event_id` ve event seviyesindeki `idempotency_key` alanları tekrar işleme karşı kullanılmalıdır.

## Server Repository

`lib/data/paymentWriteRepository.ts` server-only dosyadır ve service role client yalnızca burada kullanılır. Şu altyapı fonksiyonlarını sağlar:

- `createPaymentIntent`
- `getPaymentIntentById`
- `getPaymentIntentByIntentNo`
- `appendPaymentEvent`
- `appendPaymentStatusLog`
- `markPaymentPaid`
- `markPaymentFailed`
- `markPaymentCancelled`
- `markPaymentRefunded`
- `prepareReceiptForPayment`
- `createReceiptIfMissing`
- `enqueueNotification`
- `enqueueNotificationIfMissing`
- `appendPaymentProviderEvent`
- `markProviderEventProcessed`

`lib/data/paymentRepository.ts` read-only/admin görünüm için Supabase authenticated read dener, hata/timeout/RLS/migration eksikse güvenli mock fallback döner.

## Güvenlik ve RLS

- Public/anon ödeme, makbuz, bildirim ve event tablolarını okuyamaz.
- Authenticated donor yalnızca kendi `donor_account_id` ilişkili `payment_intents` ve `receipts` kayıtlarını okuyabilir.
- Admin/super_admin ödeme niyetleri, makbuzlar, bildirim kuyruğu, provider eventleri ve status loglarını okuyabilir.
- Insert/update/delete public veya client tarafına açılmaz.
- Service role client component'e veya public bundle'a taşınmaz.

## 9E.1 Stabilizasyon Notları

- `payment_intents`, `receipts`, `notification_queue`, `payment_events`, `payment_provider_events` ve `payment_status_logs` smoke test protected kapsamındadır.
- `sponsored_orphans_safe_view` anon erişime kapalı tutulur ve `security_invoker = true` migration ile sabitlenir.
- Admin ödeme, makbuz ve bildirim kuyruğu ekranlarında gerçek veri değişikliği yapan aksiyonlar pasif/demo görünür.
- Mock fallback, Supabase env eksikliği, RLS engeli, timeout veya migration eksikliğinde beyaz ekran yerine güvenli demo veri döndürür.
- Hata mesajları SQL detayı, secret, token, provider raw payload veya hassas ödeme verisi göstermemelidir.

## Provider Seçilmeden Önce

- Provider callback signature doğrulama yöntemi netleşmeli.
- Tutar ve para birimi server-side doğrulanmalı.
- Kurban, yetim ve genel bağış bağlamları için final durum geçişleri transaction içinde yapılmalı.
- Başarısız/iptal ödeme için quota release ve sponsorluk pasifleştirme stratejisi yazılmalı.
- Bildirim retry ve makbuz PDF üretimi ayrı güvenlik testinden geçmeli.
- PDF makbuz için private storage, erişim süresi, dosya silme ve audit stratejisi hazırlanmalı.
- Bildirim gönderimi için provider credential yönetimi, rate limit, retry ve opt-out/KVKK kuralları hazırlanmalı.
- Kart numarası, CVV, banka şifresi veya hassas ödeme payload saklanmayacağı tekrar doğrulanmalı.

## 10. Aşama

10. aşama gerçek ödeme sağlayıcısı entegrasyonudur. Bu aşamada provider seçimi, test ortamı anahtarları, webhook route'u, signature doğrulama, payment paid finalization, makbuz PDF üretimi ve gerçek bildirim gönderimi ayrı planlanmalıdır.

## 10A PayTR Test Entegrasyonu

10A ile PayTR iFrame API için test entegrasyonu hazırlığı eklendi. `payment_intents.provider = paytr` ve `payment_intents.provider_reference = merchant_oid` eşleştirmesiyle çalışır.

- Canlı ödeme alma kapalıdır.
- PayTR token isteği sadece server-side yapılır.
- Kullanıcı ok/fail dönüş sayfaları sipariş veya bağış onayı yapmaz.
- Kesin ödeme durumu `/api/paytr/callback` içinde hash doğrulaması ve idempotency kontrolüyle işlenir.
- Kart bilgisi, CVV veya hassas ödeme verisi Okyanus sisteminde saklanmaz.

## 10B Payment Intent Başlatma

10B ile ortak payment intent modeli modüllere bağlandı.

- Genel bağış formu `general_donation` payment intent oluşturur ve PayTR test ödeme sayfasına yönlendirir.
- Kurban siparişi başarıyla oluşunca `qurban_order` context_id ile payment intent oluşturulur.
- Yetim hamiliği admin eşleştirmesi sponsorship oluşturunca `orphan_sponsorship` context_id ile payment intent oluşturulur.
- `lib/payments/paymentContext.ts` bağlam tutarı, para birimi ve metadata üretimini ortaklaştırır.
- `createPaymentIntentForContext` aynı context için `draft/pending/initiated/requires_action` ödeme niyeti varsa onu tekrar kullanır.
- `paid/failed/cancelled/refunded/expired` kayıtlar yeni denemeden ayrı değerlendirilir.
- Genel bağışta ayrı donation tablosu kaydı bu aşamada açılmaz; bağış niyeti `payment_intents.metadata` içinde izlenir ve ileride genel bağış kayıt modeliyle ilişkilendirilecektir.

## 10C Finalization ve Callback Güvenliği

10C ile ödeme sonucu bağlamlara transaction güvenli RPC fonksiyonlarıyla uygulanır.

- PayTR callback event id formatı `paytr:merchant_oid:status:total_amount` olarak tutulur.
- Callback hash doğrulanmadan payment intent veya bağlam güncellenmez.
- `total_amount` server-side payment intent tutarıyla kuruş bazında karşılaştırılır.
- Terminal durumdaki `paid/failed/cancelled/refunded` kayıtlar yeniden finalize edilmez.
- Kurban paid sonucunda order/hisse durumları onaylanır, `quota_reserved` azalır ve `quota_completed` artar.
- Kurban failed/cancelled/refunded sonucunda rezervasyon serbest bırakılır, `quota_completed` artmaz.
- Yetim paid sonucunda sponsorship active olur, `last_payment_date` bugün ve `next_payment_date` +1 ay yapılır.
- Yetim failed/cancelled/refunded sonucunda sponsorluk active yapılmaz.
- Genel bağış için ayrı donation tablosu olmadığından finalization payment intent, receipt ve notification düzeyinde kalır.

Bu aşama canlı ödeme açmaz; gerçek PDF makbuz ve gerçek bildirim gönderimi sonraki entegrasyon aşamasındadır.

## 10D Makbuz PDF ve Private Storage

10D ile `receipts` kayıtları PDF dosya metadata alanlarıyla güçlendirildi:

- `file_bucket`
- `file_path`
- `file_mime_type`
- `file_size_bytes`
- `file_sha256`
- `generated_at`
- `generated_by`
- `version`
- `last_downloaded_at`

PDF dosyaları `receipts-private` Supabase Storage bucket içinde saklanır. Bucket public değildir; dosyalar public URL ile paylaşılmaz. Admin veya bağışçı erişimi `/api/receipts/[receiptNo]/download` route'u üzerinden session, rol ve `donor_account_id` kontrolünden sonra verilir.

Admin PDF hazırlama akışı `app/admin/makbuzlar/actions.ts` içinde server action olarak çalışır. Sadece paid payment intent ilişkili, iptal edilmemiş receipt için PDF üretilebilir. Bu aşamada PDF status `prepared` olur; resmi/mali `issued` onayı sonraki aşamada tasarlanacaktır.

PDF üretim action'ı önce diagnostic/repair çalıştırır. Storage içinde PDF object var ama `receipts.file_path` boşsa dosya indirilip hash ve boyut tekrar hesaplanır, DB metadata onarılır ve admin ekranı `pdf-onarildi` sonucu ile yenilenir. Upload sonrası DB tekrar okunur; `file_path` doğrulanmadan işlem başarılı sayılmaz.
