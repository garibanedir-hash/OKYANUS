# Staging Migration Test Planı

Bu plan gerçek production verisine dokunmadan Supabase staging ortamında migration test etmek için hazırlanmıştır.

## Sıra

1. `supabase/migrations/001_core_schema.sql`
2. `supabase/migrations/002_rls_policies.sql`
3. `supabase/migrations/003_seed_demo_data.sql`
4. `supabase/migrations/004_operations_and_exports.sql`
5. `supabase/migrations/005_portal_access_and_sponsorship.sql`
6. `supabase/migrations/006_lockdown_sensitive_tables.sql`

## 006 Lockdown Doğrulaması

`006_lockdown_sensitive_tables.sql` hassas tablolar için:

- RLS'i etkinleştirir.
- FORCE RLS uygular.
- `anon` rolünden table privilege'larını geri alır.
- Mevcut public SELECT policy'lerini kaldırır.

Bu işlemden sonra `npm run test:supabase` anon/publishable key ile çalıştırılmalıdır.

## Dikkat

- Service role key ile RLS smoke test yapılmaz.
- Gerçek production verisiyle test yapılmaz.
- Hassas tablolar public read'e açılmamalıdır.
- 8C'de authenticated ownership/role policy'leri ayrı migration ile eklenmelidir.

## Beklenen Sonuç

- Public tablolar okunur.
- Hassas tablolar `OK - protected` döner.
- Security warning 0 olur.
