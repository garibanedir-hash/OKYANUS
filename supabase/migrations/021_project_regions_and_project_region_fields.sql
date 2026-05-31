-- Okyanus Insani Yardim Dernegi
-- 021 Project regions and project-region binding
-- Bu migration makbuz, odeme, PayTR veya proje faaliyetleri backend akisini degistirmez.

create table if not exists public.project_regions (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  country text,
  region_label text,
  tagline text,
  description text,
  short_description text,
  coords_lng numeric,
  coords_lat numeric,
  priority_label text,
  operating_model text,
  beneficiary_estimate text,
  active_project_count integer,
  focus_areas text[] not null default '{}'::text[],
  categories text[] not null default '{}'::text[],
  cover_image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  visibility text not null default 'public',
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_regions_visibility_check check (visibility in ('public', 'internal')),
  constraint project_regions_coords_lng_check check (coords_lng is null or (coords_lng >= -180 and coords_lng <= 180)),
  constraint project_regions_coords_lat_check check (coords_lat is null or (coords_lat >= -90 and coords_lat <= 90))
);

create index if not exists project_regions_slug_idx on public.project_regions(slug);
create index if not exists project_regions_public_idx
  on public.project_regions(sort_order, name)
  where is_active = true and visibility = 'public';
create index if not exists project_regions_active_idx on public.project_regions(is_active, visibility);

alter table if exists public.projects
  add column if not exists region_slug text,
  add column if not exists country text,
  add column if not exists city text,
  add column if not exists region_label text;

create index if not exists projects_region_slug_idx on public.projects(region_slug);

alter table public.project_regions enable row level security;
alter table public.project_regions force row level security;

revoke all on table public.project_regions from anon;

grant select on table public.project_regions to anon;
grant select, insert, update, delete on table public.project_regions to authenticated;

do $$ begin
  create policy "public read active project regions"
  on public.project_regions for select to anon
  using (is_active = true and visibility = 'public');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "admin manage project regions"
  on public.project_regions for all to authenticated
  using (public.has_any_role(array['super_admin', 'admin']))
  with check (public.has_any_role(array['super_admin', 'admin']));
exception when duplicate_object then null; end $$;

