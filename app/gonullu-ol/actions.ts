"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createVolunteerApplication, PublicFormWriteError } from "@/lib/data/publicFormWriteRepository";
import { assertLegalConsentRequirements, readServerLegalConsent } from "@/lib/legal/serverConsent";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function validateEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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
  const honeypot = getString(formData, "website");
  if (honeypot) {
    redirectWithStatus("alindi");
  }

  try {
    const fullName = getString(formData, "fullName");
    const email = getString(formData, "email").toLowerCase();
    const phone = getString(formData, "phone");
    const city = getString(formData, "city");
    const age = parseOptionalAge(getString(formData, "age"));
    const interestArea = getString(formData, "interestArea");
    const experience = getString(formData, "experience");
    const note = getString(formData, "note");
    const legalConsent = await readServerLegalConsent(formData, "volunteer", {
      form: "volunteer",
      legalNoticeSlug: "gonullu-basvuru-aydinlatma-metni"
    });

    if (fullName.length < 3 || fullName.length > 120) throw new Error("Ad soyad alanı zorunludur.");
    if (!validateEmail(email) || email.length > 160) throw new Error("Geçerli bir e-posta adresi girilmelidir.");
    if (phone && (phone.length < 7 || phone.length > 30)) throw new Error("Telefon alanı geçerli görünmüyor.");
    if (city.length > 80) throw new Error("Şehir alanı çok uzun.");
    if (age !== null && (age < 16 || age > 100)) throw new Error("Yaş alanı geçerli görünmüyor.");
    if (interestArea.length < 2 || interestArea.length > 120) throw new Error("İlgi alanı seçilmelidir.");
    if (experience.length > 1000 || note.length > 1000) throw new Error("Açıklama alanları en fazla 1000 karakter olabilir.");

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
