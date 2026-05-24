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

## Türkçe Karakter Notu

Bu aşamada yeni PDF paketi eklenmedi. Minimal server-side PDF üretici standart PDF fontu kullandığı için Türkçe karakterler güvenli ASCII karşılıklarına normalize edilir. Gilroy font dosyaları repoda bulunmadığı için PDF içinde Helvetica/Helvetica-Bold tabanlı geometrik sans-serif fallback kullanılır. Production öncesi Türkçe karakterli resmi çıktı ve Gilroy font kullanımı için font embed destekli PDF çözümü değerlendirilebilir.

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

Bu aşamada admin ekranı dosya yoksa PDF hazırlar. Yeniden oluşturma/iptal/onay politikası sonraki aşamada ayrı action olarak netleştirilecektir.

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

Sonraki aşamada gerçek makbuz issued/onay akışı, iptal nedeni, muhasebe entegrasyonu, e-posta ile gönderim, mevcut hazırlanmış PDF'ler için kontrollü yeniden üretim/versioning ve font embed destekli Türkçe karakter/Gilroy iyileştirmesi planlanmalıdır.
