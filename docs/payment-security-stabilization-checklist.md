# 9E.1 Payment Security Stabilization Checklist

Bu checklist gerçek ödeme entegrasyonuna geçmeden önce ortak ödeme, makbuz ve bildirim altyapısının güvenlik ve operasyon hazırlığını kontrol etmek için kullanılır.

## Supabase Security Advisor

- [ ] Supabase Security Advisor çalıştırıldı.
- [ ] `public.sponsored_orphans_safe_view` için security definer view uyarısı yok.
- [ ] Payment tabloları için public exposure uyarısı yok.
- [ ] RLS disabled uyarısı yok.
- [ ] Gereksiz anon grant uyarısı yok.

## RLS Public/Protected Kontrolü

- [ ] `payment_intents` public/anon erişime kapalı.
- [ ] `payment_events` public/anon erişime kapalı.
- [ ] `payment_provider_events` public/anon erişime kapalı.
- [ ] `receipts` public/anon erişime kapalı.
- [ ] `notification_queue` public/anon erişime kapalı.
- [ ] `payment_status_logs` public/anon erişime kapalı.
- [ ] `sponsored_orphans_safe_view` anon erişime kapalı.
- [ ] Authenticated donor yalnızca kendi `donor_account_id` ilişkili `payment_intents` ve `receipts` kayıtlarını okuyabiliyor.
- [ ] Admin/super_admin payment, receipt, provider event, notification queue ve status log kayıtlarını okuyabiliyor.

## Client Bundle ve Secret Kontrolü

- [ ] `lib/data/paymentWriteRepository.ts` başında `import "server-only";` var.
- [ ] Client componentler `paymentWriteRepository` import etmiyor.
- [ ] `SUPABASE_SECRET_KEY` veya `SUPABASE_SERVICE_ROLE_KEY` client bundle'a taşınmıyor.
- [ ] Kart numarası, CVV, banka şifresi veya tam provider payload saklanmıyor.
- [ ] Hata mesajları SQL detayı, secret, token veya provider raw payload göstermiyor.

## Env ve Deploy Kontrolü

- [ ] `.env.local` Git'e dahil değil.
- [ ] `.env`, `.env.local`, `.env.*.local` `.gitignore` içinde.
- [ ] Vercel production env içinde `SUPABASE_SECRET_KEY`/`SUPABASE_SERVICE_ROLE_KEY` yalnızca server environment olarak tanımlı.
- [ ] `NEXT_PUBLIC_ADMIN_DEMO_MODE=false` production öncesi doğrulandı.
- [ ] `SITE_MAINTENANCE_MODE` yayın stratejisine göre kontrol edildi.
- [ ] Production deploy loglarında test kullanıcı şifresi veya secret yazmıyor.

## Admin Ekranları

- [ ] `/admin/odeme-kayitlari` read-only çalışıyor.
- [ ] `/admin/makbuzlar` read-only listeyi gösteriyor; PDF üretimi yalnızca server action ile admin yetkisinden sonra çalışıyor.
- [ ] `/admin/bildirim-kuyrugu` read-only çalışıyor.
- [ ] Supabase okunamazsa mock fallback beyaz ekran vermeden açılıyor.
- [ ] Manuel ödendi ve tekrar gönder aksiyonları pasif/demo olarak net.

## Entegrasyon Öncesi Blokajlar

- [ ] Canlı provider API çağrısı yok.
- [ ] Canlı webhook endpoint'i yok.
- [ ] Gerçek ödeme alma yok.
- [ ] Gerçek PDF makbuz üretimi yok.
- [ ] Gerçek SMS/e-posta/WhatsApp gönderimi yok.
- [ ] Provider seçilmeden önce webhook signature, idempotency, tutar doğrulama ve finalization transaction planı tamamlanacak.

## 10A PayTR Test Güvenlik Kontrolü

- [ ] `PAYTR_MERCHANT_KEY` ve `PAYTR_MERCHANT_SALT` sadece server env olarak tanımlı.
- [ ] PayTR credential değerleri `NEXT_PUBLIC_` prefix'iyle kullanılmıyor.
- [ ] `/odeme/paytr/[intentNo]` kart bilgisi toplamıyor; yalnızca PayTR iframe gösteriyor.
- [ ] `/api/paytr/callback` session veya auth guard kullanmıyor.
- [ ] Callback hash doğrulaması yapılmadan `payment_intents.status` güncellenmiyor.
- [ ] Duplicate callback tekrar finalization çalıştırmıyor.
- [ ] Callback response başarılı işlemde sadece düz metin `OK`.
- [ ] Test mode kapatılmadan production ödeme açılmıyor.

## 10B Payment Intent Başlatma Kontrolü

- [ ] Genel bağış formu payment intent oluştururken amount/e-posta/KVKK server-side doğrulanıyor.
- [ ] Kurban payment intent tutarı client input'tan değil oluşturulan order toplamından alınıyor.
- [ ] Yetim sponsorship payment intent tutarı sponsorship/program kaydından alınıyor.
- [ ] `paymentWriteRepository` aynı context için pending/initiated intent'i tekrar kullanıyor.
- [ ] Client componentler `paymentWriteRepository`, service role veya PayTR secret import etmiyor.
- [ ] Paid callback sonrası sınırlı context finalization duplicate callback ile tekrar çalışmıyor.

## 10D Receipt Private Storage Kontrolü

- [ ] `receipts-private` bucket Supabase Storage panelinde `public = false`.
- [ ] Smoke test storage bucket public durumunu otomatik doğrulamıyorsa manuel kontrol tamamlandı.
- [ ] Receipt PDF download sadece `/api/receipts/[receiptNo]/download` üzerinden yapılıyor.
- [ ] Anon/public makbuz dosyası okuyamıyor.
- [ ] Admin/super_admin ve receipt sahibi donor dışında PDF erişimi yok.
- [ ] Service role sadece server-only receipt storage servisinde kullanılıyor.
