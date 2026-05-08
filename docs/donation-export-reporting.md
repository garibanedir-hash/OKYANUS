# Bağış Export ve Raporlama Hazırlığı

Bu doküman Okyanus İnsani Yardım Derneği yönetim panelinde bağış verilerinin raporlanması ve dışa aktarılması için frontend/demo seviyesinde hazırlanan mimariyi açıklar. Gerçek kullanım öncesi backend, yetkilendirme, audit log, KVKK ve mali süreçler birlikte doğrulanmalıdır.

## Amaç

- Bağış kayıtlarını tarih aralığı, proje, bağış türü, ödeme durumu ve makbuz durumuna göre filtrelemek.
- Proje bazlı bağış ilerlemesini raporlayabilmek.
- CSV çıktısı üretmek; Excel/XLSX ve PDF rapor üretimine uygun servis katmanı hazırlamak.
- Muhasebe ve faaliyet raporu süreçlerine kontrollü veri sağlamak.
- Kişisel verileri maskeleyebilmek ve export işlemlerini audit log ile izlemek.

## Export Yapabilecek Roller

- Super Admin: Tüm bağış export işlemlerini yapabilir.
- Bağış Sorumlusu: Bağış ve makbuz süreçleri için yetkilendirilen exportları yapabilir.
- Raporlama Sorumlusu: Özet ve proje bazlı rapor exportlarına erişebilir; bağışçı kişisel verileri varsayılan olarak maskelenmelidir.
- İçerik Editörü ve Gönüllü Koordinatörü: Bağış export yetkisine sahip olmamalıdır.

## Export Alanları

- Kayıt id
- Bağışçı adı
- Tutar
- Bağış türü
- İlgili proje
- Tarih
- Bağış durumu
- Ödeme durumu
- Makbuz durumu
- Not

## Maskelenebilecek Alanlar

- Bağışçı adı
- Bağışçı e-posta adresi
- Bağışçı telefon numarası
- Not alanında kişisel veri içeren bölümler

Frontend demo aşamasında `maskPersonalData()` bağışçı adını maskeler. Production aşamasında e-posta, telefon ve serbest metin notları için ayrı maskeleme politikası uygulanmalıdır.

## Formatlar

- CSV: En hafif ve evrensel format. Bu aşamada mock veriyle çalışır.
- Excel/XLSX: Muhasebe ve iç raporlama için hazırlanabilir; paket seçimi production öncesi netleştirilmelidir.
- PDF: Yönetim kurulu, bağışçı bilgilendirmesi ve faaliyet raporu ekleri için üretilebilir.

## Rapor Türleri

- Proje bazlı bağış raporu
- Tarih aralığı bağış listesi
- Makbuz durumu raporu
- Ödeme sağlayıcı mutabakat raporu
- Özet bağış performans raporu

## KVKK ve Veri Minimizasyonu

- Varsayılan export maskeli olmalıdır.
- Gerekmeyen kişisel veri dışa aktarılmamalıdır.
- Export yetkisi rol bazlı sınırlandırılmalıdır.
- Export dosyaları kalıcı saklanacaksa saklama süresi ve erişim yetkisi tanımlanmalıdır.
- Resmi kullanım öncesi hukuk danışmanı ve mali müşavir ile kontrol edilmelidir.

## Audit Log Gerekliliği

Her export işleminde şu bilgiler loglanmalıdır:

- Export yapan admin
- Export zamanı
- Export formatı
- Kullanılan filtreler
- Kişisel veri maskelendi mi?
- Satır sayısı
- Entity türü

## Production Öncesi Kontroller

- RBAC ile export yetkileri doğrulandı mı?
- Service key client tarafına sızmıyor mu?
- Export işlemi rate limit altında mı?
- Audit log silinmezlik politikası tanımlandı mı?
- Dosya çıktıları geçici ve güvenli saklanıyor mu?
- CSV injection riskine karşı hücre içerikleri normalize ediliyor mu?
