# Veritabanı Şeması Taslağı

Bu doküman Supabase/Postgres tabanlı olası backend için önerilen tablo yapısını açıklar. SQL taslakları `docs/sql` klasöründedir.

## profiles

Amaç: Admin kullanıcı profillerini ve temel iletişim bilgilerini tutmak.

Alanlar:
- `id uuid` zorunlu, auth user id ile eşleşir.
- `full_name text` zorunlu.
- `email text` zorunlu, unique.
- `phone text` opsiyonel.
- `role app_role` zorunlu.
- `status text` zorunlu, varsayılan `active`.
- `created_at timestamptz` zorunlu.
- `updated_at timestamptz` zorunlu.

İlişkiler: `audit_logs.actor_id` ile ilişkilidir.

İndeks: `email`, `role`, `status`.

Güvenlik: Sadece yetkili adminler görebilmeli; kullanıcı kendi profilini sınırlı güncelleyebilir.

## admin_roles

Amaç: Rol tanımları ve açıklamalarını yönetmek.

Alanlar:
- `id uuid` zorunlu.
- `role app_role` zorunlu, unique.
- `label text` zorunlu.
- `description text` opsiyonel.
- `created_at timestamptz` zorunlu.

İlişkiler: `profiles.role` ile mantıksal ilişkisi vardır.

İndeks: `role`.

Güvenlik: Sadece Super Admin yönetebilmelidir.

## activity_areas

Amaç: Faaliyet alanlarını CMS/veritabanı üzerinden yönetmek.

Alanlar:
- `id uuid` zorunlu.
- `slug text` zorunlu, unique.
- `title text` zorunlu.
- `summary text` zorunlu.
- `description text` zorunlu.
- `support_types jsonb` opsiyonel.
- `sort_order int` opsiyonel.
- `published boolean` zorunlu.
- `created_at timestamptz` zorunlu.
- `updated_at timestamptz` zorunlu.

İlişkiler: `news_posts.related_activity_id` ile ilişkilendirilebilir.

İndeks: `slug`, `published`, `sort_order`.

Güvenlik: Public sadece yayınlanmış alanları okuyabilir.

## projects

Amaç: Proje içerikleri ve bağış hedeflerini tutmak.

Alanlar:
- `id uuid` zorunlu.
- `slug text` zorunlu, unique.
- `title text` zorunlu.
- `summary text` zorunlu.
- `description text` zorunlu.
- `category text` zorunlu.
- `status project_status` zorunlu.
- `location text` opsiyonel.
- `goal_amount numeric(12,2)` zorunlu.
- `raised_amount numeric(12,2)` zorunlu, hesaplanabilir.
- `start_date date` opsiyonel.
- `end_date date` opsiyonel.
- `transparency_note text` opsiyonel.
- `featured boolean` zorunlu.
- `created_at timestamptz` zorunlu.
- `updated_at timestamptz` zorunlu.

İlişkiler: `donations.project_id`, `project_updates.project_id`, `project_metrics.project_id`.

İndeks: `slug`, `status`, `category`, `featured`.

Güvenlik: Public yayınlanan projeleri okuyabilir; yazma admin rolleriyle sınırlanmalıdır.

## project_updates

Amaç: Proje gelişmeleri ve saha notlarını tutmak.

Alanlar:
- `id uuid` zorunlu.
- `project_id uuid` zorunlu.
- `title text` zorunlu.
- `content text` zorunlu.
- `published_at timestamptz` opsiyonel.
- `created_at timestamptz` zorunlu.

İlişkiler: `projects.id`.

İndeks: `project_id`, `published_at`.

Güvenlik: Public sadece yayınlanan güncellemeleri okuyabilir.

## project_metrics

Amaç: Proje özel metriklerini tutmak.

Alanlar:
- `id uuid` zorunlu.
- `project_id uuid` zorunlu.
- `label text` zorunlu.
- `value text` zorunlu.
- `sort_order int` opsiyonel.

İlişkiler: `projects.id`.

İndeks: `project_id`.

Güvenlik: Raporlama sorumlusu ve Super Admin yönetebilir.

## donations

