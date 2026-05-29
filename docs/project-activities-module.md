# Proje Faaliyetleri / Saha Güncellemeleri Modülü

## Amaç

11A ile projeler yalnızca statik tanıtım kaydı olmaktan çıkarılıp, her projenin altında saha ziyareti, dağıtım, eğitim, sağlık desteği, raporlama ve benzeri faaliyetlerin takip edildiği operasyon kayıtlarına bağlandı.

Bu modül makbuz, ödeme, PayTR callback veya manuel makbuz akışlarını değiştirmez.

## Veri Modeli

Migration: `supabase/migrations/020_project_activities.sql`

Ana tablolar:

- `project_activities`: proje bazlı faaliyet/güncelleme kayıtları
- `project_activity_events`: faaliyet status/görünürlük/audit olayları

Temel alanlar:

- proje ilişkisi: `project_id`
- operasyon: `activity_type`, `status`, `visibility`
- lokasyon: `country`, `city`, `district`, `location_name`, `region_label`
- etki: `beneficiary_count`, `family_count`, `distributed_item_type`, `distributed_item_count`
- içerik: `summary`, `description`, `public_summary`, `internal_notes`
- medya/rapor: `cover_image_url`, `gallery_urls`, `video_url`, `report_url`

## Internal / Public Ayrımı

`visibility = internal` kayıtları yalnızca admin ekranlarında kullanılır.

`visibility = public` kayıtları public proje detay sayfasında ancak `status = completed` ise gösterilir.

Public repository yalnızca güvenli alanları döndürür:

- başlık
- tür etiketi
- tarih
- lokasyon etiketi
- public özet
- yararlanıcı/aile sayısı
- dağıtım bilgisi
- kapak görseli ve rapor linki

Public alanda gösterilmeyen alanlar:

- `internal_notes`
- `estimated_cost`
- `responsible_user_id`
- `created_by`
- `updated_by`
- `metadata`
- event kayıtları

## Status Workflow

İlk sürümde desteklenen durumlar:

- `draft`: taslak
- `planned`: planlandı
- `in_progress`: devam ediyor
- `completed`: tamamlandı
- `cancelled`: iptal edildi
- `archived`: arşivlendi

Admin action kuralları:

- archived kayıtlar terminal kabul edilir.
- cancelled kayıtlar düzenlenmez, yalnızca arşivlenebilir.
- public görünürlük için kayıt completed olmalıdır.
- iptal işleminde gerekçe zorunludur.

## Admin Kullanım Akışı

Proje listesinde her proje için `Faaliyetler` bağlantısı bulunur:

`/admin/projeler/{projectId}/faaliyetler`

Admin burada:

- faaliyet listeler
- yeni faaliyet oluşturur
- faaliyet detayını açar
- düzenleme yapar
- tamamlandı işaretler
- public/internal görünürlüğü değiştirir
- iptal eder
- arşivler

Genel operasyon görünümü:

`/admin/faaliyet-kayitlari`

## Public Proje Sayfası

`/projeler/[slug]` sayfasında `Proje Faaliyetleri` bölümü eklendi.

Bu bölüm sadece şu kayıtları gösterir:

- `visibility = public`
- `status = completed`

Public faaliyet yoksa bölüm gizlenir.

## 11A.2 Public Harita ve Çalışma Bölgeleri

Public proje deneyimi çalışma bölgeleriyle güçlendirildi:

- Gazze
- Lübnan
- Mısır
- Türkiye

İlk aşamada bu bölgeler `data/projectRegions.ts` içindeki güvenli fallback veriyle yönetilir. Admin proje CRUD veya `project_activities` veri modeli değiştirilmez.

Public `/projeler` sayfasında önce çalışma bölgeleri haritası ve bölge detay paneli, ardından bölge/kategori filtreli proje listesi gösterilir. Ana sayfada aynı yapının kompakt “Nerelerde Çalışıyoruz?” özeti yer alır.

Harita hafif SVG/HTML/CSS tabanlıdır; Mapbox, Google Maps veya API key gerektiren ağır bir entegrasyon kullanılmaz.

Supabase `projects` tablosunda bölge alanı olmadığı için public mapping şu sırayla fallback yapar:

- proje `regionSlug` alanı varsa onu kullanır
- slug/title/category/location/tags üzerinden Gazze, Lübnan, Mısır veya Türkiye eşleştirmesi yapar
- eşleşme yoksa güvenli varsayılan olarak Türkiye bölgesine bağlar

Bu görsel sunum public-only deneyim katmanıdır; makbuz, ödeme, PayTR veya manuel makbuz akışlarını etkilemez.

## RLS ve Güvenlik

Migration şu güvenlik yaklaşımını kullanır:

- `project_activities` RLS enabled/forced.
- anon yalnızca completed/public faaliyetlerin güvenli kolonlarını okuyabilir.
- anon insert/update/delete yoktur.
- `project_activity_events` anon/public erişime kapalıdır.
- admin/super_admin tüm kayıtları yönetebilir.
- server action'lar `requireAdminUser()` ile korunur.
- service role client tarafına taşınmaz.

Smoke test:

- `project_activities: OK - public completed read`
- `project_activity_events: OK - protected`

## Gelecek Geliştirmeler

- medya upload ve private/public asset yönetimi
- harcama/masraf kaydı bağlantısı
- personel/koordinatör atama
- faaliyet raporu export
- proje ilerleme metriğini faaliyetlerden otomatik üretme
- public faaliyet detay sayfası
