-- Okyanus Insani Yardim Dernegi
-- 014 Common payment, receipt and notification infrastructure
-- Amac: Genel bagis, kurban ve yetim hamilligi icin provider-bagimsiz
-- odeme niyeti, makbuz hazirligi, bildirim kuyrugu ve webhook/idempotency
-- hazirlik modelini kurmak.
-- Bu migration gercek odeme entegrasyonu degildir.
-- Kart numarasi, CVV, banka sifresi veya hassas odeme verisi saklanmaz.

do $$ begin
  create type payment_context_type as enum (
    'general_donation',
    'qurban_order',
    'orphan_sponsorship',
    'project_donation',
    'campaign_donation',
    'manual_admin_entry'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_provider as enum (
    'manual',
    'bank_transfer',
    'virtual_pos',
    'iyzico',
    'paytr',
    'stripe',
    'other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_intent_status as enum (
    'draft',
    'pending',
    'initiated',
    'requires_action',
    'paid',
    'failed',
    'cancelled',
    'expired',
    'refunded'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_event_type as enum (
    'created',
    'initiated',
    'provider_callback_received',
    'paid',
    'failed',
    'cancelled',
    'refunded',
    'expired',
    'manually_marked_paid',
    'manually_cancelled'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type receipt_status as enum (
    'not_required',
    'pending',
    'prepared',
    'issued',
    'cancelled',
    'failed'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type notification_channel as enum (
    'email',
    'sms',
    'whatsapp',
    'system'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type notification_queue_status as enum (
    'pending',
    'processing',
    'sent',
    'failed',
    'cancelled',
    'skipped'
  );
exception when duplicate_object then null; end $$;

create sequence if not exists public.payment_intent_seq
  as bigint
  start with 1
  increment by 1;

create sequence if not exists public.receipt_seq
  as bigint
  start with 1
  increment by 1;

create or replace function public.generate_payment_intent_no()
returns text
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  return 'PAY-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.payment_intent_seq')::text, 6, '0');
end;
$$;

create or replace function public.generate_receipt_no()
returns text
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  return 'RCPT-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.receipt_seq')::text, 6, '0');
end;
$$;

create table if not exists public.payment_intents (
  id uuid primary key default gen_random_uuid(),
  intent_no text unique not null default public.generate_payment_intent_no(),
  context_type payment_context_type not null,
  context_id uuid,
  donor_account_id uuid references public.user_accounts(id) on delete set null,
  donor_name text,
  donor_email text,
  donor_phone text,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'TRY',
  provider payment_provider not null default 'manual',
  provider_reference text,
  idempotency_key text unique,
  status payment_intent_status not null default 'pending',
  return_url text,
  cancel_url text,
  metadata jsonb not null default '{}'::jsonb,
  expires_at timestamptz,
  paid_at timestamptz,
  failed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  payment_intent_id uuid references public.payment_intents(id) on delete cascade,
  event_type payment_event_type not null,
  old_status text,
  new_status text,
  provider payment_provider,
  provider_event_id text,
  idempotency_key text,
  raw_event_summary jsonb not null default '{}'::jsonb,
  actor_id uuid,
  actor_role text,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.payment_provider_events (
  id uuid primary key default gen_random_uuid(),
  provider payment_provider not null,
  provider_event_id text,
  event_type text,
  signature_verified boolean not null default false,
  processed boolean not null default false,
  processing_error text,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  payload_summary jsonb not null default '{}'::jsonb
);

create table if not exists public.receipts (
  id uuid primary key default gen_random_uuid(),
  receipt_no text unique not null default public.generate_receipt_no(),
  payment_intent_id uuid references public.payment_intents(id) on delete set null,
  context_type payment_context_type not null,
  context_id uuid,
  donor_account_id uuid references public.user_accounts(id) on delete set null,
  donor_name text,
  donor_email text,
  amount numeric(12,2),
  currency text not null default 'TRY',
  status receipt_status not null default 'pending',
  issued_at timestamptz,
  cancelled_at timestamptz,
  file_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notification_queue (
  id uuid primary key default gen_random_uuid(),
  context_type payment_context_type,
  context_id uuid,
  payment_intent_id uuid references public.payment_intents(id) on delete set null,
  donor_account_id uuid references public.user_accounts(id) on delete set null,
  recipient_email text,
  recipient_phone text,
  channel notification_channel not null,
  template_key text not null,
  status notification_queue_status not null default 'pending',
  payload jsonb not null default '{}'::jsonb,
  scheduled_at timestamptz,
  sent_at timestamptz,
  failed_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_status_logs (
  id uuid primary key default gen_random_uuid(),
  payment_intent_id uuid references public.payment_intents(id) on delete cascade,
  old_status text,
  new_status text not null,
  event_type text,
  actor_id uuid,
  actor_role text,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists payment_intents_intent_no_idx on public.payment_intents(intent_no);
create index if not exists payment_intents_context_idx on public.payment_intents(context_type, context_id);
create index if not exists payment_intents_donor_account_idx on public.payment_intents(donor_account_id);
create index if not exists payment_intents_status_idx on public.payment_intents(status);
create index if not exists payment_intents_provider_reference_idx on public.payment_intents(provider, provider_reference);
create index if not exists payment_intents_idempotency_key_idx on public.payment_intents(idempotency_key);
create index if not exists payment_intents_created_at_idx on public.payment_intents(created_at desc);
create index if not exists payment_events_intent_idx on public.payment_events(payment_intent_id, created_at desc);
create index if not exists payment_provider_events_provider_event_idx on public.payment_provider_events(provider, provider_event_id);
create index if not exists payment_provider_events_received_at_idx on public.payment_provider_events(received_at desc);
create index if not exists receipts_receipt_no_idx on public.receipts(receipt_no);
create index if not exists receipts_payment_intent_idx on public.receipts(payment_intent_id);
create index if not exists receipts_donor_account_idx on public.receipts(donor_account_id);
create index if not exists receipts_created_at_idx on public.receipts(created_at desc);
create index if not exists notification_queue_status_channel_idx on public.notification_queue(status, channel);
create index if not exists notification_queue_payment_intent_idx on public.notification_queue(payment_intent_id);
create index if not exists notification_queue_scheduled_at_idx on public.notification_queue(scheduled_at);
create index if not exists payment_status_logs_intent_idx on public.payment_status_logs(payment_intent_id, created_at desc);

alter table public.payment_intents enable row level security;
alter table public.payment_events enable row level security;
alter table public.payment_provider_events enable row level security;
alter table public.receipts enable row level security;
alter table public.notification_queue enable row level security;
alter table public.payment_status_logs enable row level security;

alter table public.payment_intents force row level security;
alter table public.payment_events force row level security;
alter table public.payment_provider_events force row level security;
alter table public.receipts force row level security;
alter table public.notification_queue force row level security;
alter table public.payment_status_logs force row level security;

revoke all on table public.payment_intents from anon;
revoke all on table public.payment_events from anon;
revoke all on table public.payment_provider_events from anon;
revoke all on table public.receipts from anon;
revoke all on table public.notification_queue from anon;
revoke all on table public.payment_status_logs from anon;

grant select on table public.payment_intents to authenticated;
grant select on table public.payment_events to authenticated;
grant select on table public.payment_provider_events to authenticated;
grant select on table public.receipts to authenticated;
grant select on table public.notification_queue to authenticated;
grant select on table public.payment_status_logs to authenticated;

do $$ begin
  create policy "admin read payment intents"
  on public.payment_intents for select to authenticated
  using (public.has_any_role(array['super_admin', 'admin']));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "donor read own payment intents"
  on public.payment_intents for select to authenticated
  using (
    exists (
      select 1
      from public.user_accounts ua
      where ua.id = payment_intents.donor_account_id
        and ua.auth_user_id = auth.uid()
        and ua.status = 'active'
    )
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "admin read payment events"
  on public.payment_events for select to authenticated
  using (public.has_any_role(array['super_admin', 'admin']));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "admin read provider payment events"
  on public.payment_provider_events for select to authenticated
  using (public.has_any_role(array['super_admin', 'admin']));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "admin read receipts"
  on public.receipts for select to authenticated
  using (public.has_any_role(array['super_admin', 'admin']));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "donor read own receipts"
  on public.receipts for select to authenticated
  using (
    exists (
      select 1
      from public.user_accounts ua
      where ua.id = receipts.donor_account_id
        and ua.auth_user_id = auth.uid()
        and ua.status = 'active'
    )
    or exists (
      select 1
      from public.payment_intents pi
      join public.user_accounts ua on ua.id = pi.donor_account_id
      where pi.id = receipts.payment_intent_id
        and ua.auth_user_id = auth.uid()
        and ua.status = 'active'
    )
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "admin read notification queue"
  on public.notification_queue for select to authenticated
  using (public.has_any_role(array['super_admin', 'admin']));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "admin read payment status logs"
  on public.payment_status_logs for select to authenticated
  using (public.has_any_role(array['super_admin', 'admin']));
exception when duplicate_object then null; end $$;

-- Public/anon insert, update, delete veya hassas tablo read yoktur.
-- Public formlar bu tablolara client-side yazamaz.
-- Yazma islemleri yalnizca server action/repository + service role uzerinden yapilmalidir.
-- Gercek provider webhook endpoint'i, PDF makbuz uretimi ve SMS/e-posta gonderimi bu asamada yoktur.
