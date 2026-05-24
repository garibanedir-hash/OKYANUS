# PayTR Test Entegrasyonu

Bu doküman 10A aşamasında eklenen PayTR iFrame API test entegrasyonu hazırlığını açıklar. Bu aşama canlı ödeme alma aşaması değildir.

Referans: PayTR iFrame API 1. adım ve 2. adım dokümantasyonu (`https://dev.paytr.com/iframe-api/iframe-api-1-adim`, `https://dev.paytr.com/iframe-api/iframe-api-2-adim`).

## Amaç

- Ortak `payment_intents` modeli üzerinden PayTR test iframe akışını başlatmak.
- PayTR `merchant_oid` değerini ödeme niyetiyle güvenli biçimde eşleştirmek.
- Başarılı/başarısız kullanıcı dönüş sayfalarını yalnızca bilgilendirme sayfası olarak tutmak.
- Asıl ödeme sonucunu `/api/paytr/callback` Bildirim URL endpoint’inde hash doğrulaması ve idempotency kontrolüyle işlemek.

## Env Değişkenleri

`.env.example` içine eklenen değişkenler:

- `PAYTR_MERCHANT_ID`
- `PAYTR_MERCHANT_KEY`
- `PAYTR_MERCHANT_SALT`
- `PAYTR_TEST_MODE=true`
- `PAYTR_DEBUG_ON=true`
- `PAYTR_IFRAME_TOKEN_URL=https://www.paytr.com/odeme/api/get-token`
- `NEXT_PUBLIC_SITE_URL`

`PAYTR_MERCHANT_KEY` ve `PAYTR_MERCHANT_SALT` server-only kalır. Client component, public env veya bundle içine taşınmaz.

## Token Alma

`lib/payments/paytr.ts` içindeki `requestPaytrIframeToken` fonksiyonu PayTR token isteğini server-side yapar.

PayTR iFrame dokümanına göre `payment_amount` kuruş formatında integer gönderilir. Örneğin `34.56 TL` için `3456` gönderilir.

`user_basket` base64 JSON formatında hazırlanır. Kart bilgisi Okyanus sisteminde toplanmaz veya saklanmaz.

## merchant_oid Eşleştirmesi

PayTR `merchant_oid` alanı için `payment_intents.intent_no` değerinden güvenli, alfanumerik bir referans üretilir:

- `PAY-2026-000004` → `PAY2026000004`

Bu değer `payment_intents.provider_reference` alanına yazılır ve callback sırasında önce bu referansla ödeme niyeti aranır.

## OK / FAIL Sayfaları

`/odeme/basarili` ve `/odeme/basarisiz` sayfaları ödeme onayı veya iptali yapmaz.

Bu sayfalar yalnızca kullanıcı bilgilendirmesidir. Kesin sonuç PayTR Bildirim URL callback’i ile doğrulanır.

## Callback / Bildirim URL

Endpoint:

```text
https://domain.com/api/paytr/callback
```

PayTR Merchant Panel’de Bildirim URL bu adrese ayarlanmalıdır.

Callback route’u:

- Session veya kullanıcı oturumu kullanmaz.
- `merchant_oid`, `status`, `total_amount`, `hash` alanlarını doğrular.
- Hash yanlışsa `OK` dönmez.
- Hash doğruysa ödeme niyetini bulur.
- Duplicate callback durumunda tekrar finalization çalıştırmadan yalnızca `OK` döner.
- Yanıt olarak sadece düz metin `OK` üretir.

## Hash Doğrulama

Callback hash doğrulaması PayTR’nin bildirdiği sırayla yapılır:

```text
merchant_oid + merchant_salt + status + total_amount
```

Sonuç `PAYTR_MERCHANT_KEY` ile HMAC-SHA256 hesaplanıp base64 formatında karşılaştırılır.

## Idempotency

Callback event referansı şu şekilde oluşturulur:

```text
paytr:merchant_oid:status:total_amount
```

`payment_provider_events` içinde daha önce işlenmiş event varsa ödeme durumu tekrar güncellenmez. `payment_intents` zaten terminal durumda ise context finalization tekrar çalıştırılmaz.

10C ile callback güvenliği sıkılaştırıldı:

