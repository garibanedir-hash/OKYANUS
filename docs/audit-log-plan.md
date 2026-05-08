# Audit Log ve İşlem Güvenliği Planı

## Audit log neden gerekli?

Okyanus platformu bağış, gönüllülük, kişisel veri, rapor ve yasal metin gibi güven hassasiyeti yüksek alanlar içerir. Audit log; kimin, ne zaman, hangi kaydı değiştirdiğini takip ederek hesap verebilirlik sağlar.

## Hangi işlemler loglanmalı?

- Proje oluşturma, düzenleme, yayından kaldırma
- Haber oluşturma, düzenleme, yayından kaldırma
- Rapor yayınlama ve PDF değiştirme
- Bağış durum değişikliği
- Makbuz durum değişikliği
- Gönüllü başvuru durum değişikliği
- İletişim mesajı yanıtlandı/arşivlendi işlemleri
- Site ayarları değişiklikleri
- Yasal metin değişiklikleri
- Admin kullanıcı girişleri
- Rol ve yetki değişiklikleri
- Dosya/PDF yükleme ve silme işlemleri
- Bağış verisi dışa aktarıldı
- Export formatı, filtreleri, satır sayısı ve maskeleme tercihi
- Export yapan admin ve export zamanı
- Görev oluşturuldu
- Görev atandı
- Görev durumu değiştirildi
- Görev yorumu eklendi
- İç mesaj gönderildi
- Konuşma arşivlendi
- Personel rolü değiştirildi
- Kullanıcı rolü değiştirildi
- Panel erişimi verildi/kaldırıldı
- Yetim sponsorluk kaydı görüntülendi
- Sponsorluk bilgisi güncellendi
- Gönüllü etkinlik başvurusu yapıldı
- Personel görev durumu değiştirdi
- Koordinatör görev atadı
- Kullanıcı bilgileri düzenlendi
- Şifre sıfırlama talebi oluşturuldu

## Audit log alanları

- `id`
- `actor_id`
- `action`
- `entity_type`
- `entity_id`
- `old_value`
- `new_value`
- `ip_address`
- `user_agent`
- `created_at`

## Kim görebilmeli?

- Super Admin tüm kayıtları görebilir.
- Raporlama Sorumlusu yalnızca rapor/proje metrikleriyle ilişkili logları sınırlı görebilir.
- Diğer roller audit logları görmemelidir.

## KVKK açısından dikkat edilmesi gerekenler

- Audit log içinde gereksiz kişisel veri tutulmamalıdır.
- Bağışçı e-posta/telefon gibi alanlar maskelenmelidir.
- Ham ödeme payload’ları loglanmamalı veya ciddi biçimde sınırlandırılmalıdır.
- Loglar veri saklama politikasıyla uyumlu tutulmalıdır.

## Silinmezlik / arşivleme mantığı

- Audit log kayıtları normal admin UI’dan silinmemelidir.
- Arşivleme gerekiyorsa ayrı güvenli süreçle yapılmalıdır.
- Kritik kayıtlar immutable storage veya append-only mantığıyla değerlendirilebilir.

## Hassas verinin maskeleme prensipleri

- E-posta: `a***@domain.com`
- Telefon: `+90 *** *** 00 00`
- Ödeme referansları: son 4 karakter hariç maskeli
- Not alanları: kişisel veri içerebileceği için loglarda sınırlı tutulmalı

## Export log alanları

Bağış verisi dışa aktarma işlemleri ayrıca `export_logs` tablosunda takip edilebilir:

- `id`
- `actor_id`
- `export_type`
- `entity_type`
- `filters`
- `masked`
- `file_format`
- `row_count`
- `created_at`

Bu kayıtlar bağışçı kişisel verisini içermemeli; filtreler gerekiyorsa minimum seviyede ve JSON olarak tutulmalıdır.
