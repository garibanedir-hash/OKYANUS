"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createVolunteerApplication, PublicFormWriteError } from "@/lib/data/publicFormWriteRepository";
import { assertLegalConsentRequirements, readServerLegalConsent } from "@/lib/legal/serverConsent";
import {
  evaluateFormProtection,
  FORM_SECURITY_GENERIC_ERROR,
  validateEmailFormat,
  validatePhoneFormat,
  validateTextLength
} from "@/lib/security/formProtection";
import { validateTurnstileFromFormData } from "@/lib/security/turnstile";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function parseOptionalAge(value: string) {
  if (!value) return null;
  const age = Number.parseInt(value, 10);
  return Number.isFinite(age) ? age : null;
}

function redirectWithStatus(durum: string, extra?: Record<string, string | undefined>) {
  const params = new URLSearchParams({ durum });

  for (const [key, value] of Object.entries(extra ?? {})) {
    if (value) params.set(key, value);
  }

  redirect(`/gonullu-ol?${params.toString()}`);
}

function getFriendlyError(error: unknown) {
  if (error instanceof PublicFormWriteError || error instanceof Error) return error.message;
  return "Gönüllü başvurunuz kaydedilemedi. Lütfen tekrar deneyin.";
}

export async function createVolunteerApplicationAction(formData: FormData) {
  const formProtection = await evaluateFormProtection(formData, { form: "volunteer" });
  if (formProtection.honeypotTrapped) {
    redirectWithStatus("alindi");
  }

  if (formProtection.rateLimited) {
    redirectWithStatus("hata", { mesaj: FORM_SECURITY_GENERIC_ERROR });
  }

  try {
    const turnstile = await validateTurnstileFromFormData(formData, { form: "volunteer" });
    const fullName = validateTextLength(getString(formData, "fullName"), {
      fieldLabel: "Ad soyad",
      min: 3,
      max: 120,
      required: true
    });
    const email = validateEmailFormat(getString(formData, "email"));
    const phone = validatePhoneFormat(getString(formData, "phone"));
    const city = validateTextLength(getString(formData, "city"), {
      fieldLabel: "Şehir",
      max: 80
    });
    const age = parseOptionalAge(getString(formData, "age"));
    const interestArea = validateTextLength(getString(formData, "interestArea"), {
      fieldLabel: "İlgi alanı",
      min: 2,
      max: 120,
      required: true
    });
    const experience = validateTextLength(getString(formData, "experience"), {
      fieldLabel: "Gönüllülük deneyimi",
      max: 1000
    });
    const note = validateTextLength(getString(formData, "note"), {
      fieldLabel: "Mesaj",
      max: 1000
    });
    const legalConsent = await readServerLegalConsent(formData, "volunteer", {
      form: "volunteer",
      legalNoticeSlug: "gonullu-basvuru-aydinlatma-metni",
      ...formProtection.metadata,
      ...turnstile.metadata
    });

    if (age !== null && (age < 16 || age > 100)) throw new Error("Yaş alanı geçerli görünmüyor.");

    assertLegalConsentRequirements(legalConsent, {
      requireExplicitConsent: true,
      kvkkMessage: "Gönüllü başvuru aydınlatma metnini okuduğunuzu onaylamalısınız.",
      explicitConsentMessage: "Gönüllü başvurusu için açık rıza onayı zorunludur."
    });

    await createVolunteerApplication({
      fullName,
      email,
      phone: phone || null,
      city: city || null,
      age,
      interestArea,
      experience: experience || null,
      note: note || null,
      legalConsent
    });

    revalidatePath("/admin/gonullu-basvurular");
    revalidatePath("/admin/gonullu-havuzu");
  } catch (error) {
    redirectWithStatus("hata", { mesaj: getFriendlyError(error) });
  }

  redirectWithStatus("alindi");
}
