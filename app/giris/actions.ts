"use server";

import { redirect } from "next/navigation";
import { isAdminDemoMode } from "@/config/admin";
import { getDefaultPanelPathForRole } from "@/lib/auth/roleRedirect";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function loginDemoAction() {
  return {
    ok: false,
    message: "Bu ekran demo modda çalışmaktadır. Gerçek giriş Supabase Auth entegrasyonundan sonra aktif olacaktır."
  };
}

export async function signInPublic(formData: FormData) {
  if (isAdminDemoMode) {
    redirect("/giris?durum=demo");
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

  const role =
    data.user.app_metadata?.role ??
    data.user.app_metadata?.account_type ??
    data.user.user_metadata?.role ??
    data.user.user_metadata?.account_type;

  // TODO: 8D'de `user_accounts`, `donor_profiles` ve `volunteer_profiles` üzerinden gerçek account type doğrulanacak.
  redirect(getDefaultPanelPathForRole(typeof role === "string" ? role : null));
}
