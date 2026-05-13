-- Okyanus İnsani Yardım Derneği
-- 008 Admin profile/account access fix
-- Amaç: Admin login sonrası authenticated kullanıcının kendi profiles ve user_accounts kaydını read-only okuyabilmesini netleştirmek.
-- Hassas tablolar anon/public erişime açılmaz.

alter type app_role add value if not exists 'admin' after 'super_admin';

alter table if exists public.profiles enable row level security;
alter table if exists public.profiles force row level security;
alter table if exists public.user_accounts enable row level security;
alter table if exists public.user_accounts force row level security;

revoke all on table public.profiles from anon;
revoke all on table public.user_accounts from anon;

grant select on table public.profiles to authenticated;
grant select on table public.user_accounts to authenticated;

do $$ begin
  create policy "authenticated read self profile by auth uid"
  on public.profiles for select to authenticated
  using (
    id = auth.uid()
    and status = 'active'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "authenticated read self user account by auth uid"
  on public.user_accounts for select to authenticated
  using (
    auth_user_id = auth.uid()
    and status = 'active'
  );
exception when duplicate_object then null; end $$;

-- Notlar:
-- 1. admin_roles kullanıcı-rol bağlantısı değildir; yalnızca rol tanım tablosu olarak kalır.
-- 2. Admin erişimi uygulama tarafında profiles.id = auth.uid() ve role in ('super_admin', 'admin') ile doğrulanır.
-- 3. Destekleyici kaynak olarak user_accounts.auth_user_id = auth.uid() ve account_type = 'admin' kabul edilir.
-- 4. Bu migration public/anon kullanıcıya profiles veya user_accounts erişimi vermez.