Amaç: Bağış ön kayıtları ve bağış ana kaydını tutmak.

Alanlar:
- `id uuid` zorunlu.
- `donor_name text` zorunlu.
- `donor_email text` opsiyonel.
- `donor_phone text` opsiyonel.
- `amount numeric(12,2)` zorunlu.
- `currency text` zorunlu, varsayılan `TRY`.
- `donation_type text` zorunlu.
- `project_id uuid` opsiyonel.
- `status donation_status` zorunlu.
- `payment_status payment_status` zorunlu.
- `receipt_status receipt_status` zorunlu.
- `note text` opsiyonel.
- `created_at timestamptz` zorunlu.

İlişkiler: `projects.id`, `donation_transactions.donation_id`, `donation_receipts.donation_id`.

İndeks: `project_id`, `status`, `payment_status`, `created_at`, `donor_email`.

Güvenlik: Public insert kontrollü olabilir; read yalnızca bağış sorumlusu ve Super Admin.

## donation_transactions

Amaç: Ödeme sağlayıcısı işlem kayıtlarını tutmak.

Alanlar:
- `id uuid` zorunlu.
- `donation_id uuid` zorunlu.
- `provider text` zorunlu.
- `provider_transaction_id text` opsiyonel.
- `status payment_status` zorunlu.
- `raw_payload jsonb` opsiyonel.
- `created_at timestamptz` zorunlu.

İlişkiler: `donations.id`.

İndeks: `donation_id`, `provider_transaction_id`, `status`.

Güvenlik: Hassas payload maskelenmeli; sadece ödeme yetkili rolleri erişebilmelidir.

## donation_receipts

Amaç: Makbuz durumları ve dosya referanslarını tutmak.

Alanlar:
- `id uuid` zorunlu.
- `donation_id uuid` zorunlu.
- `receipt_no text` opsiyonel, unique.
- `status receipt_status` zorunlu.
- `file_asset_id uuid` opsiyonel.
- `issued_at timestamptz` opsiyonel.

İlişkiler: `donations.id`, `media_assets.id`.

İndeks: `donation_id`, `receipt_no`, `status`.

Güvenlik: Makbuz dosyaları private storage’da tutulmalıdır.

## volunteer_applications

Amaç: Gönüllü başvurularını takip etmek.

Alanlar:
- `id uuid` zorunlu.
- `full_name text` zorunlu.
- `email text` zorunlu.
- `phone text` opsiyonel.
- `city text` opsiyonel.
- `age int` opsiyonel.
- `interest_area text` zorunlu.
- `experience text` opsiyonel.
- `status volunteer_application_status` zorunlu.
- `note text` opsiyonel.
- `submitted_at timestamptz` zorunlu.

İlişkiler: Audit log ile işlem geçmişi tutulabilir.

İndeks: `status`, `city`, `interest_area`, `submitted_at`.

Güvenlik: Public insert; read/update sadece gönüllü koordinatörü ve Super Admin.

## contact_messages

Amaç: İletişim formu mesajlarını tutmak.

Alanlar:
- `id uuid` zorunlu.
- `full_name text` zorunlu.
- `email text` zorunlu.
- `subject text` zorunlu.
- `message text` zorunlu.
- `status message_status` zorunlu.
- `submitted_at timestamptz` zorunlu.

İndeks: `status`, `subject`, `submitted_at`.

Güvenlik: Public insert; read/update sadece yetkili adminler.

## news_posts

Amaç: Haber ve duyuru içeriklerini tutmak.

Alanlar:
- `id uuid` zorunlu.
- `slug text` zorunlu, unique.
- `title text` zorunlu.
- `category text` zorunlu.
- `summary text` zorunlu.
- `content text` zorunlu.
- `related_project_id uuid` opsiyonel.
- `related_activity_id uuid` opsiyonel.
- `status text` zorunlu.
- `published_at timestamptz` opsiyonel.
- `created_at timestamptz` zorunlu.
- `updated_at timestamptz` zorunlu.

İlişkiler: `projects.id`, `activity_areas.id`.

İndeks: `slug`, `category`, `status`, `published_at`.

