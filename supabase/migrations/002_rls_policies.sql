-- Okyanus İnsani Yardım Derneği
-- 002 RLS policies migration-ready draft
-- Bu dosya destructive değildir. Staging ortamında Supabase Auth/JWT rolleriyle test edilmelidir.

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

-- Public read policy taslakları. Policy isimleri IF NOT EXISTS desteklemediği için DO blokları kullanılır.
do $$ begin
  create policy "public read published activity areas"
  on activity_areas for select
  using (published = true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "public read active projects"
  on projects for select
  using (status in ('active', 'completed'));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "public read published news"
  on news_posts for select
  using (status = 'published');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "public read published reports"
  on reports for select
  using (status = 'published');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "public read published legal pages"
  on legal_pages for select
  using (status = 'published');
exception when duplicate_object then null; end $$;

-- Güvenlik notları:
-- donations, volunteer_applications, contact_messages, internal_* ve portal hesap tabloları public read'e açılmamalıdır.
-- Admin write/update/delete policy'leri gerçek profiles/admin_roles yapısı ve JWT claims doğrulandıktan sonra eklenmelidir.
-- Payment webhook işlemleri service role kullanılan güvenli server endpoint üzerinden yapılmalıdır.
-- Storage bucket policy'leri ayrıca reports, media-assets ve legal-documents bucket'ları için test edilmelidir.
