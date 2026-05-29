-- Okyanus Insani Yardim Dernegi
-- 019 Digital receipt cancellation status fix
-- Amac: Eski ortamlarda 001_core_schema.sql ile olusan receipt_status enum'u
-- 014 migration'da duplicate_object nedeniyle genisletilemediyse dijital makbuz
-- iptal workflow'u icin gerekli status/metadata alanlarini guvenli eklemek.
-- Bu migration RLS policy, public/anon erisim veya storage yetkilerini degistirmez.

do $$
declare
  v_type_schema text;
  v_type_name text;
begin
  select tn.nspname, t.typname
    into v_type_schema, v_type_name
  from pg_attribute a
  join pg_class c on c.oid = a.attrelid
  join pg_namespace cn on cn.oid = c.relnamespace
  join pg_type t on t.oid = a.atttypid
  join pg_namespace tn on tn.oid = t.typnamespace
  where cn.nspname = 'public'
    and c.relname = 'receipts'
    and a.attname = 'status'
    and not a.attisdropped;

  if v_type_name is not null and exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = v_type_schema
      and t.typname = v_type_name
      and t.typtype = 'e'
  ) then
    execute format('alter type %I.%I add value if not exists %L', v_type_schema, v_type_name, 'prepared');
    execute format('alter type %I.%I add value if not exists %L', v_type_schema, v_type_name, 'cancelled');
  end if;
end $$;

alter table if exists public.receipts
  add column if not exists cancelled_at timestamptz,
  add column if not exists cancelled_reason text,
  add column if not exists cancelled_by uuid;

do $$
declare
  v_constraint record;
  v_receipts_regclass regclass;
begin
  v_receipts_regclass := to_regclass('public.receipts');
  if v_receipts_regclass is null then
    return;
  end if;

  for v_constraint in
    select conname, pg_get_constraintdef(oid) as constraint_def
    from pg_constraint
    where conrelid = v_receipts_regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%status%'
      and pg_get_constraintdef(oid) ilike '%pending%'
      and (
        pg_get_constraintdef(oid) ilike '%ANY%'
        or pg_get_constraintdef(oid) ilike '% IN %'
        or pg_get_constraintdef(oid) ilike '%= ANY%'
      )
  loop
    execute format('alter table public.receipts drop constraint if exists %I', v_constraint.conname);
    execute format(
      'alter table public.receipts add constraint %I check (status::text in (%L, %L, %L, %L, %L, %L)) not valid',
      v_constraint.conname,
      'not_required',
      'pending',
      'prepared',
      'issued',
      'cancelled',
      'failed'
    );
    execute format('alter table public.receipts validate constraint %I', v_constraint.conname);
  end loop;
end $$;

comment on column public.receipts.cancelled_by is
  'Admin/super_admin user id that cancelled the digital receipt, when the cancellation workflow is used.';

comment on column public.receipts.cancelled_reason is
  'Required business reason when a digital receipt is cancelled.';
