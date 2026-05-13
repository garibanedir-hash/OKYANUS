"use server";

import { redirect } from "next/navigation";
import { adminHomePath, isAdminDemoMode } from "@/config/admin";
import { type ReadOnlySupabaseClient, verifyAdminAccessForUser } from "@/lib/auth/routeGuard";
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

  const access = await verifyAdminAccessForUser(data.user, supabase as unknown as ReadOnlySupabaseClient);
  if (!access.allowed) {
    await supabase.auth.signOut();

    if (access.reason === "unverified") {
      redirect("/admin/giris?durum=rol-dogrulanamadi");
    }

    redirect("/admin/giris?durum=yetkisiz");
  }

  // admin_roles rol tanım tablosudur; kullanıcı-rol bağlantısı olarak kullanılmaz.
  redirect(adminHomePath);
}
