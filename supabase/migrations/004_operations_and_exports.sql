-- Okyanus İnsani Yardım Derneği
-- 004 Operations and exports draft
-- Bu dosya migration-ready taslak olarak hazırlanmıştır; staging ortamında test edilmeden production'da çalıştırılmamalıdır.

create table if not exists internal_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  assigned_by uuid references profiles(id) on delete set null,
  assigned_to uuid references profiles(id) on delete set null,
  priority text not null default 'medium',
  status text not null default 'new',
  related_entity_type text not null default 'general',
  related_entity_id uuid,
  due_date timestamptz,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references internal_tasks(id) on delete cascade,
  author_id uuid references profiles(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists internal_conversations (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  conversation_type text not null default 'staff_message',
  related_task_id uuid references internal_tasks(id) on delete set null,
  related_entity_type text,
  related_entity_id uuid,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists internal_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references internal_conversations(id) on delete cascade,
  sender_id uuid references profiles(id) on delete set null,
  body text not null,
  related_task_id uuid references internal_tasks(id) on delete set null,
  related_entity_type text,
  related_entity_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists message_read_receipts (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references internal_messages(id) on delete cascade,
  reader_id uuid references profiles(id) on delete cascade,
  read_at timestamptz not null default now(),
  unique (message_id, reader_id)
);

create table if not exists export_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id) on delete set null,
  export_type text not null,
  entity_type text not null,
  filters jsonb not null default '{}'::jsonb,
  masked boolean not null default true,
  file_format text not null,
  row_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_internal_tasks_assigned_to on internal_tasks(assigned_to);
create index if not exists idx_internal_tasks_status on internal_tasks(status);
create index if not exists idx_internal_tasks_related on internal_tasks(related_entity_type, related_entity_id);
create index if not exists idx_internal_messages_conversation on internal_messages(conversation_id);
create index if not exists idx_export_logs_actor_created on export_logs(actor_id, created_at desc);
