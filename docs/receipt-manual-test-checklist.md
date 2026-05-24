# Receipt PDF Manual Test Checklist

Bu checklist 10D makbuz PDF ve private storage altyapısını staging ortamında doğrulamak için kullanılır.

## Migration ve Storage

- [ ] `017_receipt_pdf_private_storage.sql` staging ortamında uygulandı.
- [ ] `receipts` tablosunda `file_bucket`, `file_path`, `file_sha256`, `file_size_bytes`, `generated_at`, `version` kolonları var.
- [ ] `receipts-private` bucket var.
- [ ] `receipts-private` bucket `public = false`.
- [ ] Bucket allowed mime type `application/pdf`.
- [ ] Public/anon storage erişimi yok.

## PDF Hazırlama

- [ ] Paid payment intent için receipt kaydı oluştu.
- [ ] Admin `/admin/makbuzlar` ekranında PDF Hazırla butonunu görüyor.
- [ ] Payment paid değilse PDF Hazırla disabled veya güvenli hata veriyor.
- [ ] Cancelled receipt için PDF üretilemiyor.
- [ ] PDF Hazırla sonrası `file_path` doluyor.
- [ ] `file_bucket = receipts-private`.
- [ ] `file_sha256` doluyor.
- [ ] `file_size_bytes` doluyor.
- [ ] `generated_at` doluyor.
- [ ] Receipt status `prepared` oluyor.

## Görüntüleme

- [ ] Admin `/api/receipts/[receiptNo]/download` ile PDF görüntüleyebiliyor.
- [ ] Donor kendi `donor_account_id` ile eşleşen makbuzu görüntüleyebiliyor.
- [ ] Başka donor aynı makbuzu açamıyor.
- [ ] Anon/public kullanıcı 401 veya 403 alıyor.
- [ ] `donor_account_id = null` kayıt donor panelinde otomatik açılmıyor.
- [ ] Download response `Content-Type: application/pdf`.
- [ ] Download response `Content-Disposition: inline`.

## Audit ve Güvenlik

- [ ] PDF üretimi `receipt.pdf.generate` audit kaydı yazıyor.
- [ ] Admin download `receipt.download.admin` audit kaydı yazıyor.
- [ ] Donor download `receipt.download.donor` audit kaydı yazıyor.
- [ ] Audit hatası PDF indirmeyi bozmuyor.
- [ ] PDF içinde kart bilgisi, hash, PayTR key/salt veya raw provider payload yok.
- [ ] Client HTML içinde storage `file_path` doğrudan yetki olarak kullanılmıyor.

## Genel Testler

- [ ] `npm run lint` başarılı.
- [ ] `npm run build` başarılı.
- [ ] `npm run check:supabase-env` başarılı.
- [ ] `npm run test:supabase` sonucu `Security warning: 0`.
- [ ] `npm run test:supabase` sonucu `Missing table: 0`.
- [ ] `receipts` protected kalıyor.
- [ ] Storage bucket private kontrolü manuel tamamlandı.
