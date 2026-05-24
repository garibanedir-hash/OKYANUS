-- 10D: Receipt PDF metadata and private Supabase Storage bucket.
-- This migration does not expose receipt files publicly.

alter table if exists public.receipts
  add column if not exists file_bucket text,
  add column if not exists file_path text,
  add column if not exists file_mime_type text not null default 'application/pdf',
  add column if not exists file_size_bytes bigint,
  add column if not exists file_sha256 text,
  add column if not exists generated_at timestamptz,
  add column if not exists generated_by uuid,
  add column if not exists issued_by uuid,
  add column if not exists version integer not null default 1,
  add column if not exists cancelled_reason text,
  add column if not exists last_downloaded_at timestamptz;

create index if not exists receipts_file_path_idx
  on public.receipts(file_bucket, file_path)
  where file_path is not null;

create index if not exists receipts_generated_at_idx
  on public.receipts(generated_at desc)
  where generated_at is not null;

create index if not exists receipts_donor_file_idx
  on public.receipts(donor_account_id, status, generated_at desc)
  where donor_account_id is not null;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'receipts-private',
  'receipts-private',
  false,
  5242880,
  array['application/pdf']
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  create policy "receipts_private_service_role_manage"
    on storage.objects
    for all
    to service_role
    using (bucket_id = 'receipts-private')
    with check (bucket_id = 'receipts-private');
exception
  when duplicate_object then null;
end $$;

comment on column public.receipts.file_url is
  'Legacy/demo field. Production receipt PDF access must use private storage file_path and a server-side authorization route.';

comment on column public.receipts.file_path is
  'Private storage object path. Do not expose directly to public/client routes.';

comment on column public.receipts.file_sha256 is
  'SHA-256 hash of the generated PDF file for integrity checks.';
