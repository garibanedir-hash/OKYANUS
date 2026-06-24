"use server";

import { redirect } from "next/navigation";
import { isAdminDemoMode } from "@/config/admin";
import { getRolesForUser } from "@/lib/auth/routeGuard";
import { getDefaultPanelPathForRoles } from "@/lib/auth/roleRedirect";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signInPublic(formData: FormData) {
  if (isAdminDemoMode) {
    redirect("/giris?durum=sinirli");
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/giris?durum=eksik");
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/giris?durum=env-eksik");
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    redirect("/giris?durum=hata");
  }

  const roles = await getRolesForUser(data.user);
  const redirectTo = getDefaultPanelPathForRoles(roles);

  if (!roles.length || redirectTo === "/giris") {
    await supabase.auth.signOut();
    redirect("/giris?durum=yetkisiz");
  }

  redirect(redirectTo);
}
