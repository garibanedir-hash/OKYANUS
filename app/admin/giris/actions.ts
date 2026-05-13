"use server";

import { redirect } from "next/navigation";
import { adminHomePath, isAdminDemoMode } from "@/config/admin";
import { adminRoles, getRolesForUser, hasAnyRole } from "@/lib/auth/routeGuard";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signInAdmin(formData: FormData) {
  if (isAdminDemoMode) {
    redirect("/admin/giris?durum=demo");
  }

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/admin/giris?durum=env-eksik");
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    redirect("/admin/giris?durum=hata");
  }

  const roles = await getRolesForUser(data.user);
  if (!hasAnyRole(roles, adminRoles)) {
    await supabase.auth.signOut();
    redirect("/admin/giris?durum=yetkisiz");
  }

  // TODO: 8D'de profiles/admin_roles/user_accounts/role_permissions üzerinden read-only rol doğrulaması RLS ile bağlanacak.
  redirect(adminHomePath);
}
