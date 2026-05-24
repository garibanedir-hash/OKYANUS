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
- `prepareReceiptForPayment`
- `enqueueNotification`

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
