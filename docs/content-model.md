# Okyanus İçerik Modeli Notları

Bu doküman frontend mock verilerinin ileride CMS, ödeme sistemi veya raporlama modülüne taşınmasını kolaylaştırmak için hazırlanmıştır.

## Proje veri modeli

Kaynak: `data/projects.ts`

Temel alanlar:

- `id`: CMS veya veritabanı için kalıcı benzersiz id
- `slug`: URL ve routing için okunabilir id
- `title`: proje başlığı
- `category`: proje kategorisi
- `summary`: kart ve liste özet metni
- `description`: kısa detay açıklaması
- `detail`: proje detay sayfası uzun açıklaması
- `goal`: hedeflenen destek tutarı
- `raised`: ulaşılan destek tutarı
- `status`: `Devam Ediyor`, `Tamamlandı`, `Planlanıyor`
- `location`: proje lokasyonu
- `startDate`: başlangıç tarihi
- `updatedAt`: son güncelleme tarihi
- `visualTone`: geçici görsel/placeholder tonu
- `tags`: filtreleme ve CMS taxonomy için etiketler
- `metrics`: proje özel metrikleri
- `impactItems`: bağışın neye dönüşeceği
- `scopeItems`: proje kapsamında yapılan işler
- `transparencyNote`: güven ve takip açıklaması
- `cta`: aksiyon metni ve yönlendirme linki

CMS’e taşınırken `goal`, `raised`, `status`, `location`, `startDate`, `updatedAt`, `metrics` ve `pdf/report` ilişkileri gerçek operasyon verisine bağlanmalıdır.

## Haber veri modeli

Kaynak: `data/news.ts`

Temel alanlar:

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

CMS’e geçerken haber görseli, yazar/editör, yayın durumu, SEO başlığı, SEO açıklaması, galeri ve rapor/proje ilişkileri eklenebilir.

## Faaliyet raporu veri modeli

Kaynak: `data/reports.ts`

Temel alanlar:

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

Gerçek raporlama aşamasında `pdfUrl`, yayın tarihi, rapor dosya boyutu, rapor dili, ilişkili projeler ve onay durumu eklenmelidir.

## Şeffaflık / SSS veri modeli

Kaynak: `data/transparencyFaqs.ts`

Temel alanlar:

- `id`
- `question`
- `answer`

CMS’e taşınırken kategori, sıralama, yayın durumu ve son güncelleme tarihi eklenebilir.

## Yasal sayfa veri modeli

Kaynak: `data/legalPages.ts`

Temel alanlar:

- `slug`
- `title`
- `description`
- `sections`

Resmi kullanım öncesinde tüm yasal metinler hukuki danışmanlıkla gözden geçirilmeli; veri sorumlusu, iletişim adresi ve prosedür alanları gerçek bilgilerle güncellenmelidir.

## Ödeme entegrasyonu öncesi gerçek veriye ihtiyaç duyacak alanlar

- Proje `goal` ve `raised` tutarları
- Bağış türleri ve muhasebe eşleştirme kodları
- Proje slug/id ile ödeme kaydı eşleştirmesi
- Makbuz/fatura süreçleri
- Bağışçı iletişim izinleri
- İade/iptal prosedürleri
- KVKK açık rıza ve aydınlatma metinleri

## CMS geçişinde taşınacak ana içerikler

- Projeler
- Faaliyet alanları
- Haberler / duyurular
- Faaliyet raporları
- Şeffaflık SSS içerikleri
- Yasal sayfalar
- CTA metinleri
- SEO başlık ve açıklamaları

## Admin panel entegrasyon notu

`/admin` route yapısı şu an frontend demo olarak hazırlanmıştır. Bu yapı ileride Supabase tabanlı özel admin panel, Sanity, Strapi, Payload CMS veya Directus gibi sistemlere bağlanabilir.

Admin entegrasyonu sırasında her içerik türü için aşağıdaki ortak alanlar önerilir:

- `id`
- `createdAt`
- `updatedAt`
- `createdBy`
- `updatedBy`
- `publishStatus`
- `sortOrder`
- `seoTitle`
- `seoDescription`

Bağış, gönüllü başvurusu ve iletişim mesajı gibi operasyonel kayıtlarda ayrıca işlem geçmişi, sorumlu kullanıcı, durum değişiklikleri ve KVKK uyumlu saklama politikası tutulmalıdır.

## Veritabanı tabanlı içerik yönetimi seçilirse

Klasik CMS yerine Supabase/Postgres tabanlı içerik yönetimi seçilirse mevcut TypeScript data alanları tablolara taşınır. `slug`, `title`, `summary`, `description`, `status`, `publishedAt`, `createdAt`, `updatedAt` gibi alanlar tüm içerik türlerinde ortaklaştırılabilir.

## Proje detayları için veri ilişkileri

- `projects` ana proje kaydını tutar.
- `project_updates` proje gelişmelerini tutar.
- `project_metrics` proje özel metriklerini tutar.
- `donations.project_id` proje bazlı bağış ilişkisidir.
- `reports` proje veya dönem raporlarıyla ilişkilendirilebilir.

## Haber - proje ilişki modeli

Haberler opsiyonel olarak bir projeye veya faaliyet alanına bağlanabilir:

- `news_posts.related_project_id`
- `news_posts.related_activity_id`

Bu ilişki haber detayında ilgili proje/faaliyet yönlendirmesi sağlar.

## Rapor - şeffaflık ilişkisi

Şeffaflık sayfası yayınlanmış raporları listeleyebilir. Raporlar `status = published` olduğunda public sitede görünür olur. PDF dosyası varsa `media_assets` üzerinden ilişkilendirilir.

## Legal pages versiyonlama ihtiyacı

Yasal sayfalar versiyonlanmalıdır. Her değişiklikte:

- `version` artırılır.
- Eski içerik audit log veya legal history tablosunda saklanır.
- Yayın tarihi tutulur.
- Hukuki onay durumu ayrıca eklenebilir.

## Site settings modeli

Site ayarları `site_settings` tablosunda key/value mantığıyla tutulabilir. Örnek key'ler:

- `organization`
- `contact`
- `social_links`
- `donation_defaults`
- `home_featured_projects`
- `footer_content`
