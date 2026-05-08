# Supabase Setup Notları

## Supabase projesi hazırlığı

1. Supabase dashboard üzerinde yeni proje oluşturulur.
2. Region ve database password güvenli şekilde belirlenir.
3. Project URL ve publishable/anon key alınır.
4. Secret/service role key yalnızca server-side environment alanına eklenir.

## Environment değişkenleri

`.env.example` içinde beklenen alanlar:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SECRET_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_ADMIN_DEMO_MODE`

`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` yeni önerilen public key alanıdır. `NEXT_PUBLIC_SUPABASE_ANON_KEY` legacy fallback olarak desteklenir.

## Secret key güvenliği

- `SUPABASE_SECRET_KEY` ve `SUPABASE_SERVICE_ROLE_KEY` client componentlerde import edilmemelidir.
- Bu key’ler yalnızca server-side helper, route handler, server action veya trusted backend işlemlerinde kullanılmalıdır.
- Production ortamında secret rotation planı yapılmalıdır.

## SQL draft test sırası

1. `docs/sql/001_core_schema.sql`
2. `docs/sql/002_rls_policy_draft.sql`
3. `docs/sql/003_seed_demo_data.sql`

Bu SQL dosyaları taslaktır; production ortamında doğrudan çalıştırılmamalıdır.

## RLS test senaryoları

- Public kullanıcı yayınlanmış projeleri okuyabiliyor mu?
- Public kullanıcı bağış/gönüllü/iletişim tablosunu okuyamıyor mu?
- Bağış Sorumlusu yalnızca bağış kayıtlarına erişebiliyor mu?
- Gönüllü Koordinatörü yalnızca gönüllü başvurularını yönetebiliyor mu?
- Super Admin tüm yönetim kayıtlarını görebiliyor mu?
- Audit log silme işlemi kapalı mı?

## İlk Super Admin oluşturma yaklaşımı

1. Supabase Auth üzerinden kullanıcı oluşturulur.
2. `profiles` tablosuna aynı user id ile kayıt eklenir.
3. Role `super_admin` atanır.
4. İlk giriş sonrası audit log ile kayıt alınır.

## Storage bucket önerileri

- `reports`
- `media-assets`
- `legal-documents`

## PDF ve medya yükleme güvenliği

- MIME type allowlist uygulanmalı.
- Dosya boyutu sınırı olmalı.
- Private bucket ve signed URL yaklaşımı kullanılmalı.
- PDF dosyaları antivirüs/validasyon sürecinden geçirilmeli.

## Local development notları

- `.env.local` yerelde geliştirici tarafından oluşturulur; repoya eklenmez.
- Env yokken admin demo mod açık kalır.
- Demo mod kapatılmadan önce Supabase URL ve public key girilmelidir.

## Production deployment notları

- Secret key’ler deployment platformunun secret manager alanında tutulmalıdır.
- Admin demo mode production’da `false` olmalıdır.
- RLS testleri tamamlanmadan production’a çıkılmamalıdır.
