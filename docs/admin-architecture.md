# Okyanus Admin Panel Mimarisi

## Amaç

Bu admin panel, Okyanus İnsani Yardım Derneği web sitesinin ileride gerçek CMS, özel backend veya veritabanı tabanlı yönetim sistemine dönüşebilmesi için hazırlanmış frontend demo iskeletidir.

Panel şu an gerçek veri kaydetmez, gerçek giriş sistemi içermez ve ödeme işlemi yapmaz.

## Mevcut demo route yapısı

- `/admin`: genel dashboard
- `/admin/projeler`: proje yönetimi
- `/admin/haberler`: haber yönetimi
- `/admin/faaliyet-raporlari`: rapor yönetimi
- `/admin/bagislar`: demo bağış kayıtları
- `/admin/gonullu-basvurular`: demo gönüllü başvuruları
- `/admin/iletisim-mesajlari`: demo iletişim mesajları
- `/admin/ayarlar`: site ayarları demo formları

## Yönetilecek içerik türleri

- Projeler
- Haberler / duyurular
- Faaliyet raporları
- Bağış kayıtları
- Gönüllü başvuruları
- İletişim mesajları
- Kurumsal ayarlar
- Yasal sayfalar

## Proje yönetimi veri alanları

- `id`
- `slug`
- `title`
- `category`
- `summary`
- `description`
- `detail`
- `goal`
- `raised`
- `status`
- `location`
- `startDate`
- `updatedAt`
- `metrics`
- `impactItems`
- `scopeItems`
- `transparencyNote`
- `cta`

## Haber yönetimi veri alanları

- `id`
- `slug`
- `title`
- `category`
- `date`
- `summary`
- `content`
- `tags`
- `relatedProjectSlug`
- `relatedActivitySlug`
- `publishStatus`

## Rapor yönetimi veri alanları

- `id`
- `slug`
- `title`
- `period`
- `category`
- `summary`
- `statusLabel`
- `pdfUrl`
- `metrics`
- `tags`
- `publishedAt`

## Bağış yönetimi veri alanları

- `id`
- `donorName`
- `amount`
- `donationType`
- `projectSlug`
- `date`
- `status`
- `paymentStatus`
- `receiptStatus`
- `note`

## Gönüllü başvuru veri alanları

- `id`
- `fullName`
- `email`
- `phone`
- `city`
- `interestArea`
- `experience`
- `status`
- `submittedAt`
- `note`

## İletişim mesajları veri alanları

- `id`
- `fullName`
- `email`
- `subject`
- `message`
- `status`
- `submittedAt`

## Gerçek backend'e geçerken ihtiyaç duyulacak tablolar

- `users`
- `roles`
- `projects`
- `news`
- `reports`
- `donations`
- `volunteer_applications`
- `contact_messages`
- `site_settings`
- `legal_pages`
- `audit_logs`
- `file_assets`

## Önerilen roller

- Super Admin
- İçerik Editörü
- Bağış Sorumlusu
- Gönüllü Koordinatörü
- Raporlama Sorumlusu

## CMS entegrasyon seçenekleri

Bu frontend admin iskeleti aşağıdaki sistemlerle entegre edilebilecek şekilde data ve UI katmanını ayırır:

- Supabase tabanlı özel admin panel
- Sanity CMS
- Strapi
- Payload CMS
- Directus

Her seçenek için temel ihtiyaçlar aynıdır: içerik şemaları, yetkilendirme, dosya yönetimi, validasyon ve yayın akışı.

## İleride eklenmesi gereken güvenlik adımları

- Auth
- Role based access control
- Audit logs
- Data validation
- Rate limiting
- Secure file uploads
- KVKK uyumlu veri saklama politikası
- Oturum süresi ve güvenli çıkış
- Hassas bağışçı verileri için erişim sınırlandırması

## Demo uyarısı

Bu yönetim paneli şu an demo/frontend önizleme modundadır. Gerçek kullanım için kimlik doğrulama, yetkilendirme, veritabanı, işlem kayıtları ve güvenlik kontrolleri eklenmelidir.

## Gerçek backend'e geçiş planı

1. Supabase projesi oluşturulur.
2. SQL taslakları migration formatına dönüştürülür.
3. Auth ve profile senkronizasyonu kurulur.
4. Admin route'ları auth middleware ile korunur.
5. Demo data dosyaları aşamalı olarak backend query katmanıyla değiştirilir.
6. CRUD işlemleri server action veya API route üzerinden bağlanır.
7. Audit log, dosya upload ve ödeme webhook katmanları eklenir.

## Supabase Auth entegrasyonu adımları

- Supabase Auth provider ayarları yapılır.
- Admin kullanıcı davet akışı belirlenir.
- `profiles` tablosu auth user ile eşleştirilir.
- Rol bilgisi JWT claim veya profiles lookup üzerinden okunur.
- Oturum süresi, güvenli çıkış ve MFA politikası belirlenir.

## RLS politika yaklaşımı

- Public okuma tabloları ayrı tanımlanır.
- Bağış, gönüllü ve iletişim tabloları public read'e kapalı tutulur.
- Admin rolleri RLS helper function ile kontrol edilir.
- Service role yalnızca server-side güvenli işlemlerde kullanılır.
- RLS staging ortamında test edilmeden production'a alınmaz.

## Admin route koruma mantığı

- `/admin` altındaki route'lar middleware veya server layout kontrolüyle korunur.
- Kullanıcı auth değilse login ekranına yönlendirilir.
- Rol yetkisi yoksa yetkisiz erişim ekranı gösterilir.
- UI'da gizlenen aksiyonlar backend'de de yetki kontrolünden geçer.

## Audit log entegrasyonu

- Her create/update/delete/publish/status-change işlemi audit log üretir.
- Audit log server-side yazılır.
- Eski ve yeni değerler maskeleme prensipleriyle saklanır.
- Audit log kayıtları admin UI üzerinden silinemez.

## Dosya/PDF yükleme güvenliği

- Sadece izin verilen MIME türleri kabul edilir.
- Maksimum dosya boyutu belirlenir.
- PDF ve makbuz dosyaları private bucket'ta tutulur.
- Public rapor dosyaları yayın onayı sonrası erişilebilir yapılır.
- Dosya adları normalize edilir, kullanıcı girdisi doğrudan path yapılmaz.

## Admin aksiyonlarının demo moddan gerçek moda geçiş aşamaları

1. Demo alert aksiyonları modal/form akışına dönüştürülür.
2. Form validasyonları eklenir.
3. Server action veya API endpoint bağlantısı yapılır.
4. Optimistic UI ve loading/error state'leri eklenir.
5. Başarılı işlem sonrası audit log yazılır.
6. Liste yenileme ve bildirim sistemi eklenir.
