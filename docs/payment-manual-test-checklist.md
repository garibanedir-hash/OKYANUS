# Payment Manual Test Checklist

Bu checklist 9E ve 9E.1 ortak ödeme altyapısını staging ortamında manuel doğrulamak için kullanılır. Gerçek kişisel veri kullanmayın.

## Migration Kontrolü

- [ ] `014_common_payment_receipt_notification_infrastructure.sql` uygulandı.
- [ ] `015_fix_sponsored_orphans_safe_view_security.sql` uygulandı.
- [ ] `payment_intents` tablosu var.
- [ ] `payment_events` tablosu var.
- [ ] `payment_provider_events` tablosu var.
- [ ] `receipts` tablosu var.
- [ ] `notification_queue` tablosu var.
- [ ] `payment_status_logs` tablosu var.

## Admin Ekran Kontrolü

- [ ] `/admin/odeme-kayitlari` açılıyor.
- [ ] `/admin/makbuzlar` açılıyor.
- [ ] `/admin/bildirim-kuyrugu` açılıyor.
- [ ] Empty state düzgün görünüyor.
- [ ] Mock fallback devreye girdiğinde ekran beyaz sayfa vermiyor.
- [ ] Manuel ödeme, PDF ve tekrar gönderim aksiyonları pasif/demo.

## Smoke Test Kontrolü

- [ ] `npm run test:supabase` çalıştı.
- [ ] `Security warning: 0`.
- [ ] `Missing table: 0`.
- [ ] Payment tabloları `OK - protected` görünüyor.
- [ ] `sponsored_orphans_safe_view` anon/publishable key ile protected görünüyor.

## RLS Kontrolü

- [ ] Public/anon payment tablolarını okuyamıyor.
- [ ] Public/anon `receipts` okuyamıyor.
- [ ] Public/anon `notification_queue` okuyamıyor.
- [ ] Public/anon `payment_provider_events` okuyamıyor.
- [ ] Donor yalnızca kendi `donor_account_id` ilişkili payment/receipt kayıtlarını okuyacak şekilde RLS hazır.
- [ ] Admin/super_admin kayıtları okuyabiliyor.

## Örnek Manuel Test SQL

Staging'de gerçek kişi bilgisi kullanmadan service role veya SQL editor ile örnek kayıt hazırlanabilir:

```sql
insert into public.payment_intents (
  context_type,
  donor_name,
  donor_email,
  donor_phone,
  amount,
  currency,
  provider,
  status,
  metadata
) values (
  'manual_admin_entry',
  'Demo Destekçi',
  'demo@example.org',
  '+90 500 000 00 00',
  100,
  'TRY',
  'manual',
  'pending',
  '{"summary":"9E.1 manuel test kaydı"}'::jsonb
);
```

Bu kayıt gerçek ödeme değildir. Kart bilgisi, CVV, banka bilgisi veya gerçek bağışçı verisi eklemeyin.

## Gerçek Entegrasyon Notu

- [ ] Gerçek ödeme sağlayıcısı bağlı değil.
- [ ] Gerçek webhook yok.
- [ ] Gerçek PDF makbuz yok.
- [ ] Gerçek SMS/e-posta gönderimi yok.
- [ ] 10. aşama öncesi provider seçimi, signature doğrulama ve idempotency planı tamamlanacak.

## 10A PayTR Test Kontrolü

- [ ] `.env` içinde PayTR test credential değerleri server-only olarak tanımlandı.
- [ ] `NEXT_PUBLIC_SITE_URL` doğru staging domain'ini gösteriyor.
- [ ] PayTR Merchant Panel Bildirim URL değeri `https://domain.com/api/paytr/callback`.
- [ ] Test payment intent için `provider = paytr` ve `provider_reference` merchant_oid olarak kaydediliyor.
- [ ] `/odeme/paytr/[intentNo]` env eksikse güvenli hata gösteriyor.
- [ ] PayTR test env varsa iframe token alınabiliyor.
- [ ] Callback hash yanlışsa `OK` dönmüyor.
- [ ] Callback hash doğruysa `payment_provider_events` kaydı oluşuyor.
- [ ] Success callback `payment_intents.status = paid` yapıyor.
- [ ] Failed callback `payment_intents.status = failed` yapıyor.
- [ ] Duplicate callback sadece `OK` dönüyor ve finalization tekrar çalışmıyor.

Örnek PayTR test intent SQL'i:

```sql
insert into public.payment_intents (
  context_type,
  donor_name,
  donor_email,
  donor_phone,
  amount,
  currency,
  provider,
  status,
  metadata
) values (
  'manual_admin_entry',
  'PayTR Demo Destekçi',
  'paytr-demo@example.org',
  '+90 500 000 00 00',
  100,
  'TRY',
  'paytr',
  'pending',
  '{"summary":"10A PayTR test payment intent"}'::jsonb
);
```
