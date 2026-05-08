# Kullanıcı Portal Mimarisi

Bu doküman Okyanus İnsani Yardım Derneği için bağışçı, gönüllü ve sponsorluk panellerinin frontend/demo mimarisini açıklar. Gerçek auth, ödeme ve veri yazma 8B sonrası aşamalara bırakılmıştır.

## Public Login/Register Akışı

- `/giris`: Bağışçı, gönüllü ve karma hesapların giriş taslağı.
- `/kayit`: Hesap türü, temel bilgiler, KVKK onayı ve iletişim izni alanları.
- Demo modda gerçek Supabase Auth çağrısı yapılmaz.
- Gelecekte role/account type değerine göre yönlendirme:
  - Bağışçı: `/panel/bagisci`
  - Gönüllü: `/panel/gonullu`
  - Bağışçı + Gönüllü: `/panel`
  - Koordinatör: `/koordinator`
  - Personel: `/personel`
  - Admin/Super Admin: `/admin`

## Bağışçı Paneli

Bağışçı kendi bağış sayısını, toplam bağış tutarını, desteklediği projeleri, makbuz durumlarını ve sponsorluk özetlerini görebilir. Başka bağışçıların kayıtlarına erişmemelidir.

## Gönüllü Paneli

Gönüllü kendi başvuru durumunu, katılabileceği faaliyetleri, etkinlikleri, kendisine atanan görevleri ve duyuruları görür. Başka gönüllülerin kişisel verilerine erişemez.

## Sponsorluk Görünümü

Yetim/çocuk sponsorluk alanında mahremiyet esastır:

- Çocuğun tam adı gösterilmez.
- Açık adres, okul adı, kimlik, telefon ve aile bilgileri gösterilmez.
- Görseller temsili veya izinli olmalıdır.
- Sponsor sadece kendi sponsorluklarını görebilir.
- Hassas çocuk verileri katı RLS ve audit log ile korunmalıdır.

## Profil ve Bildirim Sistemi

Profil alanları Supabase Auth + `user_accounts`, `donor_profiles`, `volunteer_profiles` ilişkisine bağlanacak şekilde hazırlanmıştır. Bildirimler `portal_notifications` tablosundan beslenecektir.

## Supabase Auth Bağlantısı

Giriş/kayıt formları Supabase Auth ile bağlandığında:

- Auth user oluşturulur.
- `user_accounts` kaydı açılır.
- Hesap türüne göre profil tabloları oluşturulur.
- Panel erişimi RBAC/RLS ile doğrulanır.

## KVKK Notları

Kayıt sırasında KVKK onayı alınmalı, veri minimizasyonu uygulanmalı ve kullanıcı veri erişim/düzeltme/silme talepleri için süreç tanımlanmalıdır.
