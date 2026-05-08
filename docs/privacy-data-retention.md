# KVKK ve Veri Saklama Planı

Bu doküman kesin hukuki metin değildir. Resmi kullanım öncesi hukuk danışmanı tarafından gözden geçirilmelidir.

## Hangi kişisel veriler toplanır?

- Ad soyad
- E-posta
- Telefon
- Şehir
- Yaş
- Gönüllülük deneyimi
- Bağış notu
- İletişim mesajı
- Admin kullanıcı bilgileri
- İşlem/audit kayıtları

## Hangi formlar veri üretir?

- Bağış formu
- Gönüllü başvuru formu
- İletişim formu
- Admin kullanıcıları

## Hassas veri toplamaktan kaçınma ilkesi

Platform, faaliyet için zorunlu olmayan hassas verileri toplamamalıdır. Sağlık, etnik köken, siyasi görüş, dini mezhep veya benzeri hassas alanlar formlarda istenmemelidir.

## Veri minimizasyonu

Her form yalnızca ilgili süreci yürütmek için gerekli alanları içermelidir. Opsiyonel alanlar açıkça opsiyonel belirtilmelidir.

## Saklama süresi önerileri

- İletişim mesajları: 12-24 ay
- Gönüllü başvuruları: 24 ay veya başvuru süreci tamamlanana kadar
- Bağış kayıtları: muhasebe/yasal yükümlülükler doğrultusunda
- Audit loglar: güvenlik ve denetim ihtiyacına göre daha uzun
- Yasal metin versiyonları: süresiz arşivlenebilir

## Silme / anonimleştirme yaklaşımı

- Süresi dolan iletişim ve gönüllü verileri silinebilir veya anonimleştirilebilir.
- Bağış kayıtlarında yasal saklama yükümlülüğü varsa anonimleştirme sınırlı olabilir.
- Silme işlemleri audit log ile takip edilmelidir.

## Erişim yetkileri

- Bağışçı verileri: Bağış Sorumlusu ve Super Admin
- Gönüllü verileri: Gönüllü Koordinatörü ve Super Admin
- İletişim mesajları: Yetkili iletişim rolü ve Super Admin
- Audit loglar: Super Admin

## Dışa aktarma ve raporlama sınırları

- Raporlarda kişisel veri yerine toplam metrik kullanılmalıdır.
- CSV/PDF export işlemleri rol ve audit log kontrolüne tabi olmalıdır.
- Kişisel veri içeren export dosyaları kısa süreli ve güvenli erişimle sunulmalıdır.

## Yasal danışmanlık notu

KVKK aydınlatma metinleri, açık rıza süreçleri, veri saklama süreleri ve imha prosedürleri resmi kullanımdan önce hukuk danışmanı tarafından değerlendirilmelidir.