Güvenlik: Public sadece yayınlanan haberleri okuyabilir.

## reports

Amaç: Faaliyet raporlarını ve PDF referanslarını tutmak.

Alanlar:
- `id uuid` zorunlu.
- `slug text` zorunlu, unique.
- `title text` zorunlu.
- `period text` zorunlu.
- `category text` zorunlu.
- `summary text` zorunlu.
- `status report_status` zorunlu.
- `pdf_asset_id uuid` opsiyonel.
- `metrics jsonb` opsiyonel.
- `published_at timestamptz` opsiyonel.

İlişkiler: `media_assets.id`.

İndeks: `slug`, `status`, `category`, `published_at`.

Güvenlik: Public sadece yayınlanan raporları okuyabilir.

## legal_pages

Amaç: Yasal sayfaları ve versiyonlanabilir metinleri tutmak.

Alanlar:
- `id uuid` zorunlu.
- `slug text` zorunlu, unique.
- `title text` zorunlu.
- `content jsonb` zorunlu.
- `version int` zorunlu.
- `status text` zorunlu.
- `published_at timestamptz` opsiyonel.
- `updated_at timestamptz` zorunlu.

İndeks: `slug`, `status`, `version`.

Güvenlik: Sadece Super Admin veya yetkili içerik editörü değiştirebilir.

## site_settings

Amaç: Site genel ayarlarını tutmak.

Alanlar:
- `id uuid` zorunlu.
- `key text` zorunlu, unique.
- `value jsonb` zorunlu.
- `updated_at timestamptz` zorunlu.

İndeks: `key`.

Güvenlik: Sadece Super Admin yönetebilmelidir.

## media_assets

Amaç: Görsel, PDF ve dosya referanslarını tutmak.

Alanlar:
- `id uuid` zorunlu.
- `bucket text` zorunlu.
- `path text` zorunlu.
- `mime_type text` zorunlu.
- `size_bytes bigint` opsiyonel.
- `alt_text text` opsiyonel.
- `created_by uuid` opsiyonel.
- `created_at timestamptz` zorunlu.

İndeks: `bucket`, `path`, `mime_type`.

Güvenlik: Upload türleri sınırlandırılmalı; private dosyalar imzalı URL ile açılmalıdır.

## audit_logs

Amaç: Admin işlemlerinin izlenebilir kayıtlarını tutmak.

Alanlar:
- `id uuid` zorunlu.
- `actor_id uuid` opsiyonel.
- `action text` zorunlu.
- `entity_type text` zorunlu.
- `entity_id uuid` opsiyonel.
- `old_value jsonb` opsiyonel.
- `new_value jsonb` opsiyonel.
- `ip_address inet` opsiyonel.
- `user_agent text` opsiyonel.
- `created_at timestamptz` zorunlu.

İlişkiler: `profiles.id`.

İndeks: `actor_id`, `entity_type`, `entity_id`, `created_at`.

Güvenlik: Audit log silinmemeli; sadece Super Admin ve yetkili denetim rolleri görebilmelidir.

## staff_profiles

Amaç: `profiles` tablosu üzerinden personel yönetimini genişletmek; sorumluluk alanı, son aktivite ve operasyonel görünürlük sağlamak.

Alanlar:
- `id uuid` zorunlu, `profiles.id` ile bire bir ilişki.
- `responsibility_area text` opsiyonel.
- `status text` zorunlu.
- `last_activity_at timestamptz` opsiyonel.
- `assigned_task_count int` türetilebilir.
- `completed_task_count int` türetilebilir.

İlişkiler: `profiles.id`.

İndeks: `status`, `responsibility_area`.

Yetki/Gizlilik: Personel bilgileri public değildir. Rol değişiklikleri audit log’a düşmelidir.

## internal_tasks

Amaç: Kurum içi görev atama ve operasyon takibini tutmak.

