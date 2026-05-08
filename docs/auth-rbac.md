# Auth ve RBAC Planı

## Auth sisteminin amacı

Admin panelde içerik, bağış, gönüllü başvurusu, rapor ve ayar işlemlerini yalnızca yetkili kişilerin yapabilmesini sağlamak.

## Önerilen yaklaşım: Supabase Auth

Supabase Auth; e-posta/şifre, magic link, MFA ve oturum yönetimi gibi temel ihtiyaçları karşılar. Admin profilleri `profiles` tablosunda tutulur, rol bilgisi `app_role` enum değeriyle yönetilir.

## Admin kullanıcıları

Her admin kullanıcısı için:

- Supabase Auth user kaydı
- `profiles` tablosunda profil kaydı
- Rol ataması
- Durum bilgisi: active, suspended, invited
- Audit log ilişkisi

## Rol bazlı yetkilendirme

Roller:

- Super Admin
- İçerik Editörü
- Bağış Sorumlusu
- Gönüllü Koordinatörü
- Raporlama Sorumlusu

## Roller ve yetkiler

### Super Admin

- Tüm içerikleri yönetebilir.
- Admin kullanıcılarını yönetebilir.
- Site ayarlarını değiştirebilir.
- Bağış ve gönüllü kayıtlarını görebilir.
- Audit logları görebilir.

### İçerik Editörü

- Haberleri yönetebilir.
- Projeleri taslak olarak düzenleyebilir.
- Faaliyet alanlarını düzenleyebilir.
- Bağış kayıtlarını göremez.

### Bağış Sorumlusu

- Bağış kayıtlarını görebilir.
- Makbuz durumlarını takip edebilir.
- Ödeme durumlarını görebilir.
- İçerik ayarlarını değiştiremez.

### Gönüllü Koordinatörü

- Gönüllü başvurularını görebilir.
- Başvuru durumlarını güncelleyebilir.
- Gönüllü ilgi alanlarını yönetebilir.

### Raporlama Sorumlusu

- Faaliyet raporlarını yönetebilir.
- Proje metriklerini güncelleyebilir.
- Şeffaflık sayfasıyla ilişkili içerikleri düzenleyebilir.

## Yetki matrisi

| Alan | Super Admin | İçerik Editörü | Bağış Sorumlusu | Gönüllü Koordinatörü | Raporlama Sorumlusu |
| --- | --- | --- | --- | --- | --- |
| Projeler | Gör/Oluştur/Düzenle/Sil/Yayınla | Gör/Oluştur/Düzenle | Gör | Gör | Gör/Düzenle metrik |
| Haberler | Gör/Oluştur/Düzenle/Sil/Yayınla | Gör/Oluştur/Düzenle/Yayınla | Yok | Yok | Gör |
| Raporlar | Gör/Oluştur/Düzenle/Sil/Yayınla | Gör | Gör | Yok | Gör/Oluştur/Düzenle/Yayınla |
| Bağışlar | Gör/Düzenle/Arşivle | Yok | Gör/Düzenle | Yok | Özet gör |
| Gönüllüler | Gör/Düzenle/Arşivle | Yok | Yok | Gör/Düzenle | Yok |
| İletişim mesajları | Gör/Düzenle/Arşivle | Yok | Yok | Sınırlı gör | Yok |
| Site ayarları | Gör/Düzenle | Yok | Yok | Yok | Yok |
| Yasal sayfalar | Gör/Oluştur/Düzenle/Yayınla | Gör/Düzenle taslak | Yok | Yok | Gör |
| Audit loglar | Gör | Yok | Yok | Yok | Sınırlı gör |
| Görevler | Gör/Oluştur/Düzenle/Arşivle | Kendine atananları gör/yorumla | Bağış görevlerini gör/düzenle | Gönüllü görevlerini gör/düzenle | Rapor görevlerini gör/düzenle |
| İç Mesajlar | Tüm konuşmaları yönetir | Katılımcı olduğu konuşmaları görür | Bağış konuşmalarını görür | Gönüllü konuşmalarını görür | Rapor konuşmalarını görür |
| Personel | Gör/Oluştur/Düzenle/Rol değiştir | Yok | Yok | Sınırlı ekip görünümü | Sınırlı ekip görünümü |
| Export/Raporlama | Tüm exportları yapar | Yok | Bağış exportu yapar | Yok | Özet/proje raporu exportu yapar |

## Operasyon modülü notları

- Super Admin tüm görevleri, iç mesajları, personel kayıtlarını ve export işlemlerini yönetebilir.
- İçerik Editörü yalnızca kendisine atanan içerik görevlerini görebilir ve yorumlayabilir.
- Bağış Sorumlusu bağış ilişkili görevleri ve yetkilendirilen bağış exportlarını yönetebilir.
- Gönüllü Koordinatörü gönüllü başvuruları ile ilişkili görevleri ve iç mesajları yönetebilir.
- Raporlama Sorumlusu faaliyet raporu, proje metriği ve özet export hazırlıklarına erişebilir.
- Export işlemleri her zaman server-side yetki kontrolünden geçmeli ve audit/export log’a düşmelidir.

## Admin route koruma mantığı

- `/admin` altındaki tüm route’lar auth gerektirir.
- Kullanıcı rolü server-side kontrol edilmelidir.
- RLS tek güvenlik katmanı olarak görülmemeli; server action/API katmanı da rol kontrolü yapmalıdır.
- Yetkisiz kullanıcılar login veya yetkisiz erişim ekranına yönlendirilmelidir.

## Kullanıcı ve saha rolleri

### Bağışçı

- Kendi bağışlarını görebilir.
- Kendi sponsorluklarını görebilir.
- Public proje/faaliyet bilgilerini görebilir.
- Başkasının bağışını veya sponsorluk detayını göremez.

### Gönüllü

- Kendi başvuru durumunu görebilir.
- Katılabileceği etkinlikleri görebilir.
- Kendisine atanan görevleri görebilir.
- Başka gönüllülerin kişisel verilerini göremez.

### Koordinatör

- Kendi sorumlu olduğu ekip ve faaliyetleri görebilir.
- Ekibindeki personellerin görevlerini takip edebilir.
- Yetkili olduğu modüllerde görev atayabilir.
- Tüm sistem ayarlarına ve secret/admin alanlarına erişemez.

### Personel

- Sadece kendisine atanan görevleri ve mesajları görebilir.
- Kendi profilini düzenleyebilir.
- Yetkisiz modüllere erişemez.

## Panel erişim matrisi özeti

| Panel | Erişim | Sınır |
| --- | --- | --- |
| `/panel/bagisci` | Bağışçı | Sadece kendi bağış ve sponsorlukları |
| `/panel/gonullu` | Gönüllü | Sadece kendi başvuru, etkinlik ve görevleri |
| `/koordinator` | Koordinatör | Kendi ekip/faaliyet alanı |
| `/personel` | Personel | Kendi görev, mesaj ve profili |
| `/admin` | Admin/Super Admin | Rol bazlı admin modülleri |
