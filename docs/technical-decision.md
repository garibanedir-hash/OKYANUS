# Teknik Karar Dokümanı

## Projenin mevcut durumu

Okyanus İnsani Yardım Derneği platformu şu an Next.js, TypeScript ve Tailwind CSS ile geliştirilmiş frontend ağırlıklı bir sistemdir. Public site, proje detayları, şeffaflık sayfaları, yasal taslaklar ve demo admin paneli hazırdır. İçerikler TypeScript data dosyalarıyla mock olarak yönetilmektedir.

Gerçek backend, auth, CMS, veritabanı veya ödeme entegrasyonu henüz kurulmamıştır.

## Neden backend/CMS mimarisine ihtiyaç var?

Platform ileride yalnızca içerik yayınlayan bir site olmaktan çıkıp bağış, gönüllülük, raporlama ve operasyon takibi yapan bir sisteme dönüşecektir. Bunun için şu ihtiyaçlar oluşur:

- Proje bazlı bağış takibi
- Bağışçı ve gönüllü verilerinin güvenli saklanması
- Faaliyet raporu ve PDF yönetimi
- Admin rolleri ve yetkilendirme
- KVKK uyumlu veri işleme
- Audit log ve işlem geçmişi
- Ödeme sağlayıcısı webhook kayıtları
- Site ayarları ve yasal metin versiyonlama

## Yönetilecek ana veri alanları

- Projeler
- Faaliyet alanları
- Haberler / duyurular
- Faaliyet raporları
- Bağış kayıtları
- Ödeme işlem kayıtları
- Makbuz kayıtları
- Gönüllü başvuruları
- İletişim mesajları
- Admin profilleri ve rolleri
- Site ayarları
- Yasal sayfalar
- Medya/PDF dosyaları
- Audit log kayıtları

## Değerlendirilecek seçenekler

### Supabase tabanlı özel admin panel

Avantajlar:
- Postgres tabanlı güçlü ilişkisel veri modeli.
- Supabase Auth ile kullanıcı ve oturum yönetimi.
- Row Level Security ile tablo düzeyinde yetkilendirme.
- Storage ile PDF, görsel ve rapor dosyaları.
- Realtime veya Edge Functions gibi genişleme imkanları.
- Mevcut özel admin arayüzüyle uyumlu.

Sınırlılıklar:
- CMS editör deneyimi özel olarak tasarlanmalıdır.
- RLS politikaları dikkatli test edilmelidir.
- Ödeme ve makbuz akışı özel iş mantığı gerektirir.

### Sanity CMS

Avantajlar:
- İçerik editörleri için güçlü studio deneyimi.
- Esnek schema yapısı.
- Haber, sayfa ve proje içeriği için hızlı kurulum.

Sınırlılıklar:
- Bağış, ödeme, gönüllü başvurusu ve audit log gibi operasyonel kayıtlar için tek başına yeterli değildir.
- KVKK ve ödeme verisi yönetimi için ayrıca backend/veritabanı gerekir.

### Strapi

Avantajlar:
- Admin panel hazır gelir.
- REST/GraphQL API desteği.
- İçerik türleri hızlı modellenebilir.

Sınırlılıklar:
- Hosting, güvenlik ve güncelleme operasyonu gerekir.
- Bağış ve ödeme akışı yine özel geliştirme ister.
- Rol/yetki modeli detaylı ihtiyaçlarda ek çalışma gerektirebilir.

### Payload CMS

Avantajlar:
- TypeScript odaklı modern CMS.
- Next.js ekosistemiyle iyi uyum.
- Custom collection ve access control imkanları güçlüdür.

Sınırlılıklar:
- Kurulum ve altyapı yönetimi gerekir.
- Operasyonel bağış/ödeme kayıtları için dikkatli veri modeli gerekir.

### Directus

Avantajlar:
- SQL veritabanı üstüne hızlı admin paneli.
- Rol/yetki ve içerik yönetimi hazır gelir.
- Mevcut tablolarla çalışabilir.

Sınırlılıklar:
- Özel admin deneyimi sınırlı kalabilir.
- Ödeme, audit ve KVKK süreçleri için özel iş kuralları yine gerekir.

### Tamamen özel backend

Avantajlar:
- Tüm iş kuralları tam kontrol altında olur.
- Bağış, makbuz, audit, KVKK ve rol modeli baştan istenen şekilde tasarlanır.

Sınırlılıklar:
- Geliştirme süresi daha uzundur.
- Admin panel, auth, dosya yönetimi ve güvenlik katmanı sıfırdan kurulmalıdır.

## Bu proje özelinde önerilen yaklaşım

Önerilen ana yaklaşım:

**Supabase tabanlı özel admin panel + Postgres veri modeli + Supabase Auth + Storage + RLS politikaları**

Gerekçe:

Okyanus için klasik içerik CMS’i tek başına yeterli değildir. Proje yalnızca haber/proje sayfaları yönetmeyecek; bağış kayıtları, gönüllü başvuruları, iletişim mesajları, proje bazlı ilerleme, faaliyet raporları, admin rolleri, KVKK hassasiyeti, audit log ve ödeme entegrasyonu gerektirecektir.

Supabase yaklaşımı; ilişkisel veri, auth, storage, RLS ve özel admin panel esnekliğini aynı zeminde sunar. İçerik editör deneyimi özel admin panel içinde iyileştirilebilir. İleride ihtiyaç olursa Sanity veya Payload gibi bir CMS yalnızca içerik alanları için ikincil katman olarak değerlendirilebilir.