insert into public.project_regions (
  slug,
  name,
  country,
  region_label,
  tagline,
  description,
  short_description,
  coords_lng,
  coords_lat,
  priority_label,
  operating_model,
  beneficiary_estimate,
  active_project_count,
  focus_areas,
  categories,
  sort_order,
  is_active,
  visibility,
  metadata
)
values
  (
    'gazze',
    'Gazze',
    'Filistin',
    'Doğu Akdeniz kriz hattı',
    'Acil insani yardım ve temel yaşam desteği',
    'Gazze hattında gıda, hijyen, sağlık ve barınma ihtiyaçları önceliklendirilir. Bağışlar, insan onurunu gözeten yardım çalışmalarıyla ihtiyaç sahibi ailelere ulaştırılır.',
    'Acil gıda, sağlık, hijyen ve barınma desteğinin önceliklendirildiği saha hattı.',
    34.39,
    31.45,
    'Kriz müdahalesi',
    'Yerel temas, lojistik teyit ve dönemsel raporlama',
    '8.000+ kişi hedefi',
    2,
    array['Acil yardım', 'Gıda', 'Sağlık', 'Barınma'],
    array['emergency', 'food', 'health', 'shelter', 'qurban'],
    10,
    true,
    'public',
    jsonb_build_object(
      'relatedProjectSlugs', array['gazze-acil-yardim', 'kurban-organizasyonu', 'temiz-suya-ulasim'],
      'recentUpdates', jsonb_build_array(
        jsonb_build_object('title', 'Gıda desteği hazırlıkları tamamlandı', 'dateLabel', 'Son güncelleme', 'summary', 'Aile ihtiyaç listeleri saha temaslarıyla güncellendi; destek paketleri öncelik sırasına göre planlandı.'),
        jsonb_build_object('title', 'Hijyen desteği için ihtiyaç tespiti yapıldı', 'dateLabel', 'Saha notu', 'summary', 'Hijyen ve temel yaşam desteği başlıkları aile bazlı ihtiyaçlarla eşleştirildi.')
      )
    )
  ),
  (
    'lubnan',
    'Lübnan',
    'Lübnan',
    'Mülteci ve aile destek hattı',
    'Mülteci aileler, çocuklar ve eğitim destekleri',
    'Lübnan bölgesinde mülteci ailelerin temel ihtiyaçları, çocukların eğitim materyalleri ve aile destekleri düzenli programlarla ele alınır.',
    'Mülteci aileler, eğitim desteği ve temel gıda ihtiyaçları için sürdürülebilir programlar.',
    35.85,
    33.85,
    'Aile ve eğitim desteği',
    'Programlı yardım, aile takibi ve eğitim materyali desteği',
    '1.200+ çocuk ve aile',
    1,
    array['Mülteci destekleri', 'Gıda', 'Eğitim'],
    array['food', 'education', 'orphan'],
    20,
    true,
    'public',
    jsonb_build_object(
      'relatedProjectSlugs', array['yetim-cocuklara-egitim-destegi', 'bir-koli-bir-umut'],
      'recentUpdates', jsonb_build_array(
        jsonb_build_object('title', 'Eğitim setleri için aile listeleri güncellendi', 'dateLabel', 'Program takibi', 'summary', 'Çocukların eğitim dönemi ihtiyaçları kırtasiye ve temel destek başlıklarıyla yeniden planlandı.'),
        jsonb_build_object('title', 'Aile destek çalışması sürdürüldü', 'dateLabel', 'Saha notu', 'summary', 'Mülteci ailelere yönelik gıda ve temel ihtiyaç desteği için dönemsel takip yapıldı.')
      )
    )
  ),
  (
    'misir',
    'Mısır',
    'Mısır',
    'Lojistik ve geçiş destekleri',
    'Bölgesel lojistik, sağlık ve geçiş destekleri',
    'Mısır hattı, temiz su, sağlık/hijyen ve bölgesel geçiş desteklerinin planlandığı tamamlayıcı bir insani yardım çalışma alanıdır.',
    'Lojistik hazırlık, sağlık ve geçiş destekleriyle bölgesel insani yardım akışını güçlendiren hat.',
    31.0,
    28.5,
    'Lojistik hazırlık',
    'Geçiş desteği ve sağlık/hijyen lojistiği',
    '2.400+ faydalanıcı',
    1,
    array['Lojistik', 'Sağlık', 'Geçiş destekleri'],
    array['health', 'water', 'emergency'],
    30,
    true,
    'public',
    jsonb_build_object(
      'relatedProjectSlugs', array['temiz-suya-ulasim', 'gazze-acil-yardim'],
      'recentUpdates', jsonb_build_array(
        jsonb_build_object('title', 'Temiz su ve hijyen desteği planlandı', 'dateLabel', 'Son güncelleme', 'summary', 'Su ve hijyen ihtiyaçları için öncelikli destek noktaları belirlendi.'),
        jsonb_build_object('title', 'Sağlık desteği hazırlıkları gözden geçirildi', 'dateLabel', 'Saha notu', 'summary', 'Bölgesel ihtiyaçlara göre sağlık ve geçiş destekleri için hazırlık listesi güncellendi.')
      )
    )
  ),
  (
    'turkiye',
    'Türkiye',
    'Türkiye',
    'Merkez, afet ve sosyal destek ağı',
    'Merkez koordinasyon, afet ve sosyal destek çalışmaları',
    'Türkiye hattı, dernek merkez koordinasyonu, afet yardımı, sosyal destek, yetim ve aile destek programlarının planlandığı ana çalışma alanıdır.',
    'Sosyal destek, afet yardımı, yetim ve aile destekleri için merkez ve saha koordinasyonu.',
    37.5,
    38.6,
    'Merkez koordinasyon',
    'Merkez ekip, saha gönüllüleri ve sosyal destek ağı',
    '3.500+ aile hedefi',
    2,
    array['Sosyal destek', 'Afet yardımı', 'Yetim', 'Aile destekleri'],
    array['food', 'orphan', 'education', 'emergency'],
    40,
    true,
    'public',
    jsonb_build_object(
      'relatedProjectSlugs', array['bir-koli-bir-umut', 'kis-gelmeden', 'yetim-cocuklara-egitim-destegi'],
      'recentUpdates', jsonb_build_array(
        jsonb_build_object('title', 'Aile destek çalışmaları güncellendi', 'dateLabel', 'Son güncelleme', 'summary', 'Sosyal destek başvuruları ve aile ihtiyaçları öncelik durumuna göre yeniden sınıflandırıldı.'),
        jsonb_build_object('title', 'Kış desteği hazırlıkları başlatıldı', 'dateLabel', 'Program notu', 'summary', 'Battaniye, giyim ve yakacak destekleri için bölge bazlı ihtiyaç hazırlığı yapıldı.')
      )
    )
  )
on conflict (slug) do update
set
  name = excluded.name,
  country = excluded.country,
  region_label = excluded.region_label,
  tagline = excluded.tagline,
  description = excluded.description,
  short_description = excluded.short_description,
  coords_lng = excluded.coords_lng,
  coords_lat = excluded.coords_lat,
  priority_label = excluded.priority_label,
  operating_model = excluded.operating_model,
  beneficiary_estimate = excluded.beneficiary_estimate,
  active_project_count = excluded.active_project_count,
  focus_areas = excluded.focus_areas,
  categories = excluded.categories,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  visibility = excluded.visibility,
  metadata = public.project_regions.metadata || excluded.metadata,
  updated_at = now();

comment on table public.project_regions is
  'Public/admin managed project working regions used by the public projects map and project-region binding.';

comment on column public.project_regions.metadata is
  'Optional safe public metadata such as related project slugs and fallback recent updates. Do not store secrets or internal notes here.';

comment on column public.projects.region_slug is
  'Optional working region slug. Public project maps use this before fallback title/slug inference.';
