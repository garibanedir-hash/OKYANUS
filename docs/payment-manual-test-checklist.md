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

## 10B Modül Bağlantı Testleri

- [ ] `/bagis-yap` formunda ad soyad, e-posta, tutar ve KVKK olmadan submit engelleniyor.
- [ ] Geçerli genel bağış formu `payment_intents.context_type = general_donation` ve `provider = paytr` kaydı oluşturuyor.
- [ ] Genel bağış başarılı olunca `/odeme/paytr/[intentNo]` adresine yönleniyor.
- [ ] PayTR env eksikken ödeme sayfası güvenli hata mesajı gösteriyor ve teknik merchant/hash detayı göstermiyor.
- [ ] Yeni kurban başvurusu sonrası `payment_intents.context_type = qurban_order` ve `context_id = qurban_orders.id` oluşuyor.
- [ ] Kurban başarı ekranında Ödeme No ve “Ödemeye Devam Et” bağlantısı görünüyor.
- [ ] `/panel/kurbanlarim` pending/initiated payment intent için “Ödemeye Devam Et” gösteriyor; paid durumda göstermiyor.
- [ ] Yetim eşleştirme sonrası `payment_intents.context_type = orphan_sponsorship` ve `context_id = sponsorships.id` oluşuyor.
- [ ] `/panel/yetim-sponsorluk` payment_pending sponsorship için “Ödemeye Devam Et” gösteriyor; active/paid durumda “Destek aktif” gösteriyor.
- [ ] Admin ödeme kayıtları ekranında yeni intent'ler PayTR provider ve doğru durum etiketiyle görünüyor.
- [ ] PayTR success callback sonrası `payment_intents.status = paid`, receipt hazırlık kaydı ve notification_queue sistem kaydı oluşuyor.
- [ ] Kurban paid callback sonrası `qurban_orders.payment_status = paid`, `qurban_orders.order_status = payment_confirmed`, `qurban_shares.status = payment_confirmed` doğrulanıyor.
- [ ] Yetim paid callback sonrası `sponsorships.payment_status = paid`, `sponsorships.status = active` doğrulanıyor.
- [ ] Duplicate callback finalization tekrar çalıştırmıyor.

## 10C Finalization ve Callback Replay Testleri

- [ ] `016_payment_finalization_and_context_state.sql` staging ortamında çalıştırıldı.
- [ ] PayTR callback `provider_event_id = paytr:merchant_oid:status:total_amount` formatıyla kaydediliyor.
- [ ] Yanlış hash `OK` dönmüyor ve ödeme durumunu değiştirmiyor.
- [ ] `total_amount` uyuşmazlığı ödeme niyetini `paid` yapmıyor.
- [ ] Duplicate paid callback kurban `quota_completed` değerini ikinci kez artırmıyor.
- [ ] Duplicate paid callback sponsorluk `next_payment_date` değerini ikinci kez ötelemiyor.
- [ ] Kurban failed/cancelled callback `quota_reserved` değerini serbest bırakıyor ve `quota_completed` değerini artırmıyor.
- [ ] Yetim failed/cancelled callback sponsorluğu active yapmıyor.
- [ ] Paid callback sonrası aynı payment intent için tek receipt kaydı oluşuyor.
- [ ] Paid/failed/cancelled callback sonrası aynı template/payment için duplicate notification oluşmuyor.
- [ ] `docs/paytr-callback-idempotency-test.md` senaryoları staging testinde tamamlandı.

## 10D Makbuz PDF Testleri

- [ ] `017_receipt_pdf_private_storage.sql` staging ortamında çalıştırıldı.
- [ ] `receipts-private` bucket var ve public değil.
- [ ] Paid payment intent ilişkili receipt için admin PDF hazırlayabiliyor.
- [ ] Payment paid değilse PDF üretimi engelleniyor.
- [ ] Cancelled receipt için PDF üretimi engelleniyor.
- [ ] PDF private bucket'a yükleniyor ve `file_path` doluyor.
- [ ] `file_sha256`, `file_size_bytes`, `generated_at` ve `version` doluyor.
- [ ] Admin `/api/receipts/[receiptNo]/download` ile PDF açabiliyor.
- [ ] Donor yalnızca kendi `donor_account_id` ilişkili makbuzunu açabiliyor.
- [ ] Anon ve farklı donor erişimi engelleniyor.
- [ ] `docs/receipt-manual-test-checklist.md` tamamlandı.
