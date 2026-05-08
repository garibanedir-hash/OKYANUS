-- RLS policy draft
-- Bu dosya taslaktır. Gerçek kullanımdan önce staging ortamında ayrıntılı test edilmelidir.

alter table profiles enable row level security;
alter table activity_areas enable row level security;
alter table projects enable row level security;
alter table project_updates enable row level security;
alter table project_metrics enable row level security;
alter table donations enable row level security;
alter table donation_transactions enable row level security;
alter table donation_receipts enable row level security;
alter table volunteer_applications enable row level security;
alter table contact_messages enable row level security;
alter table news_posts enable row level security;
alter table reports enable row level security;
alter table legal_pages enable row level security;
alter table site_settings enable row level security;
alter table media_assets enable row level security;
alter table audit_logs enable row level security;

-- Helper yaklaşımı:
-- create function current_app_role() returns app_role ...
-- Auth JWT veya profiles tablosu üzerinden rol okunmalıdır.

-- Public tarafın okuyabileceği tablolar:
-- activity_areas: published = true
-- projects: status in ('active', 'completed')
-- news_posts: status = 'published'
-- reports: status = 'published'
-- legal_pages: status = 'published'
-- site_settings: sadece public key allowlist

-- Örnek public read policy:
-- create policy "public read published projects"
-- on projects for select
-- using (status in ('active', 'completed'));

-- Sadece admin rollerinin yönetebileceği tablolar:
-- projects, news_posts, reports, legal_pages, site_settings, media_assets
-- content_editor: içerik oluşturma/düzenleme
-- reporting_manager: reports ve project_metrics
-- super_admin: tüm yönetim işlemleri

-- Bağış/gönüllü/iletişim verileri için sıkı erişim:
-- donations: donation_manager ve super_admin okuyabilir/yönetebilir
-- donation_transactions: donation_manager ve super_admin
-- donation_receipts: donation_manager ve super_admin
-- volunteer_applications: volunteer_coordinator ve super_admin
-- contact_messages: super_admin ve atanmış iletişim yetkilisi

-- Public insert örnekleri:
-- donations insert: yalnızca gerekli alanlara izin verilmeli, status server tarafında pending atanmalı.
-- volunteer_applications insert: public formdan insert mümkün olabilir.
-- contact_messages insert: public formdan insert mümkün olabilir.

-- Audit logs:
-- audit_logs insert server-side function veya trigger üzerinden yapılmalı.
-- audit_logs select sadece super_admin ve sınırlı reporting_manager yetkisiyle açılmalı.
-- audit_logs delete policy verilmemeli.

-- Kritik notlar:
-- 1. RLS, auth ve server action/API katmanı birlikte test edilmelidir.
-- 2. Payment webhook işlemleri service role veya güvenli server endpoint üzerinden yapılmalıdır.
-- 3. Hassas PII alanları public client tarafından okunmamalıdır.
-- 4. Storage bucket policy'leri tablo RLS politikalarıyla uyumlu olmalıdır.
