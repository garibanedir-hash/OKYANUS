-- Okyanus İnsani Yardım Derneği
-- 003 Demo seed data
-- Production için değildir. Staging/demo ortamında temel public read testleri için kullanılabilir.

insert into admin_roles (role, label, description) values
  ('super_admin', 'Super Admin', 'Tüm yönetim yetkilerine sahip rol'),
  ('content_editor', 'İçerik Editörü', 'Proje ve haber içeriklerini yönetir'),
  ('donation_manager', 'Bağış Sorumlusu', 'Bağış ve makbuz süreçlerini takip eder'),
  ('volunteer_coordinator', 'Gönüllü Koordinatörü', 'Gönüllü başvurularını yönetir'),
  ('reporting_manager', 'Raporlama Sorumlusu', 'Faaliyet raporları ve metrikleri yönetir')
on conflict (role) do update set
  label = excluded.label,
  description = excluded.description;

insert into activity_areas (slug, title, summary, description, support_types, published, sort_order) values
  ('gida-erzak', 'Gıda ve Erzak Desteği', 'Ailelerin temel gıda ihtiyaçlarına destek.', 'Gıda kolisi, market kartı ve dönemsel destekler.', '["Gıda kolisi", "Market kartı"]', true, 1),
  ('egitim', 'Eğitim Desteği', 'Çocukların eğitim yolculuğuna katkı.', 'Kırtasiye, materyal ve burs destekleri.', '["Kırtasiye", "Eğitim materyali"]', true, 2),
  ('kis-yardimi', 'Kış Yardımları', 'Kış şartlarında temel destek.', 'Battaniye, mont, bot ve yakacak destekleri.', '["Battaniye", "Mont", "Bot"]', true, 3)
on conflict (slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  description = excluded.description,
  support_types = excluded.support_types,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into projects (slug, title, summary, description, category, status, location, goal_amount, raised_amount, start_date, transparency_note, featured) values
  ('bir-koli-bir-umut', 'Bir Koli Bir Umut', 'Gıda kolisi destek projesi.', 'Ailelerin temel gıda ihtiyaçlarına düzenli destek.', 'Gıda', 'active', 'İstanbul ve çevre iller', 450000, 318000, '2026-03-01', 'Bağışlar proje bazlı kayıt altına alınır.', true),
  ('yetim-cocuklara-egitim-destegi', 'Yetim Çocuklara Eğitim Desteği', 'Eğitim materyali destek projesi.', 'Çocukların okul ihtiyaçlarına destek.', 'Eğitim', 'active', 'Türkiye geneli', 600000, 372000, '2026-02-15', 'Çocuk mahremiyeti gözetilir.', true)
on conflict (slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  description = excluded.description,
  category = excluded.category,
  status = excluded.status,
  location = excluded.location,
  goal_amount = excluded.goal_amount,
  raised_amount = excluded.raised_amount,
  transparency_note = excluded.transparency_note,
  featured = excluded.featured;

insert into news_posts (slug, title, category, summary, content, status, published_at) values
  ('yardim-organizasyonu-tamamlandi', 'Yardım Organizasyonu Tamamlandı', 'Faaliyet', 'Gıda ve hijyen destekleri ulaştırıldı.', 'Demo haber içeriği.', 'published', now()),
  ('yeni-gonullu-bulusmasi', 'Yeni Gönüllü Buluşması Gerçekleşti', 'Gönüllülük', 'Gönüllü ekiplerle koordinasyon toplantısı yapıldı.', 'Demo haber içeriği.', 'published', now())
on conflict (slug) do update set
  title = excluded.title,
  category = excluded.category,
  summary = excluded.summary,
  content = excluded.content,
  status = excluded.status,
  published_at = excluded.published_at;

insert into reports (slug, title, period, category, summary, status, metrics, published_at) values
  ('2026-ilk-donem-faaliyet-ozeti', '2026 İlk Dönem Faaliyet Özeti', 'Ocak - Haziran 2026', 'Genel Faaliyet', 'Demo faaliyet raporu.', 'published', '[{"label":"Faaliyet","value":"18"}]', now()),
  ('2025-yillik-faaliyet-raporu', '2025 Yıllık Faaliyet Raporu', '2025', 'Yıllık Rapor', 'Demo yıllık rapor.', 'published', '[{"label":"Şehir","value":"18"}]', now())
on conflict (slug) do update set
  title = excluded.title,
  period = excluded.period,
  category = excluded.category,
  summary = excluded.summary,
  status = excluded.status,
  metrics = excluded.metrics,
  published_at = excluded.published_at;

insert into site_settings (key, value) values
  ('organization', '{"name":"Okyanus İnsani Yardım Derneği","email":"bilgi@okyanusyardim.org","phone":"+90 212 000 00 00"}'),
  ('donation_defaults', '{"amounts":[100,250,500,1000],"currency":"TRY"}')
on conflict (key) do update set
  value = excluded.value,
  updated_at = now();
