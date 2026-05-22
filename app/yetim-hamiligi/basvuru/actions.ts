"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentSponsorshipDonorContext } from "@/lib/data/orphanSponsorshipRepository";
import {
  createSponsorshipApplication,
  getProgramForApplication,
  OrphanSponsorshipWriteError
} from "@/lib/data/orphanSponsorshipWriteRepository";

const supportPeriods = ["monthly", "quarterly", "yearly"] as const;

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getBoolean(formData: FormData, key: string) {
  const value = formData.get(key);
  return value === "on" || value === "true" || value === "1";
}

function validateEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function redirectWithStatus(durum: string, extra?: Record<string, string | number | undefined>) {
  const params = new URLSearchParams({ durum });

  for (const [key, value] of Object.entries(extra ?? {})) {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  }

  redirect(`/yetim-hamiligi/basvuru?${params.toString()}`);
}

function parseApplicationForm(formData: FormData) {
  const programIdOrSlug = getString(formData, "program") || getString(formData, "programSlug") || getString(formData, "programId");
  const requestedAmountRaw = getString(formData, "requestedAmount") || getString(formData, "amount");
  const applicantName = getString(formData, "fullName");
  const applicantEmail = getString(formData, "email").toLowerCase();
  const applicantPhone = getString(formData, "phone");
  const applicantCity = getString(formData, "city");
  const supportPeriod = getString(formData, "supportPeriod") || getString(formData, "period");
  const note = getString(formData, "note");
  const kvkkAccepted = getBoolean(formData, "kvkkAccepted");
  const contactPermission = getBoolean(formData, "contactPermission");

  if (!programIdOrSlug) throw new Error("Sponsorluk programı seçilmelidir.");
  if (requestedAmountRaw && !Number.isFinite(Number(requestedAmountRaw))) throw new Error("Aylık destek tutarı sayısal olmalıdır.");
  if (applicantName.length < 3 || applicantName.length > 120) throw new Error("Ad soyad alanı zorunludur.");
  if (!validateEmail(applicantEmail) || applicantEmail.length > 160) throw new Error("Geçerli bir e-posta adresi girilmelidir.");
  if (applicantPhone.length < 7 || applicantPhone.length > 30) throw new Error("Telefon alanı zorunludur.");
  if (applicantCity.length > 80) throw new Error("Şehir alanı çok uzun.");
  if (!supportPeriods.includes(supportPeriod as (typeof supportPeriods)[number])) throw new Error("Geçerli bir destek periyodu seçilmelidir.");
  if (note.length > 500) throw new Error("Not alanı en fazla 500 karakter olabilir.");
  if (!kvkkAccepted) throw new Error("KVKK onayı zorunludur.");

  return {
    programIdOrSlug,
    applicantName,
    applicantEmail,
    applicantPhone,
    applicantCity: applicantCity || null,
    supportPeriod: supportPeriod as (typeof supportPeriods)[number],
    note: note || null,
    kvkkAccepted,
    contactPermission
  };
}

function getSponsorAccountId(context: Awaited<ReturnType<typeof getCurrentSponsorshipDonorContext>>) {
  const account = context?.account;
  if (!account || account.status !== "active") return null;

  const normalizedAccountType = account.account_type.toLowerCase();
  const normalizedRole = account.role.toLowerCase();
  const canLinkSponsor =
    normalizedAccountType.includes("donor") ||
    normalizedAccountType.includes("bagisci") ||
    normalizedAccountType.includes("bağışçı") ||
    normalizedAccountType.includes("sponsor") ||
    normalizedRole.includes("donor") ||
    normalizedRole.includes("bagisci") ||
    normalizedRole.includes("bağışçı") ||
    normalizedRole.includes("sponsor");

  return canLinkSponsor ? account.id : null;
}

function getFriendlyError(error: unknown) {
  if (error instanceof OrphanSponsorshipWriteError || error instanceof Error) {
    return error.message;
  }

  return "Yetim hamiliği başvurusu oluşturulamadı. Lütfen tekrar deneyin.";
}

export async function createSponsorshipApplicationAction(formData: FormData) {
  const honeypot = getString(formData, "website");
  if (honeypot) {
    redirectWithStatus("alindi");
  }

  const attemptedProgram = getString(formData, "program") || getString(formData, "programSlug") || getString(formData, "programId");
  let success: { applicationNo: string; amount: number; programSlug: string; linkedPanel: boolean } | null = null;

  try {
    const input = parseApplicationForm(formData);
    const program = await getProgramForApplication(input.programIdOrSlug);

    if (program.status !== "active") {
      throw new Error("Seçtiğiniz yetim hamiliği programı şu anda aktif değil.");
    }

    const donorContext = await getCurrentSponsorshipDonorContext();
    const sponsorAccountId = getSponsorAccountId(donorContext);
    const result = await createSponsorshipApplication(input, {
      userId: donorContext?.userId ?? null,
      sponsorAccountId,
    });

    revalidatePath("/yetim-hamiligi");
    revalidatePath("/yetim-hamiligi/basvuru");
    revalidatePath("/admin/yetim-hamiligi");
    revalidatePath("/admin/yetim-hamiligi/basvurular");
    revalidatePath("/panel/yetim-sponsorluk");

    success = {
      applicationNo: result.applicationNo,
      amount: result.requestedAmount,
      programSlug: program.slug,
      linkedPanel: Boolean(result.sponsorAccountId)
    };
  } catch (error) {
    redirectWithStatus("hata", { mesaj: getFriendlyError(error), program: attemptedProgram });
  }

  if (success) {
    redirectWithStatus("basarili", {
      basvuru: success.applicationNo,
      tutar: Math.round(success.amount),
      program: success.programSlug,
      panel: success.linkedPanel ? "1" : undefined
    });
  }
}
