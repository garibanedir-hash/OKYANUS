-- Okyanus Insani Yardim Dernegi
-- 023 Project / region / activity public media storage
-- Bu migration makbuz, odeme, PayTR veya private receipt storage akisini degistirmez.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'project-media',
  'project-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  create policy "project_media_public_read"
    on storage.objects
    for select
    to anon, authenticated
    using (bucket_id = 'project-media');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create policy "project_media_service_role_manage"
    on storage.objects
    for all
    to service_role
    using (bucket_id = 'project-media')
    with check (bucket_id = 'project-media');
exception
  when duplicate_object then null;
end $$;

comment on column public.projects.cover_image_url is
  'Public project media URL. Prefer project-media storage uploads from admin server actions.';

comment on column public.projects.thumbnail_url is
  'Public project thumbnail URL. Prefer project-media storage uploads from admin server actions.';
