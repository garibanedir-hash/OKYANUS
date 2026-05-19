# 8F Read-only Veri Entegrasyonu

Bu aşamanın amacı mock verileri tamamen kaldırmadan, düşük riskli public içerik tablolarını Supabase üzerinden read-only okumaya başlatmaktır. CRUD, ödeme, bağış kaydı, dosya upload veya hassas tablo bağlantısı bu aşamanın parçası değildir.

## Bağlanan Tablolar

Read-only repository katmanı şu public tabloları kullanır:

- `projects`: yalnızca `active` ve `completed` projeler.
- `news_posts`: yalnızca `published` haberler.
- `reports`: yalnızca `published` faaliyet raporları.

`legal_pages` ve `site_settings` bu aşamada doğrudan UI veri kaynağına bağlanmadı. Bu tablolar public read policy altında olsa da yasal metin ve kurum ayarı içerdiği için ayrı içerik onayı ve alan bazlı allowlist kontrolüyle ele alınmalıdır.

Admin dashboard üzerinde sadece düşük riskli public içerik sayaçları okunur:

- Yayındaki proje sayısı.
- Yayındaki haber sayısı.
- Yayındaki rapor sayısı.

## Bilinçli Olarak Bağlanmayan Tablolar

Bu aşamada şu hassas tablolar uygulama veri kaynağı olarak kullanılmaz:

- `donations`
- `volunteer_applications`
- `contact_messages`
- `internal_tasks`
- `internal_messages`
- `export_logs`
- `user_accounts`
- `donor_profiles`
- `volunteer_profiles`
- `sponsored_children`
- `sponsorships`
- `role_permissions`
- `panel_access_rules`

Bu tablolar için gerçek okuma 8G/9A öncesinde authenticated role policy, ownership policy ve manuel route testleriyle ayrıca açılmalıdır.

## Repository Mimarisi

Read-only bağlantılar repository katmanında toplanır:

- `lib/data/readOnlySupabase.ts`
- `lib/data/projectsRepository.ts`
- `lib/data/newsRepository.ts`
- `lib/data/reportsRepository.ts`
- `lib/data/adminRepository.ts`

Repository davranışı:

1. Public Supabase env yoksa demo/mock veri döner.
2. Env varsa publishable/anon key ile read-only sorgu denenir.
3. Supabase hata, timeout, tablo eksikliği veya RLS engeli üretirse uygulama kırılmaz; demo fallback döner.
4. Supabase başarılı ama kayıt boşsa boş liste korunur ve sayfa empty state gösterir.
5. Repository katmanı insert/update/delete yapmaz.

## Mapping / Adapter Fonksiyonları

Supabase kolonları mevcut UI modellerine adapter ile çevrilir:

- `mapSupabaseProjectToProject`
- `mapSupabaseNewsToNewsPost`
- `mapSupabaseReportToReport`

Migration şemasında olmayan alanlar güvenli varsayılanlarla doldurulur. Örneğin proje görsel tonu, `impactItems`, `scopeItems`, haber `tags` ve rapor PDF durumu UI kırılmasın diye kontrollü fallback üretir.

## Hata Davranışı

Supabase hatalarında kullanıcı public sayfada teknik hata görmez. Development ortamında yalnızca hata kodu loglanır; URL, key, secret, şifre veya token loglanmaz.

Kısa sorgu timeout'u build ve local geliştirme sırasında beyaz ekran veya uzun bekleme riskini azaltır.

## Public / Hassas Tablo Ayrımı

Public site read-only sorgularında publishable/anon key kullanılabilir. `SUPABASE_SECRET_KEY` ve `SUPABASE_SERVICE_ROLE_KEY` client componentlerde veya public repository sorgularında kullanılmaz.

`npm run test:supabase` sonucunda `Security warning: 0` korunmalıdır. Hassas tabloların anon/public key ile okunabilir hale gelmesi 8F kapsamı dışında ve güvenlik hatasıdır.

## 8G / 9A Öncesi

CRUD aşamasına geçmeden önce:

- Server action bazlı yetki kontrolleri netleşmeli.
- RLS ownership policy'leri rol bazlı test kullanıcılarıyla tekrar doğrulanmalı.
- Admin create/update/delete işlemleri audit log tasarımıyla birlikte ele alınmalı.
- Dosya/PDF upload için private bucket ve signed URL stratejisi tamamlanmalı.
- Ödeme entegrasyonu webhook signature ve idempotency ile ayrı test edilmeli.

## 9A Notu

9A ile düşük riskli public içerikler için admin CRUD başlangıcı eklenmiştir. Read-only public repository yapısı korunur; write işlemleri ayrı server action dosyalarında ve admin-only helper üzerinden yapılır.

- Proje CRUD: `app/admin/projeler/actions.ts`
- Haber CRUD: `app/admin/haberler/actions.ts`
- Rapor CRUD: `app/admin/faaliyet-raporlari/actions.ts`
- RLS hazırlığı: `supabase/migrations/009_admin_content_crud_policies.sql`

Hard delete hâlâ kullanılmaz; arşivleme status update ile yapılır.
