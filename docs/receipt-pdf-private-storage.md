# 10D/10E Makbuz PDF ve Private Storage Altyapısı

## Amaç

10D aşaması, ödeme sonrası oluşan `receipts` kayıtları için PDF hazırlanmasını, dosyanın Supabase private storage içinde saklanmasını ve yalnızca yetkili admin/bağışçı erişimiyle görüntülenmesini hazırlar. 10E aşaması aynı güvenli akışı bozmadan PDF çıktısını Okyanus kurumsal kimliğine uygun, profesyonel bir bağış makbuzu şablonuna taşır. Bu aşama canlı ödeme veya gerçek muhasebe entegrasyonu değildir.

## Makbuz PDF Akışı

1. Payment intent paid olur.
2. 10C finalization `receipts` hazırlık kaydı oluşturur.
3. Admin `/admin/makbuzlar` ekranından PDF hazırlar.
4. Server action receipt ve payment intent durumunu doğrular.
5. PDF buffer server-side üretilir.
6. Dosya `receipts-private` bucket içine yüklenir.
7. `receipts.file_path`, `file_sha256`, `file_size_bytes`, `generated_at` ve `version` güncellenir.

## Private Bucket Yaklaşımı

Bucket adı:

```text
receipts-private
```

Bucket `public = false` olmalıdır. Storage dosyaları public URL ile paylaşılmaz. Erişim, server-side yetki kontrolünden sonra `/api/receipts/[receiptNo]/download` endpoint'i üzerinden sağlanır.

## Neden Public URL Yok?

Makbuz bağışçı adı, e-posta ve ödeme bilgisi içerir. Public bucket veya kalıcı public URL kullanılırsa linki bilen herkes dosyaya erişebilir. Bu nedenle dosya yolu client tarafında açık yetki olarak kullanılmaz.

## Admin PDF Hazırlama Akışı

- Admin/super_admin `requireAdminUser()` ile doğrulanır.
- Sadece paid payment intent ilişkili receipt için PDF hazırlanır.
- Cancelled receipt için PDF üretilmez.
- PDF oluşturulunca status `prepared` olur.
- Gerçek mali onay sonrası `issued` süreci sonraki aşamada ayrıca tasarlanacaktır.

## Bağışçı PDF Görüntüleme Akışı

- Bağışçı panelinde yalnızca kendi `donor_account_id` ile eşleşen receipt görünür.
- Guest veya `donor_account_id = null` kayıtlar panelde otomatik makbuz olarak açılmaz.
- Bağışçı linki `/api/receipts/[receiptNo]/download` endpoint'ine gider.
- Endpoint session, hesap ve receipt sahipliği kontrolü yapar.

## Yetki Kontrolü

Erişebilir:

- `admin` veya `super_admin`
- Receipt `donor_account_id` değeri aktif kullanıcı hesabı ile eşleşen bağışçı

Erişemez:

- Anon/public
- Farklı donor hesabı
- `donor_account_id` boş olan guest kayıtlar

## Signed URL / Stream Yaklaşımı

Mevcut uygulama server-side streaming kullanır:

- Service role dosyayı private bucket'tan okur.
- Response `Content-Type: application/pdf` ile döner.
- `Content-Disposition: inline` kullanılır.
- Cache `private, no-store` olarak ayarlanır.

`getReceiptSignedUrl()` yardımcı fonksiyonu kısa süreli signed URL üretimi için hazırdır; ancak varsayılan route streaming kullanır.

## Dosya Yolu Standardı

```text
receipts/{year}/{receiptNo}/v{version}.pdf
```

Örnek:

```text
receipts/2026/RCPT-2026-000001/v1.pdf
```

## PDF İçeriği

PDF içinde yer alır:

- Okyanus İnsani Yardım Derneği marka alanı ve mümkünse `public/brand/logo.png` resmi logo asset'i
- Makbuz No
- Ödeme No
- Tarih
- Bağışçı adı soyadı
- Bağışçı e-posta
- Bağışçı telefon bilgisi varsa
- Bağış türü
- Ödeme yöntemi/provider etiketi
- Tutar ve para birimi
- Ödeme durumu
- Makbuz durumu
- Bağış özeti ve toplam tutar vurgusu
- Kurumsal not

PDF içinde yer almaz:

- Kart numarası
- CVV
- PayTR merchant key/salt
- Provider raw payload
- Hash
- Service role key
- IP ve hassas teknik callback detayı

## 10E.1 Font ve Türkçe Karakter Notu

Kurumsal font dosyaları için standart klasör:

```text
app/fonts/Gilroy-Regular.woff2
app/fonts/Gilroy-Medium.woff2
app/fonts/Gilroy-Bold.woff2
app/fonts/Gilroy-Black.woff2
```

TTF fallback:

```text
app/fonts/Gilroy-Regular.ttf
app/fonts/Gilroy-Medium.ttf
app/fonts/Gilroy-Bold.ttf
app/fonts/Gilroy-Black.ttf
```

