"use server";

import { redirect } from "next/navigation";
import { isAdminDemoMode } from "@/config/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function registerDemoAction() {
  return {
    ok: false,
    message: "Tanıtım döneminde üyelik oluşturma sınırlıdır. Bilgi almak için iletişim kanallarımızı kullanabilirsiniz."
  };
}

export async function registerPublicAccount(formData: FormData) {
  if (isAdminDemoMode) {
    redirect("/kayit?durum=demo");
  }

  const accountType = String(formData.get("accountType") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");
  const kvkkAccepted = formData.get("kvkkAccepted") === "on";
  const communicationPermission = formData.get("communicationPermission") === "on";

  if (!kvkkAccepted) {
    redirect("/kayit?durum=kvkk");
  }

  if (!fullName || !email || !password || password !== passwordConfirm) {
    redirect("/kayit?durum=eksik");
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/kayit?durum=env-eksik");
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        account_type: accountType,
        full_name: fullName,
        phone,
        city,
        kvkk_accepted: kvkkAccepted,
        communication_permission: communicationPermission
      }
    }
  });

  if (error) {
    redirect("/kayit?durum=hata");
  }

  // TODO: 8D'de user_accounts / donor_profiles / volunteer_profiles kayıtları güvenli server action ile oluşturulacak.
  redirect("/giris?durum=kayit-basarili");
}
