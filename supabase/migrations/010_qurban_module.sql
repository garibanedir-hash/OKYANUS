-- Okyanus Insani Yardim Dernegi
-- 010 Qurban module schema and read policy preparation
-- Amac: Kurban kampanyalari, vekalet, hisse/adet, kesim, dagitim,
-- bilgilendirme ve export hazirligi icin genisletilebilir veri modelini kurmak.
-- Bu migration staging ortaminda test edilmeden production'da calistirilmamalidir.
-- Bu asamada public veya authenticated write policy acilmaz.

do $$ begin
  create type qurban_type as enum ('vacip', 'adak', 'akika', 'sukur', 'nafile', 'genel');
exception when duplicate_object then null; end $$;

do $$ begin
  create type qurban_region_type as enum ('yurt_ici', 'yurt_disi');
exception when duplicate_object then null; end $$;

do $$ begin
  create type qurban_campaign_status as enum ('draft', 'active', 'paused', 'completed', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type qurban_order_status as enum (
    'draft',
    'delegation_pending',
    'payment_pending',
    'payment_confirmed',
    'scheduled',
    'slaughtered',
    'distributed',
    'completed',
    'cancelled'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type qurban_delegation_status as enum ('pending', 'accepted', 'revoked', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type qurban_operation_status as enum (
    'planning',
    'assigned',
    'in_progress',
    'slaughter_completed',
    'distribution_completed',
    'reported',
    'closed'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type qurban_payment_status as enum ('pending', 'paid', 'failed', 'refunded', 'cancelled');
exception when duplicate_object then null; end $$;

create table if not exists public.qurban_campaigns (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  type qurban_type not null,
  region_type qurban_region_type not null,
  country text,
  city_or_region text,
  unit_price numeric(12,2),
  currency text not null default 'TRY',
  quota_total integer,
  quota_reserved integer not null default 0,
  quota_completed integer not null default 0,
  start_date date,
  end_date date,
  status qurban_campaign_status not null default 'draft',
  short_description text,
  description text,
  delegation_text text,
  transparency_note text,
  cover_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.qurban_orders (
  id uuid primary key default gen_random_uuid(),
  order_no text unique,
  campaign_id uuid references public.qurban_campaigns(id) on delete set null,
  donor_account_id uuid references public.user_accounts(id) on delete set null,
  donor_name text,
  donor_email text,
  donor_phone text,
  donor_city text,
  qurban_type qurban_type,
  share_count integer not null default 1,
  total_amount numeric(12,2),
  currency text not null default 'TRY',
  payment_status qurban_payment_status not null default 'pending',
  order_status qurban_order_status not null default 'delegation_pending',
  delegation_status qurban_delegation_status not null default 'pending',
  delegation_accepted_at timestamptz,
  note text,
  receipt_status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.qurban_delegations (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.qurban_orders(id) on delete cascade,
  donor_account_id uuid references public.user_accounts(id) on delete set null,
  donor_name text,
  donor_email text,
  delegation_text text,
  accepted boolean not null default false,
  accepted_at timestamptz,
  ip_hash text,
  user_agent text,
  status qurban_delegation_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.qurban_shares (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.qurban_orders(id) on delete cascade,
  campaign_id uuid references public.qurban_campaigns(id) on delete set null,
  share_no text,
  donor_display_name text,
  status qurban_order_status not null default 'payment_pending',
  assigned_operation_id uuid,
  slaughtered_at timestamptz,
  distributed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.qurban_operations (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.qurban_campaigns(id) on delete set null,
  operation_no text unique,
  country text,
  city_or_region text,
  slaughter_location text,
  distribution_area text,
  planned_slaughter_date date,
  actual_slaughter_date date,
  responsible_coordinator_id uuid references public.user_accounts(id) on delete set null,
  responsible_staff_id uuid references public.user_accounts(id) on delete set null,
  status qurban_operation_status not null default 'planning',
  total_shares integer not null default 0,
  completed_shares integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$ begin
  alter table public.qurban_shares
    add constraint qurban_shares_assigned_operation_id_fkey
    foreign key (assigned_operation_id) references public.qurban_operations(id) on delete set null;
exception when duplicate_object then null; end $$;

create table if not exists public.qurban_distribution_logs (
  id uuid primary key default gen_random_uuid(),
  operation_id uuid references public.qurban_operations(id) on delete set null,
  campaign_id uuid references public.qurban_campaigns(id) on delete set null,
  distribution_date date,
  location text,
  beneficiary_group text,
  package_count integer,
  family_count integer,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.qurban_status_logs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.qurban_orders(id) on delete cascade,
  share_id uuid references public.qurban_shares(id) on delete set null,
  operation_id uuid references public.qurban_operations(id) on delete set null,
  old_status text,
  new_status text,
  actor_id uuid,
  actor_role text,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.qurban_notifications (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.qurban_orders(id) on delete cascade,
  donor_email text,
  donor_phone text,
  channel text,
  template_key text,
  status text not null default 'pending',
  sent_at timestamptz,
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.qurban_exports (
  id uuid primary key default gen_random_uuid(),
  export_type text,
  requested_by uuid,
  filter_summary jsonb,
  masked boolean not null default true,
  status text not null default 'prepared',
  created_at timestamptz not null default now()
);

create index if not exists qurban_campaigns_status_idx on public.qurban_campaigns(status);
create index if not exists qurban_campaigns_slug_idx on public.qurban_campaigns(slug);
create index if not exists qurban_orders_campaign_id_idx on public.qurban_orders(campaign_id);
create index if not exists qurban_orders_donor_account_id_idx on public.qurban_orders(donor_account_id);
create index if not exists qurban_orders_status_idx on public.qurban_orders(order_status, payment_status, delegation_status);
create index if not exists qurban_delegations_order_id_idx on public.qurban_delegations(order_id);
create index if not exists qurban_delegations_donor_account_id_idx on public.qurban_delegations(donor_account_id);
create index if not exists qurban_shares_order_id_idx on public.qurban_shares(order_id);
create index if not exists qurban_shares_operation_id_idx on public.qurban_shares(assigned_operation_id);
create index if not exists qurban_operations_campaign_id_idx on public.qurban_operations(campaign_id);
create index if not exists qurban_operations_responsible_idx on public.qurban_operations(responsible_coordinator_id, responsible_staff_id);
create index if not exists qurban_distribution_logs_operation_id_idx on public.qurban_distribution_logs(operation_id);
create index if not exists qurban_status_logs_order_id_idx on public.qurban_status_logs(order_id);
create index if not exists qurban_notifications_order_id_idx on public.qurban_notifications(order_id);

alter table public.qurban_campaigns enable row level security;
alter table public.qurban_orders enable row level security;
alter table public.qurban_delegations enable row level security;
alter table public.qurban_shares enable row level security;
alter table public.qurban_operations enable row level security;
alter table public.qurban_distribution_logs enable row level security;
alter table public.qurban_status_logs enable row level security;
alter table public.qurban_notifications enable row level security;
alter table public.qurban_exports enable row level security;

alter table public.qurban_orders force row level security;
alter table public.qurban_delegations force row level security;
alter table public.qurban_shares force row level security;
alter table public.qurban_operations force row level security;
alter table public.qurban_distribution_logs force row level security;
alter table public.qurban_status_logs force row level security;
alter table public.qurban_notifications force row level security;
alter table public.qurban_exports force row level security;

grant select on table public.qurban_campaigns to anon, authenticated;

revoke all on table public.qurban_orders from anon;
revoke all on table public.qurban_delegations from anon;
revoke all on table public.qurban_shares from anon;
revoke all on table public.qurban_operations from anon;
revoke all on table public.qurban_distribution_logs from anon;
revoke all on table public.qurban_status_logs from anon;
revoke all on table public.qurban_notifications from anon;
revoke all on table public.qurban_exports from anon;

grant select on table public.qurban_orders to authenticated;
grant select on table public.qurban_delegations to authenticated;
grant select on table public.qurban_shares to authenticated;
grant select on table public.qurban_operations to authenticated;
grant select on table public.qurban_distribution_logs to authenticated;
grant select on table public.qurban_status_logs to authenticated;
grant select on table public.qurban_notifications to authenticated;
grant select on table public.qurban_exports to authenticated;

do $$ begin
  create policy "public read active qurban campaigns"
  on public.qurban_campaigns for select to anon, authenticated
  using (status = 'active');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "admin read all qurban campaigns"
  on public.qurban_campaigns for select to authenticated
  using (public.has_any_role(array['super_admin', 'admin']));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "donor read own qurban orders"
  on public.qurban_orders for select to authenticated
  using (
    exists (
      select 1
      from public.user_accounts ua
      where ua.id = qurban_orders.donor_account_id
        and ua.auth_user_id = auth.uid()
        and ua.status = 'active'
    )
    or public.has_any_role(array['super_admin', 'admin'])
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "donor read own qurban delegations"
  on public.qurban_delegations for select to authenticated
  using (
    exists (
      select 1
      from public.user_accounts ua
      where ua.id = qurban_delegations.donor_account_id
        and ua.auth_user_id = auth.uid()
        and ua.status = 'active'
    )
    or exists (
      select 1
      from public.qurban_orders qo
      join public.user_accounts ua on ua.id = qo.donor_account_id
      where qo.id = qurban_delegations.order_id
        and ua.auth_user_id = auth.uid()
        and ua.status = 'active'
    )
    or public.has_any_role(array['super_admin', 'admin'])
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "donor read own qurban shares"
  on public.qurban_shares for select to authenticated
  using (
    exists (
      select 1
      from public.qurban_orders qo
      join public.user_accounts ua on ua.id = qo.donor_account_id
      where qo.id = qurban_shares.order_id
        and ua.auth_user_id = auth.uid()
        and ua.status = 'active'
    )
    or public.has_any_role(array['super_admin', 'admin'])
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "coordinator staff read assigned qurban operations"
  on public.qurban_operations for select to authenticated
  using (
    exists (
      select 1
      from public.user_accounts ua
      where ua.id in (qurban_operations.responsible_coordinator_id, qurban_operations.responsible_staff_id)
        and ua.auth_user_id = auth.uid()
        and ua.status = 'active'
    )
    or public.has_any_role(array['super_admin', 'admin'])
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "assigned users read qurban distribution logs"
  on public.qurban_distribution_logs for select to authenticated
  using (
    exists (
      select 1
      from public.qurban_operations qo
      join public.user_accounts ua
        on ua.id in (qo.responsible_coordinator_id, qo.responsible_staff_id)
      where qo.id = qurban_distribution_logs.operation_id
        and ua.auth_user_id = auth.uid()
        and ua.status = 'active'
    )
    or public.has_any_role(array['super_admin', 'admin'])
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "permitted users read qurban status logs"
  on public.qurban_status_logs for select to authenticated
  using (
    exists (
      select 1
      from public.qurban_orders qo
      join public.user_accounts ua on ua.id = qo.donor_account_id
      where qo.id = qurban_status_logs.order_id
        and ua.auth_user_id = auth.uid()
        and ua.status = 'active'
    )
    or exists (
      select 1
      from public.qurban_operations qo
      join public.user_accounts ua
        on ua.id in (qo.responsible_coordinator_id, qo.responsible_staff_id)
      where qo.id = qurban_status_logs.operation_id
        and ua.auth_user_id = auth.uid()
        and ua.status = 'active'
    )
    or public.has_any_role(array['super_admin', 'admin'])
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "donor read own qurban notifications"
  on public.qurban_notifications for select to authenticated
  using (
    exists (
      select 1
      from public.qurban_orders qo
      join public.user_accounts ua on ua.id = qo.donor_account_id
      where qo.id = qurban_notifications.order_id
        and ua.auth_user_id = auth.uid()
        and ua.status = 'active'
    )
    or public.has_any_role(array['super_admin', 'admin'])
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "admin read qurban exports"
  on public.qurban_exports for select to authenticated
  using (public.has_any_role(array['super_admin', 'admin']));
exception when duplicate_object then null; end $$;

-- Public/anon insert, update ve delete yoktur.
-- Authenticated write policy bu asamada yoktur; gercek odeme, vekalet, makbuz,
-- dosya yukleme ve operasyon update akislari sonraki asamada ayrica ele alinacaktir.