Mevcut projede font dosyaları orijinal TrueType formatında ve `Gilroy-Regular.ttf`, `Gilroy-Medium.ttf`, `Gilroy-Bold.ttf`, `Gilroy-Black.ttf` adlarıyla bulunur. Web arayüzünde `next/font/local` aktif şekilde `--font-gilroy` değişkenini üretir. Dosyalar kaldırılırsa `app/layout.tsx` font pathleri güncellenmeli veya fallback moduna alınmalıdır.

PDF üretiminde `pdf-lib` ve `@pdf-lib/fontkit` kullanılır. Generator font dosyalarını server-side okur ve Gilroy Regular/Medium/Bold/Black fontlarını PDF içine embed eder. Embed başarılıysa Türkçe karakterler gerçek karakterlerle basılır. Embed başarısız olursa PDF üretimi durmaz; Helvetica fallback ve yalnızca fallback durumunda güvenli Türkçe normalizasyon kullanılır.

## 10E Kurumsal Şablon

10E ile PDF şablonu A4 portre düzeninde şu kurumsal bölümlere ayrıldı:

- Üst header: resmi Okyanus logosu, makbuz no, ödeme no, tarih ve durum.
- Ana başlık: `BAĞIŞ MAKBUZU` ve kısa teşekkür/açıklama metni.
- Bağışçı bilgileri paneli: bağışçı adı, e-posta, telefon, bağış türü, proje/kampanya, ödeme yöntemi ve ödeme durumu.
- Bağış özeti tablosu: açıklama, tutar, adet ve toplam.
- Toplam tutar alanı: turkuaz vurgulu güçlü toplam bedel gösterimi.
- Kurumsal şeffaflık notu: bağışın kayıt altına alındığını ve mali/yasal süreçlerin dernek tarafından yürütüldüğünü açıklayan kısa not.
- Footer: teşekkür metni, web/e-posta/telefon/adres ve mevzuat notu.

Kurumsal renkler:

- Koyu Lacivert: `#0F2547`
- Turkuaz: `#1F8083`

Logo embed akışı `public/brand/logo.png` dosyasını server-side okur, PDF'e uygun RGB image object olarak gömer ve oranını korur. PNG okunamazsa PDF üretimi durmaz; metinsel Okyanus marka lockup fallback'i kullanılır ve server log'a güvenli uyarı yazılır.

10E.1 ile layout kaymalarını azaltmak için:

- Uzun makbuz no, ödeme no ve e-posta alanları güvenli genişlik içinde kısaltılır.
- Boşluksuz uzun metinler satır genişliğine göre parçalanır.
- Bağışçı bilgileri paneli daha yüksek iki kolonlu düzene alınır.
- Tutar ve toplam alanları sağ hizalı, maksimum genişlik kontrollü çizilir.
- Logo PDF içine `pdf-lib` üzerinden PNG olarak gömülür ve oranı korunur.
- Footer ve kurumsal şeffaflık alanları tek sayfa hedefiyle sabit güvenli bölgelerde tutulur.

10E.2 ile:

- `next/font/local` ile site genelinde Gilroy aktif edildi.
- PDF generator raw PDF string üretiminden `pdf-lib` tabanlı çizim modeline taşındı.
- Text ölçümü gerçek embed font üzerinden yapılır.
- `drawText`, `drawWrappedText`, `splitTextToLines`, `truncateText`, `drawLabelValueRow`, `drawSummaryTable` ve `drawTotalBox` yardımcıları font ölçümüyle çalışır.
- Makbuz PDF içinde `BAĞIŞ MAKBUZU`, `BAĞIŞÇI BİLGİLERİ`, `BAĞIŞ ÖZETİ`, `KURUMSAL ŞEFFAFLIK`, `TEŞEKKÜR EDERİZ` gibi başlıklar Türkçe karakterleriyle basılabilir.

## Receipt Status Lifecycle

- `pending`: Makbuz hazırlık kaydı var.
- `prepared`: PDF üretildi, private storage metadata dolu.
- `issued`: Mali/resmi onay sonrası kullanılacak durum.
- `cancelled`: Makbuz iptal edildi; yeni PDF üretilmez.
- `failed`: PDF veya iş akışı hatası için kullanılabilir.

## PDF Versioning

`receipts.version` PDF sürümünü tutar. Var olan dosya üzerine yazmak yerine yeni sürüm yolu kullanılmalıdır:

- `v1.pdf`
- `v2.pdf`
- `v3.pdf`

10F ile admin ekranı dosya yoksa ilk PDF'i hazırlar, dosya varsa "PDF Yeniden Oluştur" action'ı yeni sürüm üretir. Eski PDF dosyaları silinmez ve üzerine yazılmaz. `receipts.file_path` her zaman aktif/latest versiyon yolunu gösterir.

Örnek:

```text
receipts/2026/RCPT-2026-000001/v1.pdf
receipts/2026/RCPT-2026-000001/v2.pdf
receipts/2026/RCPT-2026-000001/v3.pdf
```

`receipts.version`, `file_sha256`, `file_size_bytes` ve `generated_at` yeni aktif versiyona göre güncellenir.

## Issued ve Cancel Workflow

