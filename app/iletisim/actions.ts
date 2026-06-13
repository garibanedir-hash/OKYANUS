"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createContactMessage, PublicFormWriteError } from "@/lib/data/publicFormWriteRepository";
import { assertLegalConsentRequirements, readServerLegalConsent } from "@/lib/legal/serverConsent";
import {
  evaluateFormProtection,
  FORM_SECURITY_GENERIC_ERROR,
  validateEmailFormat,
  validateTextLength
} from "@/lib/security/formProtection";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function redirectWithStatus(durum: string, extra?: Record<string, string | undefined>) {
  const params = new URLSearchParams({ durum });

  for (const [key, value] of Object.entries(extra ?? {})) {
    if (value) params.set(key, value);
  }

  redirect(`/iletisim?${params.toString()}`);
}

function getFriendlyError(error: unknown) {
  if (error instanceof PublicFormWriteError || error instanceof Error) return error.message;
  return "Mesajınız kaydedilemedi. Lütfen tekrar deneyin.";
}

export async function createContactMessageAction(formData: FormData) {
  const formProtection = await evaluateFormProtection(formData, { form: "contact" });
  if (formProtection.honeypotTrapped) {
    redirectWithStatus("alindi");
  }

  if (formProtection.rateLimited) {
    redirectWithStatus("hata", { mesaj: FORM_SECURITY_GENERIC_ERROR });
  }

  try {
    const fullName = validateTextLength(getString(formData, "fullName"), {
      fieldLabel: "Ad soyad",
      min: 3,
      max: 120,
      required: true
    });
    const email = validateEmailFormat(getString(formData, "email"));
    const subject = validateTextLength(getString(formData, "subject"), {
      fieldLabel: "Konu",
      min: 3,
      max: 160,
      required: true
    });
    const message = validateTextLength(getString(formData, "message"), {
      fieldLabel: "Mesaj",
      min: 10,
      max: 1500,
      required: true
    });
    const legalConsent = await readServerLegalConsent(formData, "contact", {
      form: "contact",
      legalNoticeSlug: "iletisim-formu-aydinlatma-metni",
      ...formProtection.metadata
    });

    assertLegalConsentRequirements(legalConsent, {
      kvkkMessage: "İletişim formu aydınlatma metnini okuduğunuzu onaylamalısınız."
    });

    await createContactMessage({
      fullName,
      email,
      subject,
      message,
      legalConsent
    });

    revalidatePath("/admin/iletisim-mesajlari");
  } catch (error) {
    redirectWithStatus("hata", { mesaj: getFriendlyError(error) });
  }

  redirectWithStatus("alindi");
}
