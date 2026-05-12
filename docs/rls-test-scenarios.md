# RLS Test Senaryoları

Bu doküman 8B/8C öncesi Supabase RLS davranışını test etmek için hazırlanmıştır.

## Temel Kural

RLS testi anon/publishable key ile yapılmalıdır. Service role key RLS'i bypass edebileceği için public erişim testlerinde kullanılmaz.

## Public Read Beklenen Tablolar

Anon/publishable key ile yalnızca public kayıtlar okunabilmelidir:

- `projects`: `active` veya `completed`
- `news_posts`: `published`
- `reports`: `published`
- `activity_areas`: `published = true`
- `legal_pages`: `published`
- `site_settings`: yalnızca güvenli allowlist key'leri

## Varsayılan Kapalı Hassas Tablolar

Anon/publishable key ile okunmamalıdır:

- `donations`
- `donation_transactions`
- `donation_receipts`
- `volunteer_applications`
- `contact_messages`
- `internal_tasks`
- `task_comments`
- `internal_conversations`
- `internal_messages`
- `message_read_receipts`
- `export_logs`
- `user_accounts`
- `donor_profiles`
- `volunteer_profiles`
- `sponsored_children`
- `sponsorships`
- `portal_notifications`
- `volunteer_events`
- `event_applications`
- `panel_access_rules`
- `role_permissions`
- `coordinator_assignments`
- `staff_assignments`
- `profiles`
- `admin_roles`
- `audit_logs`
- `media_assets`

## Smoke Test Beklentisi

`npm run test:supabase` çıktısında:

- Public tablolar için `OK - public read`
- Hassas tablolar için `OK - protected`
- Tablo yoksa `migration uygulanmamış olabilir`
- Hassas tablo okunursa `FAIL / SECURITY WARNING`

Security warning sayısı 0'dan büyükse script exit code 1 ile bitmelidir.

## 8C Notu

8C aşamasında authenticated ownership/role-based policies eklenecektir. Bu aşamada hassas tabloların varsayılan kapalı kalması önceliklidir.

## Route Guard ve RLS İlişkisi

8C route guard hazırlığı, kullanıcının doğru panele yönlendirilmesini ve korumalı route'lara oturumsuz erişimi engellemeyi hedefler. Bu katman tek başına veri güvenliği sayılmaz.

RLS testlerinde ayrıca şu senaryolar doğrulanmalıdır:

- Bağışçı yalnızca kendi `donations`, `donation_receipts` ve `sponsorships` kayıtlarını okuyabilmelidir.
- Sponsor yalnızca kendi sponsorluk kayıtlarını ve maskeli çocuk/sponsorluk özetini görebilmelidir.
- Gönüllü yalnızca kendi başvuru, etkinlik ve görev kapsamındaki kayıtları görebilmelidir.
- Personel yalnızca kendi görevleri, yorumları ve mesaj konuşmalarını görebilmelidir.
- Koordinatör yalnızca kendi `coordinator_assignments` kapsamındaki ekip/faaliyet verisini görebilmelidir.
- Admin rolleri yalnızca `role_permissions` ile izin verilen modülleri okuyup yönetebilmelidir.

Service role key bu testlerde kullanılmamalıdır; çünkü RLS'i bypass eder.
