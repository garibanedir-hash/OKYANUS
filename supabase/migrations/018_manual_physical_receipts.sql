-- Okyanus Insani Yardim Dernegi
-- 018 Manual / physical receipt module
-- Bu migration online odeme sonrasi olusan dijital receipts akisini degistirmez.
-- Elden, saha, ofis veya fiziksel tahsilat makbuzlari icin ayri model kurar.

do $$ begin
  create type manual_receipt_status as enum (
    'draft',
    'prepared',
    'printed',
    'delivered',
    'signed',
    'archived',
    'cancelled'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type manual_receipt_payment_method as enum (
    'cash',
    'bank_transfer',
    'pos',
    'manual_card',
    'in_kind',
    'other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type manual_receipt_donation_type as enum (
    'general_donation',
    'qurban',
    'orphan_sponsorship',
    'zakat',
    'sadaqah',
    'emergency_aid',
    'project_donation',
    'campaign_donation',
    'in_kind_donation',
    'other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type manual_receipt_output_type as enum (
    'a4_landscape',
    'thermal_80mm',
    'booklet',
    'custom_form'
  );
exception when duplicate_object then null; end $$;

create sequence if not exists public.manual_receipt_no_seq
  as bigint
  start with 1
  increment by 1;

create or replace function public.generate_manual_receipt_no()
returns text
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  return 'MRC-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.manual_receipt_no_seq')::text, 6, '0');
end;
$$;

create table if not exists public.manual_receipts (
  id uuid primary key default gen_random_uuid(),
  receipt_no text unique not null default public.generate_manual_receipt_no(),
  serial_no text,
  sequence_no integer,
  booklet_no text,
  output_type manual_receipt_output_type not null default 'a4_landscape',
  status manual_receipt_status not null default 'draft',
  receipt_date timestamptz not null default now(),
  branch_name text,
  unit_name text,
  donor_type text default 'individual',
  donor_name text not null,
  donor_phone text,
  donor_email text,
  donor_tax_id text,
  donor_address text,
  donation_type manual_receipt_donation_type not null default 'general_donation',
  donation_type_other text,
  campaign_name text,
  project_name text,
  amount numeric(14,2) not null check (amount > 0),
  currency text not null default 'TRY',
  amount_in_words text,
  payment_method manual_receipt_payment_method not null default 'cash',
  payment_method_other text,
  purpose text,
  description text,
  collector_name text,
  collector_user_id uuid,
  collector_role text,
  accounting_officer_name text,
  approved_by_name text,
  created_by uuid,
  updated_by uuid,
  printed_count integer not null default 0 check (printed_count >= 0),
  last_printed_at timestamptz,
  delivered_at timestamptz,
  signed_at timestamptz,
  archived_at timestamptz,
  cancelled_at timestamptz,
  cancelled_by uuid,
  cancelled_reason text,
  file_bucket text,
  file_path text,
  file_mime_type text default 'application/pdf',
  file_size_bytes bigint,
  file_sha256 text,
  generated_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.manual_receipt_events (
  id uuid primary key default gen_random_uuid(),
  manual_receipt_id uuid references public.manual_receipts(id) on delete cascade,
  event_type text not null,
  old_status manual_receipt_status,
  new_status manual_receipt_status,
  actor_id uuid,
  actor_role text,
  note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists manual_receipts_receipt_no_idx on public.manual_receipts(receipt_no);
create index if not exists manual_receipts_status_idx on public.manual_receipts(status);
create index if not exists manual_receipts_receipt_date_idx on public.manual_receipts(receipt_date desc);
create index if not exists manual_receipts_donor_name_idx on public.manual_receipts(donor_name);
create index if not exists manual_receipts_branch_unit_idx on public.manual_receipts(branch_name, unit_name);
create index if not exists manual_receipts_file_path_idx on public.manual_receipts(file_bucket, file_path) where file_path is not null;
create index if not exists manual_receipt_events_receipt_idx on public.manual_receipt_events(manual_receipt_id, created_at desc);

alter table public.manual_receipts enable row level security;
alter table public.manual_receipt_events enable row level security;
alter table public.manual_receipts force row level security;
alter table public.manual_receipt_events force row level security;

revoke all on table public.manual_receipts from anon;
revoke all on table public.manual_receipt_events from anon;

grant select, insert, update on table public.manual_receipts to authenticated;
grant select, insert on table public.manual_receipt_events to authenticated;

do $$ begin
  create policy "admin manage manual receipts"
  on public.manual_receipts for all to authenticated
  using (public.has_any_role(array['super_admin', 'admin']))
  with check (public.has_any_role(array['super_admin', 'admin']));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "admin manage manual receipt events"
  on public.manual_receipt_events for all to authenticated
  using (public.has_any_role(array['super_admin', 'admin']))
  with check (public.has_any_role(array['super_admin', 'admin']));
exception when duplicate_object then null; end $$;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'manual-receipts-private',
  'manual-receipts-private',
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
  create policy "manual_receipts_private_service_role_manage"
    on storage.objects
    for all
    to service_role
    using (bucket_id = 'manual-receipts-private')
    with check (bucket_id = 'manual-receipts-private');
exception
  when duplicate_object then null;
end $$;

comment on table public.manual_receipts is
  'Manual / physical donation receipts for cash, field, office or booklet-style collection flows. Separate from digital payment receipts.';

comment on column public.manual_receipts.file_path is
  'Private storage object path for generated manual receipt PDF. Do not expose directly to public/client routes.';

comment on column public.manual_receipts.cancelled_reason is
  'Required business reason when a manual/physical receipt is cancelled.';
