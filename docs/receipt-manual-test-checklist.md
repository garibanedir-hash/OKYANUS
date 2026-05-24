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
- [ ] Ekran veri kaynağı badge'i `Supabase receipts` gösteriyor; demo ise PDF üretimi kapalı.
- [ ] Payment paid değilse PDF Hazırla disabled veya güvenli hata veriyor.
- [ ] Cancelled receipt için PDF üretilemiyor.
- [ ] PDF Hazırla sonrası `file_path` doluyor.
- [ ] `file_bucket = receipts-private`.
- [ ] `file_sha256` doluyor.
- [ ] `file_size_bytes` doluyor.
- [ ] `generated_at` doluyor.
- [ ] Receipt status `prepared` oluyor.
- [ ] İşlem sonrası `/admin/makbuzlar?durum=pdf-hazirlandi` veya `pdf-onarildi` sonucuyla dönüyor.
- [ ] Sayfa yenilenince “PDF Görüntüle” linki görünüyor.

## 10E Kurumsal PDF Tasarım Kontrolü

- [ ] PDF A4 portre düzeninde tek sayfaya sığıyor.
- [ ] Üst alanda resmi `public/brand/logo.png` logosu oranı bozulmadan görünüyor.
- [ ] Logo embed edilemezse metinsel marka fallback'i oluşuyor ve PDF üretimi kırılmıyor.
- [ ] Makbuz No, Ödeme No, Tarih ve Durum üst sağ meta alanında okunaklı.
- [ ] Ana başlık `BAĞIŞ MAKBUZU` lacivert kurumsal hiyerarşiyle görünüyor.
- [ ] Bağışçı bilgileri panelinde eksik alanlar `-` olarak görünüyor.
- [ ] Bağış özeti tablosunda açıklama, tutar, adet ve toplam alanları hizalı.
- [ ] Toplam tutar turkuaz vurgulu alanda tek bakışta bulunuyor.
- [ ] Kurumsal şeffaflık ve teşekkür notları okunaklı.
- [ ] PDF içinde kart bilgisi, PayTR hash, merchant key/salt, raw payload, service role veya internal user id yok.
- [ ] Gilroy font dosyası yoksa Helvetica/Helvetica-Bold fallback ile çıktı okunaklı kalıyor.

## 10E.1 Font ve Layout Kontrolü

- [ ] `app/fonts/Gilroy-Bold.woff2` ve `app/fonts/Gilroy-Black.woff2` lisanslı dosyalarla eklendiyse build başarılı.
- [ ] Font dosyaları yoksa build kırılmıyor ve site Inter/Arial/system fallback ile açılıyor.
- [ ] Başlık, buton ve güçlü UI alanları `var(--font-brand)` tokenından besleniyor.
- [ ] Gövde metinleri sadece Bold/Black dosyaları varken aşırı kalın görünmüyor.
- [ ] PDF içinde uzun e-posta/makbuz/ödeme no alanları panel dışına taşmıyor.
- [ ] Bağış özeti tablosunda tutar, adet ve toplam kolonları üst üste binmiyor.
- [ ] Toplam tutar kutusu sağ hizalı ve okunaklı.
- [ ] Footer sayfa dışına taşmıyor.
- [ ] Mevcut eski PDF dosyalarının yeniden üretilmeden otomatik değişmediği doğrulandı.

## Repair Senaryoları

- [ ] Storage içinde expected path object var ama `receipts.file_path` boşsa PDF Hazırla metadata repair yapıyor.
- [ ] Expected path yok ama `receipt_no` içeren object varsa repair o object ile metadata güncelliyor.
- [ ] Repair sonrası `file_bucket`, `file_path`, `file_sha256`, `file_size_bytes`, `generated_at` doluyor.
- [ ] Upload başarılı ama metadata update başarısız olursa işlem başarılı sayılmıyor ve diagnostic log yazıyor.
- [ ] İkinci denemede var olan storage object DB metadata ile eşleştirilebiliyor.
- [ ] `file_path` doluysa tekrar üretim yapılmıyor ve “PDF zaten hazır” davranışı görülüyor.

## Görüntüleme

- [ ] Admin `/api/receipts/[receiptNo]/download` ile PDF görüntüleyebiliyor.
- [ ] Donor kendi `donor_account_id` ile eşleşen makbuzu görüntüleyebiliyor.
- [ ] Başka donor aynı makbuzu açamıyor.
- [ ] Anon/public kullanıcı 401 veya 403 alıyor.
- [ ] `donor_account_id = null` kayıt donor panelinde otomatik açılmıyor.
- [ ] Download response `Content-Type: application/pdf`.
- [ ] Download response `Content-Disposition: inline`.
- [ ] `file_path` dolu ama storage object yoksa admin download 404 ile dosya kaydı/storage tutarsızlığını bildiriyor.

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