Alanlar:
- `id uuid` zorunlu.
- `title text` zorunlu.
- `description text` zorunlu.
- `assigned_by uuid` opsiyonel.
- `assigned_to uuid` opsiyonel.
- `priority text` zorunlu.
- `status text` zorunlu.
- `related_entity_type text` zorunlu.
- `related_entity_id uuid` opsiyonel.
- `due_date timestamptz` opsiyonel.
- `internal_notes text` opsiyonel.
- `created_at timestamptz` zorunlu.
- `updated_at timestamptz` zorunlu.
- `completed_at timestamptz` opsiyonel.

İlişkiler: `profiles.id`, ilgili entity tabloları.

İndeks: `assigned_to`, `status`, `related_entity_type/related_entity_id`, `due_date`.

Yetki/Gizlilik: Görevler sadece yetkili roller ve göreve dahil personel tarafından görülebilir. Durum değişiklikleri audit log’a düşmelidir.

## task_comments

Amaç: Görev üzerinde iç yorum ve koordinasyon notlarını tutmak.

Alanlar:
- `id uuid` zorunlu.
- `task_id uuid` zorunlu.
- `author_id uuid` opsiyonel.
- `body text` zorunlu.
- `created_at timestamptz` zorunlu.

İlişkiler: `internal_tasks.id`, `profiles.id`.

İndeks: `task_id`, `author_id`, `created_at`.

Yetki/Gizlilik: Yorumlarda bağışçı/gönüllü kişisel verisi gereksiz paylaşılmamalıdır.

## internal_conversations

Amaç: Personel arası iç konuşma başlıklarını ve ilgili görev/entity bağlantısını tutmak.

Alanlar:
- `id uuid` zorunlu.
- `subject text` zorunlu.
- `conversation_type text` zorunlu.
- `related_task_id uuid` opsiyonel.
- `related_entity_type text` opsiyonel.
- `related_entity_id uuid` opsiyonel.
- `archived_at timestamptz` opsiyonel.
- `created_at timestamptz` zorunlu.
- `updated_at timestamptz` zorunlu.

İlişkiler: `internal_tasks.id`.

İndeks: `related_task_id`, `related_entity_type/related_entity_id`, `archived_at`.

Yetki/Gizlilik: Konuşmalar yalnızca katılımcılar ve yetkili yöneticiler tarafından görülebilir.

## internal_messages

Amaç: İç konuşmalardaki mesajları tutmak.

Alanlar:
- `id uuid` zorunlu.
- `conversation_id uuid` zorunlu.
- `sender_id uuid` opsiyonel.
- `body text` zorunlu.
- `related_task_id uuid` opsiyonel.
- `related_entity_type text` opsiyonel.
- `related_entity_id uuid` opsiyonel.
- `created_at timestamptz` zorunlu.

İlişkiler: `internal_conversations.id`, `profiles.id`, `internal_tasks.id`.

İndeks: `conversation_id`, `sender_id`, `created_at`.

Yetki/Gizlilik: Mesaj içerikleri public değildir; Supabase Realtime kullanılacaksa kanal erişimi katılımcı bazlı sınırlandırılmalıdır.

## message_read_receipts

Amaç: İç mesajlar için okundu bilgisini tutmak.

Alanlar:
- `id uuid` zorunlu.
- `message_id uuid` zorunlu.
- `reader_id uuid` zorunlu.
- `read_at timestamptz` zorunlu.

İlişkiler: `internal_messages.id`, `profiles.id`.

İndeks: `message_id`, `reader_id`.

Yetki/Gizlilik: Sadece ilgili konuşma katılımcıları tarafından yönetilmelidir.

## export_logs

Amaç: Bağış ve raporlama verilerinin dışa aktarım işlemlerini izlemek.

Alanlar:
- `id uuid` zorunlu.
- `actor_id uuid` opsiyonel.
- `export_type text` zorunlu.
- `entity_type text` zorunlu.
- `filters jsonb` zorunlu.
- `masked boolean` zorunlu.
- `file_format text` zorunlu.
- `row_count int` zorunlu.
- `created_at timestamptz` zorunlu.

İlişkiler: `profiles.id`.

İndeks: `actor_id`, `created_at`, `entity_type`.

Yetki/Gizlilik: Export logları kişisel veri içermemeli; sadece Super Admin ve yetkili denetim/bağış rolleri görebilmelidir.

