# Proje Medya Upload Sistemi

Bu modül proje, proje bölgesi ve proje faaliyeti görsellerinin admin panelden dosya seçilerek yüklenmesini sağlar.

## Storage Bucket

`023_project_media_storage.sql` migration’ı Supabase Storage içinde `project-media` bucket’ını oluşturur.

- Bucket public read için `public=true` yapılandırılır.
- Dosya boyutu sınırı: 5 MB.
- Desteklenen formatlar: `image/jpeg`, `image/png`, `image/webp`.
- Public/anon upload açılmaz.
- Upload/update/delete işlemleri server action üzerinden, server-only service role client ile yapılır.

## Path Standardı

Bucket içi path yapısı:

- `projects/{projectId}/cover/{uuid}.jpg`
- `projects/{projectId}/thumbnail/{uuid}.jpg`
- `regions/{regionSlug}/cover/{uuid}.jpg`
- `activities/{activityId}/activity-cover/{uuid}.jpg`

Dosya adı ve path parçaları sanitize edilir; her yükleme random UUID içerir.

## Admin Akışı

Admin formlarında URL yazma zorunluluğu yoktur. Görsel alanları:

- Dosya seçme
- Önizleme
- Desteklenen format/boyut bilgisi
- Gelişmiş: URL ile ekle yedek alanı

şeklinde çalışır.

Yeni kayıt oluştururken dosya form action ile birlikte gönderilir. Action önce gerçek kaydı oluşturur, sonra dosyayı `project-media` bucket’ına yükler ve ilgili tabloyu public URL ile günceller.

## DB Alanları

- `projects.cover_image_url`
- `projects.thumbnail_url`
- `project_regions.cover_image_url`
- `project_activities.cover_image_url`

Public kartlar ve detay sayfaları bu alanları mevcut öncelik sırasıyla kullanır.

## Güvenlik

- Client tarafına service role key taşınmaz.
- Public/anon upload endpoint’i yoktur.
- Server-side validation zorunludur.
- MIME ve boyut kontrolü server tarafında yapılır.
- PDF, SVG veya desteklenmeyen dosyalar reddedilir.

## Gelecek Geliştirmeler

- Otomatik thumbnail üretimi
- Görsel sıkıştırma / WebP dönüştürme
- Eski dosyaların güvenli temizlenmesi
- Basit crop/editör arayüzü
