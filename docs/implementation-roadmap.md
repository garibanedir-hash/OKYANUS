# Gerçek Sisteme Geçiş Yol Haritası

## Faz 1: Teknik karar ve altyapı hazırlığı

- Teknik karar dokümanı onaylanır.
- Supabase projesi kurulur.
- Environment değişkenleri belirlenir.
- SQL migration taslakları staging ortamında test edilir.
- Storage bucket stratejisi belirlenir.
- Supabase client/server/admin helperları hazırlanır.
- Next.js 16 proxy hazırlığı yapılır.
- Admin demo mode flag belirlenir.
- Admin login taslağı hazırlanır.
- Admin route guard helper eklenir.
- Supabase setup dokümantasyonu hazırlanır.
- Auth implementation notları yazılır.

## Faz 2: Auth ve yetkilendirme

- Supabase Auth kurulur.
- Admin route koruma eklenir.
- Rol bazlı yetkilendirme uygulanır.
- Profile ve role yönetimi oluşturulur.
- Yetkisiz erişim ekranı hazırlanır.
- Gerçek Supabase project oluşturulur.
- SQL migration testleri yapılır.
- İlk Super Admin oluşturulur.
- RLS doğrulama senaryoları çalıştırılır.
- Admin CRUD read-only bağlantı denemesi yapılır.

## Faz 3: İçerik CRUD ve medya

- Proje, haber ve rapor gerçek CRUD işlemleri bağlanır.
- Media/PDF upload akışı eklenir.
- Audit log temel entegrasyonu yapılır.
- Yayınlama/taslak akışı uygulanır.

## Faz 4: Bağış ve ödeme

- Bağış formu gerçek kayıt oluşturur.
- Ödeme sağlayıcısı entegrasyonu yapılır.
- Webhook endpoint'i eklenir.
- Makbuz süreci tasarlanır.
- Bağışçı bilgilendirme e-postası eklenir.

## Faz 5: Operasyonel kayıtlar

- Gönüllü başvuru yönetimi gerçek veriye bağlanır.
- İletişim mesajı yönetimi gerçek veriye bağlanır.
- E-posta bildirimleri eklenir.
- Durum değişiklikleri audit log ile takip edilir.

## Faz 6: Uyum, performans ve yayın

- KVKK kontrolleri tamamlanır.
- Veri saklama/imha politikası uygulanır.
- Performans optimizasyonları yapılır.
- Backup stratejisi kurulur.
- Deployment ve monitoring ayarlanır.
- Güvenlik testleri yapılır.

## 8A Ek Modül: Operasyon ve export hazırlığı

- Donation export/reporting hazırlığı yapılır.
- CSV export fallback, Excel/XLSX ve PDF rapor mimarisi hazırlanır.
- Export işlemleri için maskeleme, RBAC ve audit log gereklilikleri tanımlanır.
- Internal task management hazırlığı yapılır.
- Internal messaging hazırlığı yapılır.
- Staff/personnel management hazırlığı yapılır.
- Operations migration draft hazırlanır.
- Export security/audit preparation tamamlanır.

## 8A sonrası önerilen alt aşamalar

- 8B gerçek Supabase staging test.
- 8C görev ve iç iletişim read-only test.
- 8D export sisteminin gerçek veriyle güvenlik testi.
