-- Okyanus Insani Yardim Dernegi
-- 015 sponsored_orphans_safe_view security_invoker fix
-- Amac: Supabase Security Advisor'da security definer view uyarisi olusmamasi icin
-- sponsor paneli safe view'unu security_invoker olarak yeniden tanimlamak.
-- Public/anon grant yoktur; authenticated select RLS mantigi ile sinirli kalir.

create or replace view public.sponsored_orphans_safe_view
with (security_invoker = true)
as
select
  op.id as orphan_id,
  op.code,
  coalesce(nullif(op.safe_name, ''), op.display_name) as safe_name,
  op.age_group,
  op.country,
  op.city_or_region,
  op.education_status,
  op.general_health_note,
  s.status as sponsorship_status,
  s.sponsor_account_id,
  s.id as sponsorship_id
from public.orphan_profiles op
join public.sponsorships s on s.orphan_id = op.id
where
  exists (
    select 1
    from public.user_accounts ua
    where ua.id = s.sponsor_account_id
      and ua.auth_user_id = auth.uid()
      and ua.status = 'active'
  )
  or public.has_any_role(array['super_admin', 'admin']);

revoke all on table public.sponsored_orphans_safe_view from anon;
grant select on table public.sponsored_orphans_safe_view to authenticated;
