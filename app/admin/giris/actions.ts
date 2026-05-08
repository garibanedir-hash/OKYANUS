"use server";

import { redirect } from "next/navigation";
import { adminHomePath, isAdminDemoMode } from "@/config/admin";
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

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/admin/giris?durum=hata&mesaj=${encodeURIComponent(error.message)}`);
  }

  // TODO: profiles/admin_roles tablosundan admin rol doğrulaması yapılmalı.
  redirect(adminHomePath);
}
