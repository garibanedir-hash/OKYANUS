"use server";

import { redirect } from "next/navigation";
import { isAdminDemoMode } from "@/config/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { readServerLegalConsent } from "@/lib/legal/serverConsent";

export async function registerDemoAction() {
  return {
    ok: false,
    message: "Tanıtım döneminde üyelik oluşturma sınırlıdır. Bilgi almak için iletişim kanallarımızı kullanabilirsiniz."
  };
}

export async function registerPublicAccount(formData: FormData) {
  if (isAdminDemoMode) {
    redirect("/kayit?durum=sinirli");
  }

  const accountType = String(formData.get("accountType") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");
  const termsAccepted = formData.get("termsAccepted") === "on";
  const legalConsent = await readServerLegalConsent(formData, "registration", {
    form: "registration",
    legalNoticeSlug: "kvkk-aydinlatma-metni"
  });

  if (!legalConsent.kvkkAcknowledged) {
    redirect("/kayit?durum=kvkk");
  }

  if (!termsAccepted) {
    redirect("/kayit?durum=kullanim-sartlari");
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
        kvkk_accepted: legalConsent.kvkkAcknowledged,
        communication_permission: legalConsent.communicationPermissionGiven,
        kvkk_acknowledged: legalConsent.kvkkAcknowledged,
        explicit_consent_given: legalConsent.explicitConsentGiven,
        communication_permission_given: legalConsent.communicationPermissionGiven,
        consent_text_version: legalConsent.consentTextVersion,
        consent_given_at: legalConsent.consentGivenAt,
        consent_user_agent: legalConsent.consentUserAgent,
        consent_metadata: legalConsent.consentMetadata,
        terms_accepted: termsAccepted,
        terms_accepted_at: legalConsent.consentGivenAt
      }
    }
  });

  if (error) {
    redirect("/kayit?durum=hata");
  }

  // User account profile records are handled in a later account provisioning step.
  redirect("/giris?durum=kayit-basarili");
}
