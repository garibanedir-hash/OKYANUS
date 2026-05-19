# 9A Admin Public İçerik CRUD Başlangıcı

9A aşamasının amacı admin panelde düşük riskli public içerik tabloları için gerçek CRUD altyapısını başlatmaktır. Bu kapsam yalnızca proje, haber ve faaliyet raporu içeriklerini kapsar.

## CRUD Kapsamı

- `projects`
- `news_posts`
- `reports`
- Yardımcı public içerik tabloları: `project_updates`, `project_metrics`

Admin route'ları:

- `/admin/projeler`, `/admin/projeler/yeni`, `/admin/projeler/[id]/duzenle`
- `/admin/haberler`, `/admin/haberler/yeni`, `/admin/haberler/[id]/duzenle`
- `/admin/faaliyet-raporlari`, `/admin/faaliyet-raporlari/yeni`, `/admin/faaliyet-raporlari/[id]/duzenle`

## Neden Sadece Public İçerik?

Projeler, haberler ve faaliyet raporları public sitede yayınlanabilen düşük riskli içeriklerdir. Bağış, ödeme, makbuz, gönüllü başvurusu, sponsorluk, çocuk/yetim, görev, personel ve iç mesaj verileri daha yüksek güvenlik gerektirir; ownership policy, audit ve operasyonel onay süreçleri tamamlanmadan CRUD'a açılmaz.

## Server Action Güvenliği

CRUD işlemleri yalnızca server action üzerinden yapılır. Client component içinde Supabase service role kullanılmaz.

Write öncesinde:

- Kullanıcı Supabase session ile doğrulanır.
- `profiles.id = auth.uid()` eşleşmesi aranır.
- `profiles.status = active` olmalıdır.
- `profiles.role` değeri `admin` veya `super_admin` olmalıdır.
- `user_accounts.account_type = admin` destekleyici sinyal olarak tutulur, tek başına güvenlik kaynağı değildir.

İlgili helper:

- `lib/auth/requireAdmin.ts`

## RLS Write Policy

Yeni migration:

- `supabase/migrations/009_admin_content_crud_policies.sql`

Bu migration:

- `is_content_admin_user()` helper fonksiyonunu ekler.
- Public içerik tabloları için authenticated admin/super_admin select/insert/update policy'leri ekler.
- Public/anon insert/update/delete açmaz.
- Hassas operasyonel tablolar için write policy eklemez.
- Hard delete açmaz; arşivleme status update ile yapılır.

## Audit Log Yaklaşımı

Best-effort audit helper:

- `lib/audit/auditLogger.ts`

Action türleri:

- `project.create`
- `project.update`
- `project.archive`
- `news.create`
- `news.update`
- `news.archive`
- `report.create`
- `report.update`
- `report.archive`

Audit log yazılamazsa CRUD işlemi patlatılmaz. Development ortamında sadece hata kodu ve işlem tipi loglanır; secret/token/şifre loglanmaz.

## Hard Delete Yerine Archive

9A'da hard delete yoktur. Silme butonları arşivleme davranışına çevrilmiştir:

- Projelerde `status = archived`
- Haberlerde `status = archived`
- Raporlarda `status = archived`

Public site yalnızca yayınlanmış/aktif içerikleri gösterdiği için arşivlenen kayıtlar public taraftan düşer.

## Validation

Server-side doğrulama yapılır:

- Başlık zorunlu.
- Slug zorunlu; boşsa başlıktan güvenli slug üretilir.
- Status enum dışına çıkamaz.
- Sayısal alanlar numeric parse edilir.
- URL alanları boş olabilir; doluysa geçerli URL veya internal path olmalıdır.
- Metrics alanı JSON `label/value` listesi veya `Etiket: Değer` satırları olarak parse edilir.

## 9B / 10 İçin Sonraki Adımlar

- 009 migration staging ortamında çalıştırılmalı.
- Admin CRUD işlemleri gerçek test admin hesabıyla denenmeli.
- Audit log yazımı doğrulanmalı.
- Draft/archived kayıtların public sitede görünmediği test edilmeli.
- Dosya/PDF upload için private bucket ve signed URL tasarımı yapılmalı.
- Bağış/ödeme/gönüllü/sponsorluk gibi hassas CRUD alanları ayrı RLS ve audit testlerinden sonra ele alınmalı.

## 9B Kurban Modülü Notu

9B'de kurban çalışmaları ayrı bir operasyon modülü olarak başlatıldı. Bu modül public içerik CRUD kapsamına dahil değildir; çünkü vekalet, ödeme, bağışçı kimliği, hisse/adet, kesim, dağıtım ve bilgilendirme süreçleri hassas operasyonel veri içerir.

9B kapsamı:

- `010_qurban_module.sql` ile veri modeli ve read policy hazırlığı.
- Public `/kurban` sayfaları.
- Admin kurban operasyon ekranları.
- Bağışçı `/panel/kurbanlarim` takip alanı.
- Koordinatör/personel kurban operasyon ve görev ekranları.

9B'de gerçek kurban order create, ödeme, makbuz, SMS/e-posta gönderimi veya dosya upload yapılmaz. Bu işlemler audit, RLS ve provider güvenlik testleri tamamlandıktan sonra ayrı aşamada açılmalıdır.
