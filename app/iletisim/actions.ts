"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createContactMessage, PublicFormWriteError } from "@/lib/data/publicFormWriteRepository";
import { assertLegalConsentRequirements, readServerLegalConsent } from "@/lib/legal/serverConsent";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function validateEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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
  const honeypot = getString(formData, "website");
  if (honeypot) {
    redirectWithStatus("alindi");
  }

  try {
    const fullName = getString(formData, "fullName");
    const email = getString(formData, "email").toLowerCase();
    const subject = getString(formData, "subject");
    const message = getString(formData, "message");
    const legalConsent = await readServerLegalConsent(formData, "contact", {
      form: "contact",
      legalNoticeSlug: "iletisim-formu-aydinlatma-metni"
    });

    if (fullName.length < 3 || fullName.length > 120) throw new Error("Ad soyad alanı zorunludur.");
    if (!validateEmail(email) || email.length > 160) throw new Error("Geçerli bir e-posta adresi girilmelidir.");
    if (subject.length < 3 || subject.length > 160) throw new Error("Konu alanı zorunludur.");
    if (message.length < 10 || message.length > 1500) throw new Error("Mesaj alanı 10-1500 karakter arasında olmalıdır.");

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