- Hash doğrulaması payment intent güncellemesinden önce yapılır.
- `total_amount`, server-side `payment_intents.amount * 100` değeriyle karşılaştırılır.
- `currency` geldiyse `TL/TRY` normalize edilerek doğrulanır.
- Tutar veya para birimi uyuşmazlığında ödeme `paid` yapılmaz ve provider event processed sayılmaz.
- Paid/failed/cancelled/refunded terminal durumlar tekrar finalization çalıştırmaz.

## 10B Payment Intent Başlatma

10B ile payment intent oluşturma akışı modüllere bağlandı:

- `/bagis-yap` genel bağış formu server action ile `general_donation` payment intent oluşturur ve `/odeme/paytr/[intentNo]` adresine yönlendirir.
- `/kurban/bagis` kurban siparişi başarılı oluştuğunda `qurban_order` payment intent oluşturur.
- Admin yetim eşleştirme akışı sponsorship oluşturduktan sonra `orphan_sponsorship` payment intent oluşturur.

Tutarlar client güvenine bırakılmaz:

- Genel bağışta tutar server action içinde normalize edilir ve minimum tutar doğrulanır.
- Kurban tutarı `qurban_orders.total_amount` / kampanya birim bedeli üzerinden gelir.
- Yetim sponsorluğu tutarı `sponsorships.monthly_amount` / program tutarı üzerinden gelir.

PayTR test env eksikse ödeme sayfası güvenli şekilde “Ödeme sağlayıcı test bilgileri tanımlı değil” mesajı gösterir. Payment intent yine admin ekranında görülebilir.

## 10B Finalization Hazırlığı

`lib/payments/paymentFinalization.ts` içinde bağlam bazlı hazırlık fonksiyonları vardır:

- `finalizePaidPaymentIntent`
- `handleFailedPaymentIntent`
- `handleCancelledPaymentIntent`
- `handleRefundedPaymentIntent`

10B itibarıyla:

- Kurban için `qurban_orders.payment_status = paid`, `qurban_orders.order_status = payment_confirmed` ve `qurban_shares.status = payment_confirmed` güncellenebilir.
- Kurban `quota_completed` finalizasyonu transaction güvenliği için 10C aşamasına bırakılır.
- Yetim sponsorluğu için `sponsorships.payment_status = paid`, `sponsorships.status = active` ve `last_payment_date` güncellenebilir.
- Yetim `next_payment_date` yenileme stratejisi 10C/10D aşamasında netleştirilecektir.
- Makbuz hazırlık kaydı ve sistem bildirim kuyruğu hazırlanır.

## 10C Finalization

10C ile bağlam finalization işlemleri `016_payment_finalization_and_context_state.sql` içindeki transaction güvenli RPC fonksiyonlarına taşındı:

- `finalize_qurban_payment`: kurban siparişini paid/payment_confirmed yapar, hisseleri onaylar, `quota_reserved` değerini azaltıp `quota_completed` değerini artırır.
- `release_qurban_payment_reservation`: failed/cancelled/refunded ödemelerde rezervasyonu idempotent şekilde serbest bırakır.
- `finalize_orphan_sponsorship_payment`: sponsorluğu active yapar, `last_payment_date` ve `next_payment_date` değerlerini ayarlar.
- `handle_orphan_sponsorship_payment_failed`: başarısız/iptal ödemede sponsorluğu active yapmadan `payment_pending` durumunda bırakır.
- `finalize_general_donation_payment`: genel bağış için payment intent, receipt ve notification düzeyinde finalization yapar.

RPC fonksiyonları public/anon/authenticated tarafından doğrudan çalıştırılmaz; server-only service role katmanından çağrılır.

## Production Öncesi

- PayTR mağaza sözleşmesi ve dernek yetkileri tamamlanmalı.
- Test kartlarıyla uçtan uca deneme yapılmalı.
- Bildirim URL HTTPS olarak PayTR panelde doğrulanmalı.
- Duplicate callback testi yapılmalı.
- KVKK, mesafeli satış/bağış metinleri ve muhasebe süreçleri hukuk/mali müşavir onayından geçmeli.
- `PAYTR_TEST_MODE=false` yalnızca onaylı production geçişinde kullanılmalı.