## user_accounts

Amaç: Supabase Auth kullanıcısını platform hesabı, hesap türü ve panel erişimiyle eşleştirmek.

Alanlar: `id`, `auth_user_id`, `full_name`, `email`, `phone`, `city`, `account_type`, `role`, `status`, `profile_completion`, `created_at`, `updated_at`.

İlişkiler: Supabase Auth user id, donor/volunteer/staff/coordinator profilleri.

Güvenlik/KVKK: Kullanıcı yalnızca kendi hesabını görebilmeli; admin erişimi rol bazlı olmalıdır.

## donor_profiles

Amaç: Bağışçı tercihleri, iletişim izinleri ve bağışçı paneli verilerini tutmak.

Alanlar: `id`, `user_account_id`, `preferred_donation_types`, `communication_permission`, `created_at`, `updated_at`.

İlişkiler: `user_accounts.id`, donations, sponsorships.

Güvenlik/KVKK: Bağışçı sadece kendi bağış ve sponsorluk kayıtlarını görmelidir.

## volunteer_profiles

Amaç: Gönüllü ilgi alanları, başvuru durumu ve faaliyet katılım bilgisini tutmak.

Alanlar: `id`, `user_account_id`, `interest_areas`, `application_status`, `city`, `created_at`, `updated_at`.

İlişkiler: `user_accounts.id`, event_applications, staff_tasks.

Güvenlik/KVKK: Gönüllü başka gönüllülerin kişisel verilerini göremez.

## sponsored_children

Amaç: Sponsorluk kapsamındaki çocuk kayıtlarının sınırlı ve güvenli temsilini tutmak.

Alanlar: `id`, `sponsorship_code`, `masked_name`, `age_range`, `region`, `education_status`, `privacy_level`, `internal_sensitive_ref`, `created_at`, `updated_at`.

İlişkiler: sponsorships.

Güvenlik/KVKK: Tam kimlik bilgisi, açık adres, okul adı, telefon ve aile detayları sponsor panelinde gösterilmemelidir. Hassas çocuk verisi katı erişim, maskeleme ve audit log gerektirir.

## sponsorships

Amaç: Sponsor ve çocuk arasındaki destek ilişkisini takip etmek.

Alanlar: `id`, `sponsor_account_id`, `sponsored_child_id`, `support_status`, `start_date`, `last_update_at`, `created_at`, `updated_at`.

İlişkiler: `user_accounts.id`, `sponsored_children.id`.

Güvenlik/KVKK: Sponsor sadece kendi sponsorluk kaydını görebilir; görüntüleme işlemi audit log’a düşmelidir.

## portal_notifications

Amaç: Bağışçı/gönüllü panel bildirimlerini tutmak.

Alanlar: `id`, `user_account_id`, `notification_type`, `title`, `summary`, `read_at`, `created_at`.

Güvenlik: Kullanıcı sadece kendi bildirimlerini okuyabilir.

## volunteer_events ve event_applications

Amaç: Gönüllü etkinliklerini ve katılım başvurularını takip etmek.

Alanlar: Etkinlik için `title`, `event_date`, `location`, `capacity`, `coordinator_id`, `status`; başvuru için `event_id`, `user_account_id`, `status`.

Güvenlik/KVKK: Gönüllü yalnızca kendi başvuru durumunu görmelidir.

## panel_access_rules ve role_permissions

Amaç: Panel erişimi ve modül bazlı yetki matrisini yönetmek.

Alanlar: Rol, modül, aksiyon, izin durumu, panel scope ve kural JSON’u.

Güvenlik: Yetki değişiklikleri sadece Super Admin tarafından yapılmalı ve audit log’a düşmelidir.

## coordinator_assignments ve staff_assignments

Amaç: Koordinatörün sorumlu olduğu ekip/faaliyet alanını ve personelin sorumluluk alanını tanımlamak.

Alanlar: `coordinator_id`, `staff_id`, `entity_type`, `entity_id`, `responsibility_area`, `created_at`.

Güvenlik: Koordinatör sadece kendi atama kapsamını, personel sadece kendi görev/sorumluluk alanını görmelidir.
