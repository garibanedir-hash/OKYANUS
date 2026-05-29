# Manuel / Fiziksel Bağış Makbuzları

10F-M aşaması, online ödeme sonrası otomatik oluşan dijital makbuzlardan ayrı bir manuel/fiziksel makbuz modülü kurar. Bu modül elden alınan bağışlar, saha tahsilatları, merkez/ofis bağış kabul işlemleri ve ileride makbuz koçanı ya da özel yazıcı çıktısı için hazırlanmıştır.

## Dijital Makbuzdan Farkı

- Dijital makbuzlar `receipts` tablosu, `receipts-private` bucket ve payment intent/finalization akışı ile çalışır.
- Manuel makbuzlar `manual_receipts` tablosu ve `manual-receipts-private` bucket ile ayrı tutulur.
- Manuel makbuzlar ödeme provider callback sonucu değildir.
- Manuel makbuzlarda seri no, sıra no, koçan no, tahsil eden personel, şube/birim, imza ve kaşe alanları desteklenir.
- Bu aşamada manuel makbuzlar otomatik `payment_intents` veya `receipts` kaydı oluşturmaz.

## Veri Modeli

`018_manual_physical_receipts.sql` migration'ı şu yapıyı ekler:

- `manual_receipts`
- `manual_receipt_events`
- `manual_receipt_no_seq`
- `generate_manual_receipt_no()`
- `manual-receipts-private` private storage bucket

Makbuz no formatı:

```text
MRC-YYYY-000001
```

Örnek:

```text
MRC-2026-000001
```

PDF path standardı:

```text
manual-receipts/{year}/{receiptNo}/v1.pdf
```

## Statüler

- `draft`: taslak kayıt
- `prepared`: hazırlanmış kayıt
- `printed`: yazdırılmış kayıt
- `delivered`: teslim edilmiş kayıt
- `signed`: imzalanmış kayıt
- `archived`: arşivlenmiş kayıt
- `cancelled`: gerekçeli iptal

İptal edilen makbuzlar silinmez; `cancelled_reason`, `cancelled_at` ve `cancelled_by` alanlarıyla iz bırakır.

## Admin Akışı

- `/admin/makbuzlar/manuel`: liste ve filtreler
- `/admin/makbuzlar/manuel/yeni`: yeni manuel makbuz formu
- `/admin/makbuzlar/manuel/[id]`: detay, event geçmişi ve aksiyonlar
- `/admin/makbuzlar/manuel/[id]/duzenle`: düzenleme
- `/admin/makbuzlar/manuel/[id]/yazdir`: A4 yatay yazdırma önizlemesi
- `/api/manual-receipts/[receiptNo]/download`: admin-only PDF görüntüleme

## PDF ve Yazdırma

Geniş yatay PDF/print şablonu Okyanus kurumsal renklerini kullanır:

- Koyu lacivert: `#0F2547`
- Turkuaz: `#1F8083`

PDF içinde Okyanus logosu, bağışçı bilgileri, bağış türü, tutar, tutar yazıyla, ödeme yöntemi, şube/birim, teslim alan, muhasebe/yetkili ve onay imza alanları bulunur.

PDF dosyaları `manual-receipts-private` bucket içinde tutulur. Bucket public değildir. Client tarafına service role key veya doğrudan storage yetkisi taşınmaz.

## Güvenlik

- `manual_receipts` ve `manual_receipt_events` RLS ile korunur.
- Anon/public erişim yoktur.
- İlk sürümde write/read operasyonu admin/super_admin ve server action üzerinden yürür.
- TCKN/VKN gibi kişisel veriler listelerde maskelenir.
- PDF download route'u session ve admin rolü doğrular.
- Event/audit log best-effort tutulur.

## Gelecek Bağlantılar

Bu modül ileride şu alanlara bağlanabilir:

- `payment_intents.provider = manual`
- muhasebe export/ledger
- makbuz koçanı seri-sıra yönetimi
- fiziksel/termal yazıcı çıktısı
- şube veya saha personeli yetki modeli

Bu bağlantılar bu aşamada açılmamıştır.

## Mali ve Hukuki Not

Bu modül resmi/mali belge niteliğine yaklaşabileceği için production öncesi dernek yönetimi, mali müşavir ve hukuk danışmanı tarafından makbuz metinleri, seri/sıra kullanımı, iptal politikası, arşivleme süresi ve kişisel veri saklama politikası onaylanmalıdır.
