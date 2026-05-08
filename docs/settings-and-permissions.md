# Ayarlar ve Yetki Yönetimi

## Admin Ayarları Sistemi

Admin ayarları; genel platform davranışı, kurumsal bilgiler, iletişim bilgileri, bağış, gönüllülük, kullanıcı, panel, bildirim, yasal, güvenlik ve sistem ayarlarını kapsar.

## Kullanıcı Yönetimi

Kullanıcı yönetim ekranı bağışçı, gönüllü, personel, koordinatör ve admin hesaplarını filtrelemeye hazırdır. İşlemler demo modda kalır:

- Bilgileri düzenle
- Rol ata
- Yetki düzenle
- Panel erişimi ver/kaldır
- Şifre sıfırlama bağlantısı gönder
- Hesabı pasifleştir
- KVKK veri talebi oluştur

## Panel Ayarları

Yönetilebilir panel anahtarları:

- Bağışçı paneli aktif/pasif
- Gönüllü paneli aktif/pasif
- Yetim sponsorluk modülü aktif/pasif
- Bildirimler aktif/pasif
- Gönüllü etkinlik başvuruları aktif/pasif
- Bağış makbuzu gösterimi aktif/pasif
- Profil tamamlama zorunluluğu
- Public kayıt açık/kapalı
- Yeni kullanıcı admin onayı

## Rol ve Yetki Yönetimi

Yetki matrisi modül ve aksiyon bazlıdır:

- Modüller: Projeler, Bağışlar, Makbuzlar, Gönüllü Başvuruları, Etkinlikler, Yetim Sponsorluk, Görevler, Mesajlar, Personel, Kullanıcılar, Raporlar, Export, Site Ayarları, Yasal Sayfalar, Audit Log.
- Aksiyonlar: Görüntüleme, Oluşturma, Düzenleme, Silme/Arşivleme, Yayınlama, Export, Atama, Onaylama.

## Demo Moddan Gerçek Moda Geçiş

Gerçek modda tüm UI aksiyonları server-side RBAC ve Supabase RLS ile doğrulanmalıdır. UI checkboxları tek başına güvenlik sağlamaz.

## Production Güvenlik Notları

- Yetki değişiklikleri audit log’a yazılmalıdır.
- Panel erişimleri server-side doğrulanmalıdır.
- Çocuk/sponsorluk verilerinde katı maskeleme ve sınırlı görünüm uygulanmalıdır.
- Public kayıt ve giriş formları rate limit ile korunmalıdır.
