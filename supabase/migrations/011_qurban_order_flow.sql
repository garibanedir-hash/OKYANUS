-- Okyanus Insani Yardim Dernegi
-- 011 Qurban order, delegation and share reservation flow
-- Amac: Kurban basvuru/vekalet/hisse rezervasyon akisini staging'de guvenli
-- server-side write ile baslatmak. Gercek odeme, makbuz, SMS/e-posta ve dosya upload yoktur.
-- Bu migration staging ortaminda test edilmeden production'da calistirilmamalidir.

alter table if exists public.qurban_orders
  add column if not exists kvkk_accepted boolean not null default false,
  add column if not exists contact_permission boolean not null default false,
  add column if not exists source text not null default 'web',
  add column if not exists created_by uuid,
  add column if not exists updated_by uuid;

alter table if exists public.qurban_delegations
  add column if not exists kvkk_accepted boolean not null default false,
  add column if not exists source text not null default 'web';

alter table if exists public.qurban_shares
  add column if not exists share_index integer,
  add column if not exists reserved_at timestamptz;

alter table if exists public.qurban_status_logs
  add column if not exists event_type text;

create unique index if not exists qurban_shares_share_no_unique_idx
  on public.qurban_shares(share_no)
  where share_no is not null;

create unique index if not exists qurban_shares_order_share_index_unique_idx
  on public.qurban_shares(order_id, share_index)
  where share_index is not null;

create index if not exists qurban_orders_created_by_idx on public.qurban_orders(created_by);
create index if not exists qurban_orders_created_at_idx on public.qurban_orders(created_at desc);
create index if not exists qurban_orders_source_idx on public.qurban_orders(source);
create index if not exists qurban_shares_campaign_status_idx on public.qurban_shares(campaign_id, status);
create index if not exists qurban_shares_reserved_at_idx on public.qurban_shares(reserved_at desc);
create index if not exists qurban_status_logs_order_event_idx on public.qurban_status_logs(order_id, event_type, created_at desc);
create index if not exists qurban_status_logs_operation_event_idx on public.qurban_status_logs(operation_id, event_type, created_at desc);

do $$ begin
  alter table public.qurban_orders
    add constraint qurban_orders_created_by_fkey
    foreign key (created_by) references public.profiles(id) on delete set null;
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.qurban_orders
    add constraint qurban_orders_updated_by_fkey
    foreign key (updated_by) references public.profiles(id) on delete set null;
exception when duplicate_object then null; end $$;

create or replace function public.generate_qurban_order_no()
returns text
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  return 'QUR-' || to_char(now(), 'YYYY') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
end;
$$;

create or replace function public.generate_qurban_share_no(order_no text, share_index integer)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select order_no || '-' || lpad(greatest(share_index, 1)::text, 2, '0');
$$;

