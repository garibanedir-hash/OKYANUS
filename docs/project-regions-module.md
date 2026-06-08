# Proje Bölgeleri Modülü

Bu modül, public proje haritasında görünen çalışma bölgelerini Supabase üzerinden yönetilebilir hale getirir. Fallback bölge datası yalnızca Supabase bağlantısı yoksa, tablo boşsa veya migration uygulanmamışsa devreye girer.

## Amaç

- Gazze, Lübnan, Mısır, Türkiye ve ileride eklenecek çalışma bölgelerini admin panelden yönetmek.
- Projeleri `projects.region_slug` alanıyla bir çalışma bölgesine bağlamak.
- Public haritada seçilen bölgenin altında o bölgeye ait gerçek projeleri ve public saha faaliyetlerini göstermek.

## Veri Modeli

`021_project_regions_and_project_region_fields.sql` migration’ı şunları ekler:

- `public.project_regions`
- `projects.region_slug`
- `projects.country`
- `projects.city`
- `projects.region_label`

`project_regions` içinde koordinat, kısa açıklama, odak alanları, kategori anahtarları, public görünürlük, aktif/pasif durumu ve yedek `metadata` alanı bulunur.

`022_project_visual_fields.sql` migration’ı proje görselleri için şunları ekler:

- `projects.cover_image_url`
- `projects.thumbnail_url`

## Admin Kullanımı

- `/admin/proje-bolgeleri`: bölge listesi
- `/admin/proje-bolgeleri/yeni`: yeni bölge oluşturma
- `/admin/proje-bolgeleri/[id]/duzenle`: bölge düzenleme
- `/admin/projeler/yeni` ve `/admin/projeler/[id]/duzenle`: proje için “Çalışma Bölgesi” seçimi

Aktif ve `visibility='public'` olan bölgeler public haritada görünür. İç kayıt veya pasif bölgeler public haritada gösterilmez.

Bölge oluşturma/düzenleme formunda admin enlem/boylam yazmak zorunda değildir. Ülke ve şehir/bölge seçiminden konum otomatik üretilir; koordinat bilgisi yalnızca “Harita konumu” olarak okunur gösterilir.

Ülke/şehir seçimi `data/geo/worldLocations.ts` içindeki hafif ve curated dataset ile çalışır. İlk production kapsamı Türkiye, Filistin, Lübnan, Mısır, Suriye, Ürdün, Irak, Yemen, Sudan, Somali, Pakistan, Bangladeş ve Afganistan gibi insani yardım operasyonlarında sık kullanılan ülkeleri kapsar. Türkiye tarafında büyükşehirler ve saha çalışmaları açısından kritik iller ayrıca eklenmiştir.

Şehir listede yoksa admin “Listede yok / özel şehir-bölge gir” seçeneğini kullanabilir. Bu durumda özel şehir/bölge adı kayda yazılır; harita konumu varsayılan olarak seçilen ülkenin merkez koordinatını kullanır. Gerekirse “Gelişmiş harita konumu” alanından yaklaşık konum manuel olarak override edilebilir.

Production’da daha geniş şehir datasına ihtiyaç olursa tüm dünya şehirlerini client bundle’a gömmek yerine ülke seçimi sonrası lazy import veya server-side lookup yaklaşımı tercih edilmelidir.

Proje formunda kapak görseli ve kart/thumbnail görseli admin dosya upload alanlarıyla yönetilir. `023_project_media_storage.sql` sonrası `project-media` bucket'ına yüklenen public URL ilgili kayda otomatik yazılır. URL alanları yalnızca “Gelişmiş: URL ile ekle” yedek seçeneği olarak korunur.

Bölge kapak görseli de aynı upload akışını kullanır ve `project_regions.cover_image_url` alanına yazılır.

## Public Harita Akışı

Public sayfalar önce Supabase `project_regions` kayıtlarını okur. Başarılı veri yoksa `data/projectRegions.ts` fallback datasına döner.

Proje eşleşme önceliği:

1. `projects.region_slug`
2. Fallback resolver
3. Türkiye fallback

Haritanın alt alanında:

- “Bu Bölgede Yürütülen Projeler”: seçili bölgeye bağlı public projeler
- “Son Saha Faaliyetleri”: seçili bölgedeki projelerin `visibility='public'` ve `status='completed'` faaliyetleri
- Veri yoksa kaliteli boş state

## Güvenlik

- Anon/public yalnızca `is_active=true` ve `visibility='public'` bölgeleri okuyabilir.
- Anon/public insert/update/delete kapalıdır.
- Admin/super_admin tüm bölge kayıtlarını okuyup yazabilir.
- Service role client tarafına taşınmaz; write işlemleri server action ve server-only repository üzerinden çalışır.

## Gelecek Geliştirmeler

- Bölge detay sayfaları
- Bölge medya yükleme sistemi
- Bölgesel bağış CTA optimizasyonu
- Bölgesel analytics ve etki raporu
- Proje faaliyetlerinden otomatik bölge istatistiği üretimi
