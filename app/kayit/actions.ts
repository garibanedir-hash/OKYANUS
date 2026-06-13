"use server";

import { redirect } from "next/navigation";
import { isAdminDemoMode } from "@/config/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { readServerLegalConsent } from "@/lib/legal/serverConsent";
import {
  evaluateFormProtection,
  validateEmailFormat,
  validatePhoneFormat,
  validateTextLength
} from "@/lib/security/formProtection";
import { validateTurnstileFromFormData } from "@/lib/security/turnstile";

export async function registerDemoAction() {
  return {
    ok: false,
    message: "Tanıtım döneminde üyelik oluşturma sınırlıdır. Bilgi almak için iletişim kanallarımızı kullanabilirsiniz."
  };
}

export async function registerPublicAccount(formData: FormData) {
  const formProtection = await evaluateFormProtection(formData, {
    form: "registration",
    rateLimit: {
      maxAttempts: 4,
      windowMs: 10 * 60 * 1000
    }
  });

  if (formProtection.honeypotTrapped) {
    redirect("/giris?durum=kayit-basarili");
  }

  if (formProtection.rateLimited) {
    redirect("/kayit?durum=hata");
  }

  let turnstileMetadata: Record<string, unknown> = {};
  try {
    const turnstile = await validateTurnstileFromFormData(formData, { form: "registration" });
    turnstileMetadata = turnstile.metadata;
  } catch {
    redirect("/kayit?durum=hata");
  }

  if (isAdminDemoMode) {
    redirect("/kayit?durum=sinirli");
  }

  let accountType = String(formData.get("accountType") ?? "").trim();
  let fullName = "";
  let email = "";
  let phone = "";
  let city = "";
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");
  const termsAccepted = formData.get("termsAccepted") === "on";

  try {
    if (!["Bağışçı", "Gönüllü", "Bağışçı + Gönüllü"].includes(accountType)) {
      accountType = "Bağışçı";
    }

    fullName = validateTextLength(String(formData.get("fullName") ?? ""), {
      fieldLabel: "Ad soyad",
      min: 3,
      max: 120,
      required: true
    });
    email = validateEmailFormat(String(formData.get("email") ?? ""));
    phone = validatePhoneFormat(String(formData.get("phone") ?? ""));
    city = validateTextLength(String(formData.get("city") ?? ""), {
      fieldLabel: "Şehir",
      max: 80
    });

    if (password.length < 8 || password.length > 128 || password !== passwordConfirm) {
      redirect("/kayit?durum=eksik");
    }
  } catch {
    redirect("/kayit?durum=eksik");
  }

  const legalConsent = await readServerLegalConsent(formData, "registration", {
    form: "registration",
    legalNoticeSlug: "kvkk-aydinlatma-metni",
    ...formProtection.metadata,
    ...turnstileMetadata
  });

  if (!legalConsent.kvkkAcknowledged) {
    redirect("/kayit?durum=kvkk");
  }

  if (!termsAccepted) {
    redirect("/kayit?durum=kullanim-sartlari");
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