create or replace function public.create_qurban_order(
  p_campaign_id uuid,
  p_qurban_type qurban_type,
  p_share_count integer,
  p_donor_account_id uuid,
  p_donor_name text,
  p_donor_email text,
  p_donor_phone text,
  p_donor_city text,
  p_note text,
  p_kvkk_accepted boolean,
  p_contact_permission boolean,
  p_source text,
  p_created_by uuid
)
returns table (
  order_id uuid,
  order_no text,
  total_amount numeric,
  share_count integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  campaign_record record;
  generated_order_no text;
  created_order_id uuid;
  calculated_total numeric(12,2);
  retry_count integer := 0;
  share_idx integer;
begin
  if p_campaign_id is null then
    raise exception 'Kurban kampanyasi zorunludur.' using errcode = '22023';
  end if;

  if p_share_count is null or p_share_count < 1 or p_share_count > 20 then
    raise exception 'Hisse/adet sayisi 1 ile 20 arasinda olmalidir.' using errcode = '22023';
  end if;

  if coalesce(trim(p_donor_name), '') = '' then
    raise exception 'Bagisci adi zorunludur.' using errcode = '22023';
  end if;

  if coalesce(trim(p_donor_email), '') = '' then
    raise exception 'Bagisci e-postasi zorunludur.' using errcode = '22023';
  end if;

  if coalesce(trim(p_donor_phone), '') = '' then
    raise exception 'Bagisci telefonu zorunludur.' using errcode = '22023';
  end if;

  if p_kvkk_accepted is not true then
    raise exception 'KVKK onayi zorunludur.' using errcode = '22023';
  end if;

  if p_created_by is null and p_donor_account_id is not null then
    raise exception 'Donor hesabi oturumla dogrulanmalidir.' using errcode = '42501';
  end if;

  if p_donor_account_id is not null and not exists (
    select 1
    from public.user_accounts ua
    where ua.id = p_donor_account_id
      and ua.auth_user_id = p_created_by
      and ua.status = 'active'
  ) then
    raise exception 'Donor hesabi dogrulanamadi.' using errcode = '42501';
  end if;

  select *
  into campaign_record
  from public.qurban_campaigns
  where id = p_campaign_id
  for update;

  if not found then
    raise exception 'Kurban kampanyasi bulunamadi.' using errcode = 'P0002';
  end if;

  if campaign_record.status <> 'active' then
    raise exception 'Bu kurban kampanyasi aktif degil.' using errcode = '22023';
  end if;

  if campaign_record.unit_price is null or campaign_record.unit_price <= 0 then
    raise exception 'Kurban birim bedeli hazir degil.' using errcode = '22023';
  end if;

  if campaign_record.quota_total is not null
    and campaign_record.quota_reserved + p_share_count > campaign_record.quota_total then
    raise exception 'Kampanya kontenjani yeterli degil.' using errcode = '22023';
  end if;

  calculated_total := campaign_record.unit_price * p_share_count;

  loop
    retry_count := retry_count + 1;
    generated_order_no := public.generate_qurban_order_no();

    begin
      insert into public.qurban_orders (
        order_no,
        campaign_id,
        donor_account_id,
        donor_name,
        donor_email,
        donor_phone,
        donor_city,
        qurban_type,
        share_count,
        total_amount,
        currency,
        payment_status,
        order_status,
        delegation_status,
        delegation_accepted_at,
        note,
        receipt_status,
        kvkk_accepted,
        contact_permission,
        source,
        created_by,
        updated_by
      ) values (
        generated_order_no,
        campaign_record.id,
        p_donor_account_id,
        trim(p_donor_name),
        lower(trim(p_donor_email)),
        trim(p_donor_phone),
        nullif(trim(coalesce(p_donor_city, '')), ''),
        p_qurban_type,
        p_share_count,
        calculated_total,
        campaign_record.currency,
        'pending',
        'payment_pending',
        'accepted',
        now(),
        nullif(trim(coalesce(p_note, '')), ''),
        'payment_pending',
        true,
        coalesce(p_contact_permission, false),
        coalesce(nullif(trim(p_source), ''), 'web'),
        p_created_by,
        p_created_by
      )
      returning id into created_order_id;

      exit;
    exception when unique_violation then
      if retry_count >= 5 then
        raise exception 'Siparis numarasi uretilemedi. Lutfen tekrar deneyin.' using errcode = '23505';
      end if;
    end;
  end loop;

  insert into public.qurban_delegations (
    order_id,
    donor_account_id,
    donor_name,
    donor_email,
    delegation_text,
    accepted,
    accepted_at,
    status,
    kvkk_accepted,
    source
  ) values (
    created_order_id,
    p_donor_account_id,
    trim(p_donor_name),
    lower(trim(p_donor_email)),
    campaign_record.delegation_text,
    true,
    now(),
    'accepted',
    true,
    coalesce(nullif(trim(p_source), ''), 'web')
  );

  for share_idx in 1..p_share_count loop
    insert into public.qurban_shares (
      order_id,
      campaign_id,
      share_no,
      share_index,
      donor_display_name,
      status,
      reserved_at
    ) values (
      created_order_id,
      campaign_record.id,
      public.generate_qurban_share_no(generated_order_no, share_idx),
      share_idx,
      left(trim(p_donor_name), 1) || '***',
      'payment_pending',
      now()
    );
  end loop;

  update public.qurban_campaigns
  set quota_reserved = quota_reserved + p_share_count,
      updated_at = now()
  where id = campaign_record.id;

  insert into public.qurban_status_logs (
    order_id,
    old_status,
    new_status,
    actor_id,
    actor_role,
    event_type,
    note
  ) values
    (created_order_id, null, 'payment_pending', p_created_by, case when p_created_by is null then 'guest' else 'donor' end, 'qurban.order.create', 'Kurban basvurusu ve odeme bekliyor kaydi olusturuldu.'),
    (created_order_id, null, 'accepted', p_created_by, case when p_created_by is null then 'guest' else 'donor' end, 'qurban.delegation.accept', 'Vekalet kabul edildi.'),
    (created_order_id, null, 'reserved', p_created_by, case when p_created_by is null then 'guest' else 'donor' end, 'qurban.share.reserve', p_share_count::text || ' hisse/adet rezerve edildi.'),
    (created_order_id, null, 'quota_reserved', p_created_by, case when p_created_by is null then 'guest' else 'donor' end, 'qurban.quota.reserve', 'Kampanya kontenjani guncellendi.');

  return query select created_order_id, generated_order_no, calculated_total, p_share_count;
end;
$$;

revoke execute on function public.generate_qurban_order_no() from public, anon, authenticated;
revoke execute on function public.generate_qurban_share_no(text, integer) from public, anon, authenticated;
revoke execute on function public.create_qurban_order(
  uuid,
  qurban_type,
  integer,
  uuid,
  text,
  text,
  text,
  text,
  text,
  boolean,
  boolean,
  text,
  uuid
) from public, anon, authenticated;

grant execute on function public.generate_qurban_order_no() to service_role;
grant execute on function public.generate_qurban_share_no(text, integer) to service_role;
grant execute on function public.create_qurban_order(
  uuid,
  qurban_type,
  integer,
  uuid,
  text,
  text,
  text,
  text,
  text,
  boolean,
  boolean,
  text,
  uuid
) to service_role;

-- Public/anon read veya insert acilmaz.
-- Kurban basvuru yazimi server action tarafindan service role ile bu RPC uzerinden yapilir.
-- Client component icine service role key tasinmaz.
