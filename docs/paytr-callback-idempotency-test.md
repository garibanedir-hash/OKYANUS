# PayTR Callback Idempotency Test Checklist

Bu doküman 10C aşamasında PayTR callback sonucunun güvenli, idempotent ve bağlam bazlı finalize edildiğini kontrol etmek için kullanılır. Canlı ödeme açma dokümanı değildir.

## Ön Koşullar

- [ ] `014_common_payment_receipt_notification_infrastructure.sql` staging ortamında uygulanmış.
- [ ] `016_payment_finalization_and_context_state.sql` staging ortamında uygulanmış.
- [ ] PayTR callback endpoint'i HTTPS domain üzerinde erişilebilir: `https://domain.com/api/paytr/callback`.
- [ ] `PAYTR_MERCHANT_KEY` ve `PAYTR_MERCHANT_SALT` sadece server env olarak tanımlı.
- [ ] Public/anon payment tablolarını okuyamıyor.

## Örnek Callback Payload

Gerçek testte hash PayTR test credential ile üretilmelidir. Bu örnek gerçek ödeme değildir.

```text
merchant_oid=PAY2026000001
status=success
total_amount=10000
payment_amount=10000
currency=TL
payment_type=card
installment_count=0
test_mode=1
hash=<paytr-callback-hash>
```

## Hash Doğrulama Testi

- [ ] Yanlış `hash` gönderildiğinde endpoint `OK` dönmüyor.
- [ ] Yanlış `hash` için `payment_provider_events.signature_verified = false` kaydı oluşuyor.
- [ ] Doğru `hash` ile callback işleniyor.
- [ ] Callback endpoint session/auth guard kullanmıyor.

## Duplicate Callback Testi

- [ ] Aynı `merchant_oid`, `status`, `total_amount` ikinci kez gönderildiğinde event idempotent karşılanıyor.
- [ ] `provider_event_id = paytr:merchant_oid:status:total_amount` formatında kayıt oluşuyor.
- [ ] `payment_provider_events.processed = true` olan event yeniden finalization çalıştırmıyor.
- [ ] Terminal durumdaki `paid/failed/cancelled/refunded` payment intent yeniden işlenmiyor ve yalnızca düz metin `OK` dönüyor.

## Tutar ve Para Birimi Uyuşmazlığı

- [ ] `total_amount`, `payment_intents.amount * 100` ile karşılaştırılıyor.
- [ ] Tutar uyuşmazsa payment intent `paid` yapılmıyor.
- [ ] Tutar uyuşmazlığı `payment_events.raw_event_summary` içinde özetleniyor.
- [ ] `currency` geldiyse `TL/TRY` normalize edilerek doğrulanıyor.

## Paid Callback Testi

- [ ] `status=success` sonrası `payment_intents.status = paid`.
- [ ] `paid_at` set ediliyor.
- [ ] `payment_events` içinde `provider_callback_received` ve `paid` izi var.
- [ ] `payment_status_logs` içinde bağlam finalization izi var.
- [ ] `receipts` içinde aynı payment intent için tek hazırlık kaydı oluşuyor.
- [ ] `notification_queue` içinde aynı template/payment için tek kayıt oluşuyor.

## Failed/Cancelled Callback Testi

- [ ] Failed callback sonrası `payment_intents.status = failed`.
- [ ] Cancelled callback sonrası `payment_intents.status = cancelled`.
- [ ] Failed/cancelled durumunda paid finalization çalışmıyor.
- [ ] Bağlama göre quota release veya sponsorluk pasif bekleme davranışı idempotent çalışıyor.

## Kurban Finalization Kontrolü

- [ ] `qurban_orders.payment_status = paid`.
- [ ] `qurban_orders.order_status = payment_confirmed`.
- [ ] `qurban_shares.status = payment_confirmed`.
- [ ] `qurban_campaigns.quota_reserved` hisse sayısı kadar azalıyor.
- [ ] `qurban_campaigns.quota_completed` hisse sayısı kadar artıyor.
- [ ] Duplicate paid callback `quota_completed` değerini ikinci kez artırmıyor.
- [ ] Failed/cancelled callback `quota_reserved` değerini serbest bırakıyor, `quota_completed` değerini artırmıyor.

## Yetim Sponsorluk Kontrolü

- [ ] `sponsorships.payment_status = paid`.
- [ ] `sponsorships.status = active`.
- [ ] `last_payment_date = current_date`.
- [ ] `next_payment_date = current_date + 1 month`.
- [ ] Duplicate paid callback `next_payment_date` değerini ikinci kez ötelemiyor.
- [ ] Failed/cancelled callback sponsorluğu `active` yapmıyor.

## Genel Bağış Kontrolü

- [ ] `general_donation` payment intent paid oluyor.
- [ ] Ayrı donation tablosu olmadığı için finalization payment intent + receipt + notification düzeyinde kalıyor.
- [ ] İleride bağış geçmişi modeli eklendiğinde `context_id` veya metadata üzerinden ilişki kurulacak.

## Kayıt Kontrolleri

- [ ] `payment_provider_events.processed` doğru set ediliyor.
- [ ] `payment_events` içinde callback ve status eventleri var.
- [ ] `payment_status_logs` içinde finalization/release izi var.
- [ ] Secret, merchant key/salt, kart bilgisi veya hassas payload loglanmıyor.
