-- Okyanus Insani Yardim Dernegi
-- 022 Project visual fields for public region map cards
-- Bu migration makbuz, odeme, PayTR veya RLS policy akisini degistirmez.

alter table if exists public.projects
  add column if not exists cover_image_url text,
  add column if not exists thumbnail_url text;

comment on column public.projects.cover_image_url is
  'Optional public-safe project cover image URL used by project cards and region map sections.';

comment on column public.projects.thumbnail_url is
  'Optional public-safe project thumbnail URL used by compact project cards.';
