-- 10C: Payment finalization and context state management.
-- This migration prepares idempotent, transaction-safe RPC helpers for
-- PayTR/manual payment result handling. It does not enable live payments.

do $$
begin
  if not exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and indexname = 'payment_provider_events_provider_event_unique_idx'
  ) and not exists (
    select 1
    from public.payment_provider_events
    where provider_event_id is not null
    group by provider, provider_event_id
    having count(*) > 1
  ) then
    execute 'create unique index payment_provider_events_provider_event_unique_idx on public.payment_provider_events(provider, provider_event_id) where provider_event_id is not null';
  end if;
end $$;

create or replace function public.finalize_qurban_payment(
  p_payment_intent_id uuid,
  p_context_id uuid,
  p_actor_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment public.payment_intents%rowtype;
  v_order public.qurban_orders%rowtype;
  v_already_finalized boolean := false;
begin
  select *
  into v_payment
  from public.payment_intents
  where id = p_payment_intent_id
  for update;

  if not found then
    raise exception 'payment_intent_not_found';
  end if;

  if v_payment.context_type <> 'qurban_order'::public.payment_context_type
    or v_payment.context_id is distinct from p_context_id then
    raise exception 'payment_intent_context_mismatch';
  end if;

  if v_payment.status <> 'paid'::public.payment_intent_status then
    return jsonb_build_object('processed', false, 'reason', 'payment_not_paid');
  end if;

  select *
  into v_order
  from public.qurban_orders
  where id = p_context_id
  for update;

  if not found then
    raise exception 'qurban_order_not_found';
  end if;

  v_already_finalized :=
    v_order.payment_status = 'paid'::public.qurban_payment_status
    and v_order.order_status = 'payment_confirmed'::public.qurban_order_status;

  if not v_already_finalized then
    update public.qurban_orders
    set
      payment_status = 'paid'::public.qurban_payment_status,
      order_status = 'payment_confirmed'::public.qurban_order_status,
      receipt_status = 'pending',
      updated_at = now()
    where id = p_context_id;

    update public.qurban_shares
    set
      status = 'payment_confirmed'::public.qurban_order_status,
      updated_at = now()
    where order_id = p_context_id
      and status <> 'payment_confirmed'::public.qurban_order_status;

    update public.qurban_campaigns
    set
      quota_reserved = greatest(coalesce(quota_reserved, 0) - coalesce(v_order.share_count, 0), 0),
      quota_completed = coalesce(quota_completed, 0) + coalesce(v_order.share_count, 0),
      updated_at = now()
    where id = v_order.campaign_id;

    insert into public.qurban_status_logs (
      order_id,
      old_status,
      new_status,
      actor_id,
      actor_role,
      event_type,
      note
    )
    values (
      p_context_id,
      v_order.order_status::text,
      'payment_confirmed',
      p_actor_id,
      'system',
      'payment_finalized',
      'Payment finalized through common payment infrastructure.'
    );
  end if;

  insert into public.payment_status_logs (
    payment_intent_id,
    old_status,
    new_status,
    event_type,
    actor_id,
    actor_role,
    note
  )
  select
    v_payment.id,
    'paid',
    'paid',
    'qurban_payment_finalized',
    p_actor_id,
    'system',
    case
      when v_already_finalized then 'Qurban payment finalization already applied.'
      else 'Qurban payment finalization applied.'
    end
  where not exists (
    select 1
    from public.payment_status_logs psl
    where psl.payment_intent_id = v_payment.id
      and psl.event_type = 'qurban_payment_finalized'
  );

  insert into public.receipts (
    receipt_no,
    payment_intent_id,
    context_type,
    context_id,
    donor_account_id,
    donor_name,
    donor_email,
    amount,
    currency,
    status,
    metadata
  )
  select
    public.generate_receipt_no(),
    v_payment.id,
    v_payment.context_type,
    v_payment.context_id,
    v_payment.donor_account_id,
    v_payment.donor_name,
    v_payment.donor_email,
    v_payment.amount,
    v_payment.currency,
    'pending'::public.receipt_status,
    jsonb_build_object('source', 'payment_finalization', 'template', 'qurban_payment_confirmed')
  where not exists (
    select 1
    from public.receipts r
    where r.payment_intent_id = v_payment.id
  );

  insert into public.notification_queue (
    context_type,
    context_id,
    payment_intent_id,
    donor_account_id,
    recipient_email,
    recipient_phone,
    channel,
    template_key,
    status,
    payload
  )
  select
    v_payment.context_type,
    v_payment.context_id,
    v_payment.id,
    v_payment.donor_account_id,
    v_payment.donor_email,
    v_payment.donor_phone,
    'system'::public.notification_channel,
    'qurban_payment_confirmed',
    'pending'::public.notification_queue_status,
    jsonb_build_object(
      'intent_no', v_payment.intent_no,
      'context_type', v_payment.context_type,
      'amount', v_payment.amount,
      'currency', v_payment.currency
    )
  where not exists (
    select 1
    from public.notification_queue nq
    where nq.payment_intent_id = v_payment.id
      and nq.template_key = 'qurban_payment_confirmed'
  );

  return jsonb_build_object(
    'processed', true,
    'context_type', 'qurban_order',
    'duplicate', v_already_finalized
  );
end;
$$;

create or replace function public.release_qurban_payment_reservation(
  p_payment_intent_id uuid,
  p_context_id uuid,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment public.payment_intents%rowtype;
  v_order public.qurban_orders%rowtype;
  v_already_released boolean := false;
  v_next_payment_status public.qurban_payment_status := 'failed'::public.qurban_payment_status;
  v_template_key text := 'qurban_payment_failed';
begin
  select *
  into v_payment
  from public.payment_intents
  where id = p_payment_intent_id
  for update;

  if not found then
    raise exception 'payment_intent_not_found';
  end if;

  if v_payment.context_type <> 'qurban_order'::public.payment_context_type
    or v_payment.context_id is distinct from p_context_id then
    raise exception 'payment_intent_context_mismatch';
  end if;

  if v_payment.status not in (
    'failed'::public.payment_intent_status,
    'cancelled'::public.payment_intent_status,
    'refunded'::public.payment_intent_status
  ) then
    return jsonb_build_object('processed', false, 'reason', 'payment_not_releasable');
  end if;

  select *
  into v_order
  from public.qurban_orders
  where id = p_context_id
  for update;

  if not found then
    raise exception 'qurban_order_not_found';
  end if;

  if v_order.payment_status = 'paid'::public.qurban_payment_status
    or v_order.order_status = 'payment_confirmed'::public.qurban_order_status then
    return jsonb_build_object('processed', false, 'reason', 'qurban_order_already_paid');
  end if;

  v_already_released := v_order.order_status = 'cancelled'::public.qurban_order_status;

  if v_payment.status = 'cancelled'::public.payment_intent_status then
    v_next_payment_status := 'cancelled'::public.qurban_payment_status;
    v_template_key := 'qurban_payment_cancelled';
  elsif v_payment.status = 'refunded'::public.payment_intent_status then
    v_next_payment_status := 'refunded'::public.qurban_payment_status;
    v_template_key := 'qurban_payment_refunded';
  end if;

  if not v_already_released then
    update public.qurban_orders
    set
      payment_status = v_next_payment_status,
      order_status = 'cancelled'::public.qurban_order_status,
      receipt_status = 'not_required',
      updated_at = now()
    where id = p_context_id;

    update public.qurban_shares
    set
      status = 'cancelled'::public.qurban_order_status,
      updated_at = now()
    where order_id = p_context_id
      and status <> 'cancelled'::public.qurban_order_status;

    update public.qurban_campaigns
    set
      quota_reserved = greatest(coalesce(quota_reserved, 0) - coalesce(v_order.share_count, 0), 0),
      updated_at = now()
    where id = v_order.campaign_id;

    insert into public.qurban_status_logs (
      order_id,
      old_status,
      new_status,
      actor_id,
      actor_role,
      event_type,
      note
    )
    values (
      p_context_id,
      v_order.order_status::text,
      'cancelled',
      null,
      'system',
      'payment_reservation_released',
      coalesce(nullif(p_reason, ''), 'Payment failed or was cancelled; qurban quota reservation released.')
    );
  end if;

  insert into public.payment_status_logs (
    payment_intent_id,
    old_status,
    new_status,
    event_type,
    actor_id,
    actor_role,
    note
  )
  select
    v_payment.id,
    v_payment.status::text,
    v_payment.status::text,
    'qurban_payment_reservation_released',
    null,
    'system',
    case
      when v_already_released then 'Qurban quota reservation was already released.'
      else coalesce(nullif(p_reason, ''), 'Qurban quota reservation released.')
    end
  where not exists (
    select 1
    from public.payment_status_logs psl
    where psl.payment_intent_id = v_payment.id
      and psl.event_type = 'qurban_payment_reservation_released'
  );

  insert into public.notification_queue (
    context_type,
    context_id,
    payment_intent_id,
    donor_account_id,
    recipient_email,
    recipient_phone,
    channel,
    template_key,
    status,
    payload
  )
  select
    v_payment.context_type,
    v_payment.context_id,
    v_payment.id,
    v_payment.donor_account_id,
    v_payment.donor_email,
    v_payment.donor_phone,
    'system'::public.notification_channel,
    v_template_key,
    'pending'::public.notification_queue_status,
    jsonb_build_object(
      'intent_no', v_payment.intent_no,
      'context_type', v_payment.context_type,
      'reason', p_reason
    )
  where not exists (
    select 1
    from public.notification_queue nq
    where nq.payment_intent_id = v_payment.id
      and nq.template_key = v_template_key
  );

  return jsonb_build_object(
    'processed', true,
    'context_type', 'qurban_order',
    'duplicate', v_already_released
  );
end;
$$;

create or replace function public.finalize_orphan_sponsorship_payment(
  p_payment_intent_id uuid,
  p_context_id uuid,
  p_actor_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment public.payment_intents%rowtype;
  v_sponsorship public.sponsorships%rowtype;
  v_already_finalized boolean := false;
begin
  select *
  into v_payment
  from public.payment_intents
  where id = p_payment_intent_id
  for update;

  if not found then
    raise exception 'payment_intent_not_found';
  end if;

  if v_payment.context_type <> 'orphan_sponsorship'::public.payment_context_type
    or v_payment.context_id is distinct from p_context_id then
    raise exception 'payment_intent_context_mismatch';
  end if;

  if v_payment.status <> 'paid'::public.payment_intent_status then
    return jsonb_build_object('processed', false, 'reason', 'payment_not_paid');
  end if;

  select *
  into v_sponsorship
  from public.sponsorships
  where id = p_context_id
  for update;

  if not found then
    raise exception 'sponsorship_not_found';
  end if;

  v_already_finalized :=
    v_sponsorship.payment_status = 'paid'::public.sponsorship_payment_status
    and v_sponsorship.status = 'active'::public.sponsorship_status;

  if not v_already_finalized then
    update public.sponsorships
    set
      payment_status = 'paid'::public.sponsorship_payment_status,
      status = 'active'::public.sponsorship_status,
      last_payment_date = current_date,
      next_payment_date = (current_date + interval '1 month')::date,
      updated_at = now()
    where id = p_context_id;

    insert into public.sponsorship_status_logs (
      sponsorship_id,
      old_status,
      new_status,
      event_type,
      actor_id,
      actor_role,
      note
    )
    values (
      p_context_id,
      v_sponsorship.status::text,
      'active',
      'payment_finalized',
      p_actor_id,
      'system',
      'Sponsorship activated after payment finalization.'
    );
  end if;

  insert into public.payment_status_logs (
    payment_intent_id,
    old_status,
    new_status,
    event_type,
    actor_id,
    actor_role,
    note
  )
  select
    v_payment.id,
    'paid',
    'paid',
    'orphan_sponsorship_payment_finalized',
    p_actor_id,
    'system',
    case
      when v_already_finalized then 'Sponsorship payment finalization already applied.'
      else 'Sponsorship payment finalization applied.'
    end
  where not exists (
    select 1
    from public.payment_status_logs psl
    where psl.payment_intent_id = v_payment.id
      and psl.event_type = 'orphan_sponsorship_payment_finalized'
  );

  insert into public.receipts (
    receipt_no,
    payment_intent_id,
    context_type,
    context_id,
    donor_account_id,
    donor_name,
    donor_email,
    amount,
    currency,
    status,
    metadata
  )
  select
    public.generate_receipt_no(),
    v_payment.id,
    v_payment.context_type,
    v_payment.context_id,
    v_payment.donor_account_id,
    v_payment.donor_name,
    v_payment.donor_email,
    v_payment.amount,
    v_payment.currency,
    'pending'::public.receipt_status,
    jsonb_build_object('source', 'payment_finalization', 'template', 'sponsorship_payment_confirmed')
  where not exists (
    select 1
    from public.receipts r
    where r.payment_intent_id = v_payment.id
  );

  insert into public.notification_queue (
    context_type,
    context_id,
    payment_intent_id,
    donor_account_id,
    recipient_email,
    recipient_phone,
    channel,
    template_key,
    status,
    payload
  )
  select
    v_payment.context_type,
    v_payment.context_id,
    v_payment.id,
    v_payment.donor_account_id,
    v_payment.donor_email,
    v_payment.donor_phone,
    'system'::public.notification_channel,
    'sponsorship_payment_confirmed',
    'pending'::public.notification_queue_status,
    jsonb_build_object(
      'intent_no', v_payment.intent_no,
      'context_type', v_payment.context_type,
      'amount', v_payment.amount,
      'currency', v_payment.currency
    )
  where not exists (
    select 1
    from public.notification_queue nq
    where nq.payment_intent_id = v_payment.id
      and nq.template_key = 'sponsorship_payment_confirmed'
  );

  return jsonb_build_object(
    'processed', true,
    'context_type', 'orphan_sponsorship',
    'duplicate', v_already_finalized
  );
end;
$$;

create or replace function public.handle_orphan_sponsorship_payment_failed(
  p_payment_intent_id uuid,
  p_context_id uuid,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment public.payment_intents%rowtype;
  v_sponsorship public.sponsorships%rowtype;
  v_already_handled boolean := false;
  v_next_payment_status public.sponsorship_payment_status := 'failed'::public.sponsorship_payment_status;
  v_template_key text := 'sponsorship_payment_failed';
begin
  select *
  into v_payment
  from public.payment_intents
  where id = p_payment_intent_id
  for update;

  if not found then
    raise exception 'payment_intent_not_found';
  end if;

  if v_payment.context_type <> 'orphan_sponsorship'::public.payment_context_type
    or v_payment.context_id is distinct from p_context_id then
    raise exception 'payment_intent_context_mismatch';
  end if;

  if v_payment.status not in (
    'failed'::public.payment_intent_status,
    'cancelled'::public.payment_intent_status,
    'refunded'::public.payment_intent_status
  ) then
    return jsonb_build_object('processed', false, 'reason', 'payment_not_failed_or_cancelled');
  end if;

  select *
  into v_sponsorship
  from public.sponsorships
  where id = p_context_id
  for update;

  if not found then
    raise exception 'sponsorship_not_found';
  end if;

  if v_sponsorship.payment_status = 'paid'::public.sponsorship_payment_status
    and v_sponsorship.status = 'active'::public.sponsorship_status then
    return jsonb_build_object('processed', false, 'reason', 'sponsorship_already_active');
  end if;

  if v_payment.status = 'cancelled'::public.payment_intent_status then
    v_next_payment_status := 'cancelled'::public.sponsorship_payment_status;
    v_template_key := 'sponsorship_payment_cancelled';
  elsif v_payment.status = 'refunded'::public.payment_intent_status then
    v_next_payment_status := 'refunded'::public.sponsorship_payment_status;
    v_template_key := 'sponsorship_payment_refunded';
  end if;

  v_already_handled :=
    v_sponsorship.payment_status = v_next_payment_status
    and v_sponsorship.status = 'payment_pending'::public.sponsorship_status;

  if not v_already_handled then
    update public.sponsorships
    set
      payment_status = v_next_payment_status,
      status = 'payment_pending'::public.sponsorship_status,
      updated_at = now()
    where id = p_context_id;

    insert into public.sponsorship_status_logs (
      sponsorship_id,
      old_status,
      new_status,
      event_type,
      actor_id,
      actor_role,
      note
    )
    values (
      p_context_id,
      v_sponsorship.status::text,
      'payment_pending',
      'payment_failed',
      null,
      'system',
      coalesce(nullif(p_reason, ''), 'Sponsorship payment failed or was cancelled.')
    );
  end if;

  insert into public.notification_queue (
    context_type,
    context_id,
    payment_intent_id,
    donor_account_id,
    recipient_email,
    recipient_phone,
    channel,
    template_key,
    status,
    payload
  )
  select
    v_payment.context_type,
    v_payment.context_id,
    v_payment.id,
    v_payment.donor_account_id,
    v_payment.donor_email,
    v_payment.donor_phone,
    'system'::public.notification_channel,
    v_template_key,
    'pending'::public.notification_queue_status,
    jsonb_build_object(
      'intent_no', v_payment.intent_no,
      'context_type', v_payment.context_type,
      'reason', p_reason
    )
  where not exists (
    select 1
    from public.notification_queue nq
    where nq.payment_intent_id = v_payment.id
      and nq.template_key = v_template_key
  );

  return jsonb_build_object(
    'processed', true,
    'context_type', 'orphan_sponsorship',
    'duplicate', v_already_handled
  );
end;
$$;

create or replace function public.finalize_general_donation_payment(
  p_payment_intent_id uuid,
  p_actor_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment public.payment_intents%rowtype;
begin
  select *
  into v_payment
  from public.payment_intents
  where id = p_payment_intent_id
  for update;

  if not found then
    raise exception 'payment_intent_not_found';
  end if;

  if v_payment.status <> 'paid'::public.payment_intent_status then
    return jsonb_build_object('processed', false, 'reason', 'payment_not_paid');
  end if;

  insert into public.payment_status_logs (
    payment_intent_id,
    old_status,
    new_status,
    event_type,
    actor_id,
    actor_role,
    note
  )
  select
    v_payment.id,
    'paid',
    'paid',
    'general_donation_payment_finalized',
    p_actor_id,
    'system',
    'General donation payment finalized at common payment layer.'
  where not exists (
    select 1
    from public.payment_status_logs psl
    where psl.payment_intent_id = v_payment.id
      and psl.event_type = 'general_donation_payment_finalized'
  );

  insert into public.receipts (
    receipt_no,
    payment_intent_id,
    context_type,
    context_id,
    donor_account_id,
    donor_name,
    donor_email,
    amount,
    currency,
    status,
    metadata
  )
  select
    public.generate_receipt_no(),
    v_payment.id,
    v_payment.context_type,
    v_payment.context_id,
    v_payment.donor_account_id,
    v_payment.donor_name,
    v_payment.donor_email,
    v_payment.amount,
    v_payment.currency,
    'pending'::public.receipt_status,
    jsonb_build_object('source', 'payment_finalization', 'template', 'general_donation_payment_confirmed')
  where not exists (
    select 1
    from public.receipts r
    where r.payment_intent_id = v_payment.id
  );

  insert into public.notification_queue (
    context_type,
    context_id,
    payment_intent_id,
    donor_account_id,
    recipient_email,
    recipient_phone,
    channel,
    template_key,
    status,
    payload
  )
  select
    v_payment.context_type,
    v_payment.context_id,
    v_payment.id,
    v_payment.donor_account_id,
    v_payment.donor_email,
    v_payment.donor_phone,
    'system'::public.notification_channel,
    'general_donation_payment_confirmed',
    'pending'::public.notification_queue_status,
    jsonb_build_object(
      'intent_no', v_payment.intent_no,
      'context_type', v_payment.context_type,
      'amount', v_payment.amount,
      'currency', v_payment.currency
    )
  where not exists (
    select 1
    from public.notification_queue nq
    where nq.payment_intent_id = v_payment.id
      and nq.template_key = 'general_donation_payment_confirmed'
  );

  return jsonb_build_object(
    'processed', true,
    'context_type', v_payment.context_type,
    'duplicate', false
  );
end;
$$;

revoke execute on function public.finalize_qurban_payment(uuid, uuid, uuid) from public;
revoke execute on function public.finalize_qurban_payment(uuid, uuid, uuid) from anon;
revoke execute on function public.finalize_qurban_payment(uuid, uuid, uuid) from authenticated;
grant execute on function public.finalize_qurban_payment(uuid, uuid, uuid) to service_role;

revoke execute on function public.release_qurban_payment_reservation(uuid, uuid, text) from public;
revoke execute on function public.release_qurban_payment_reservation(uuid, uuid, text) from anon;
revoke execute on function public.release_qurban_payment_reservation(uuid, uuid, text) from authenticated;
grant execute on function public.release_qurban_payment_reservation(uuid, uuid, text) to service_role;

revoke execute on function public.finalize_orphan_sponsorship_payment(uuid, uuid, uuid) from public;
revoke execute on function public.finalize_orphan_sponsorship_payment(uuid, uuid, uuid) from anon;
revoke execute on function public.finalize_orphan_sponsorship_payment(uuid, uuid, uuid) from authenticated;
grant execute on function public.finalize_orphan_sponsorship_payment(uuid, uuid, uuid) to service_role;

revoke execute on function public.handle_orphan_sponsorship_payment_failed(uuid, uuid, text) from public;
revoke execute on function public.handle_orphan_sponsorship_payment_failed(uuid, uuid, text) from anon;
revoke execute on function public.handle_orphan_sponsorship_payment_failed(uuid, uuid, text) from authenticated;
grant execute on function public.handle_orphan_sponsorship_payment_failed(uuid, uuid, text) to service_role;

revoke execute on function public.finalize_general_donation_payment(uuid, uuid) from public;
revoke execute on function public.finalize_general_donation_payment(uuid, uuid) from anon;
revoke execute on function public.finalize_general_donation_payment(uuid, uuid) from authenticated;
grant execute on function public.finalize_general_donation_payment(uuid, uuid) to service_role;