- `pending`: Paid ödeme varsa PDF hazırlanabilir.
- `prepared`: PDF görüntülenebilir, yeniden oluşturulabilir ve "Makbuzu Onayla" ile `issued` yapılabilir.
- `issued`: PDF görüntülenebilir. Yeniden oluşturma için admin gerekçesi zorunludur; status `issued` kalır.
- `cancelled`: Dosya silinmez. Admin/super_admin mevcut PDF'i görebilir, donor download kapalıdır. İptal gerekçesi `cancelled_reason` alanında saklanır.
- `failed`: PDF üretimi kapalıdır.

İşlemler audit log'a best-effort yazılır:

- `receipt.pdf.generate`
- `receipt.pdf.regenerate`
- `receipt.issue`
- `receipt.cancel`
- `receipt.download.admin`
- `receipt.download.donor`

## Diagnostic ve Repair Akışı

PDF üretimi sırasında sistem önce `diagnoseReceiptPdfState(receiptNo)` ile güvenli bir durum özeti çıkarır. Bu özet secret, signed URL, raw provider payload veya service key içermez.

Kontrol edilenler:

- Receipt kaydı var mı?
- Payment intent ilişkisi ve status değeri nedir?
- `file_bucket`, `file_path`, `file_sha256`, `generated_at` dolu mu?
- `receipts-private` bucket var mı ve public mi?
- Beklenen storage path nedir?
- Beklenen path içinde object var mı?
- `receiptNo` içeren başka object var mı?

## Storage Object Var, DB Metadata Yoksa

Önce `repairReceiptPdfMetadata(receipt)` çalışır:

1. `file_path` boşsa expected path hesaplanır.
2. Expected path yoksa `storage.objects` içinde receipt no içeren object aranır.
3. Object bulunursa dosya private bucket'tan indirilir.
4. `file_size_bytes` ve `file_sha256` yeniden hesaplanır.
5. `receipts` kaydı service role ile güncellenir.
6. `status = pending` ise `prepared` yapılır.
7. Sayfa `pdf-onarildi` sonucu ile revalidate edilir.

Bu akış “PDF Yok” görünürken storage tarafında `v1.pdf` bulunduğu durumları onarmak için tasarlanmıştır.

## DB Metadata Var, Storage Object Yoksa

Download endpoint yetki kontrolünden sonra dosyayı okuyamazsa 404 döner. Admin kullanıcısına teknik olmayan şu durum bildirilir:

```text
Dosya kaydı var ama storage dosyası bulunamadı. PDF hazırlama işlemini tekrar çalıştırın.
```

Bu durumda admin tarafında metadata temizliği/yeniden oluşturma politikası bir sonraki sürümde daha görünür hale getirilebilir. Mevcut action `file_path` doluysa tekrar üretmez; veri bütünlüğü için öncelik metadata ile storage'ın tutarlı kalmasıdır.

## Kontrollü Upsert Kullanımı

`uploadReceiptPdf` kontrollü `upsert` desteğine sahiptir. Generate action önce repair dener. Repair object bulamazsa PDF üretir ve upload sırasında `upsert: true` kullanabilir. Upload sonrası DB metadata tekrar okunur; `file_path` hâlâ boşsa işlem hata kabul edilir ve diagnostic log yazılır.

Bu yaklaşım yalnızca `upsert true` ile hatayı gizlemez; DB metadata güncellemesi doğrulanmadan işlem başarılı sayılmaz.

## UI İçin Tek Kaynak

UI tarafında PDF hazır kabulü `filePath`/`file_path` metadata varlığıyla yapılır. Uzun vadeli standart camelCase modeldir:

- `filePath`
- `fileBucket`
- `fileSha256`
- `generatedAt`

Repository snake_case Supabase alanlarını camelCase modele map eder.

## Production Öncesi Kontroller

- Mali müşavir ve dernek yönetimi PDF metnini onaylamalı.
- Makbuz numarası ve resmi belge statüsü netleşmeli.
- Private bucket public olmadığını Security Advisor ve Storage panelinde doğrulayın.
- Erişim audit logları gözden geçirilmeli.
- Dosya saklama ve imha politikası KVKK kapsamında yazılmalı.

## Sonraki Aşama

Sonraki aşamada muhasebe entegrasyonu, e-posta ile makbuz gönderimi, mali müşavir onaylı resmi belge statüsü ve KVKK saklama/imha otomasyonu planlanmalıdır.

## Manuel / Fiziksel Makbuzlardan Ayrım

10F-M ile eklenen manuel/fiziksel makbuz modülü bu dijital receipt akışından ayrıdır:

- Dijital makbuzlar online ödeme ve `payment_intents` sonrası `receipts` tablosundan üretilir.
- Manuel makbuzlar elden/saha/ofis tahsilatı için `manual_receipts` tablosunda tutulur.
- Manuel makbuz PDF dosyaları `manual-receipts-private` bucket içinde saklanır.
- İki modülün storage bucket, veri modeli ve admin aksiyonları ayrıdır.
- Manuel makbuzun resmi belge niteliği, seri/sıra kullanımı ve arşiv politikası production öncesi ayrıca onaylanmalıdır.
