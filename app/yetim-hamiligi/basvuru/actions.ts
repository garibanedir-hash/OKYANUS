"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentSponsorshipDonorContext } from "@/lib/data/orphanSponsorshipRepository";
import {
  createSponsorshipApplication,
  getProgramForApplication,
  OrphanSponsorshipWriteError
} from "@/lib/data/orphanSponsorshipWriteRepository";
import { isOnlineDonationMode } from "@/lib/donations/donationMode";
import { assertLegalConsentRequirements, readServerLegalConsent } from "@/lib/legal/serverConsent";
import {
  evaluateFormProtection,
  FORM_SECURITY_GENERIC_ERROR,
  validateEmailFormat,
  validatePhoneFormat,
  validateTextLength
} from "@/lib/security/formProtection";
import { validateTurnstileFromFormData } from "@/lib/security/turnstile";

const supportPeriods = ["monthly", "quarterly", "yearly"] as const;

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
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
  const programIdOrSlug = validateTextLength(
    getString(formData, "program") || getString(formData, "programSlug") || getString(formData, "programId"),
    {
      fieldLabel: "Sponsorluk programı",
      max: 120,
      required: true
    }
  );
  const requestedAmountRaw = getString(formData, "requestedAmount") || getString(formData, "amount");
  const applicantName = validateTextLength(getString(formData, "fullName"), {
    fieldLabel: "Ad soyad",
    min: 3,
    max: 120,
    required: true
  });
  const applicantEmail = validateEmailFormat(getString(formData, "email"));
  const applicantPhone = validatePhoneFormat(getString(formData, "phone"), { required: true });
  const applicantCity = validateTextLength(getString(formData, "city"), {
    fieldLabel: "Şehir",
    max: 80
  });
  const supportPeriod = getString(formData, "supportPeriod") || getString(formData, "period");
  const note = validateTextLength(getString(formData, "note"), {
    fieldLabel: "Not",
    max: 500
  });

  if (requestedAmountRaw && !Number.isFinite(Number(requestedAmountRaw))) throw new Error("Aylık destek tutarı sayısal olmalıdır.");
  if (!supportPeriods.includes(supportPeriod as (typeof supportPeriods)[number])) throw new Error("Geçerli bir destek periyodu seçilmelidir.");

  return {
    programIdOrSlug,
    applicantName,
    applicantEmail,
    applicantPhone,
    applicantCity: applicantCity || null,
    supportPeriod: supportPeriod as (typeof supportPeriods)[number],
    note: note || null
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
  const formProtection = await evaluateFormProtection(formData, { form: "orphan" });
  if (formProtection.honeypotTrapped) {
    redirectWithStatus("alindi");
  }

  if (formProtection.rateLimited) {
    redirectWithStatus("hata", { mesaj: FORM_SECURITY_GENERIC_ERROR });
  }

  const attemptedProgram = getString(formData, "program") || getString(formData, "programSlug") || getString(formData, "programId");
  let success: { applicationNo: string; amount: number; programSlug: string; linkedPanel: boolean } | null = null;

  try {
    const turnstile = await validateTurnstileFromFormData(formData, { form: "orphan" });
    const input = parseApplicationForm(formData);
    const legalConsent = await readServerLegalConsent(formData, "orphan", {
      form: "orphan_sponsorship_application",
      legalNoticeSlug: "bagis-bilgilendirme-ve-sartlari",
      ...formProtection.metadata,
      ...turnstile.metadata
    });
    assertLegalConsentRequirements(legalConsent);

    if (!isOnlineDonationMode()) {
      throw new Error("Yetim hamiliği online başvuru akışı şu anda aktif değildir. Lütfen bağış bilgilendirme hattından destek alın.");
    }

    const program = await getProgramForApplication(input.programIdOrSlug);

    if (program.status !== "active") {
      throw new Error("Seçtiğiniz yetim hamiliği programı şu anda aktif değil.");
    }

    const donorContext = await getCurrentSponsorshipDonorContext();
    const sponsorAccountId = getSponsorAccountId(donorContext);
    const result = await createSponsorshipApplication(
      {
        ...input,
        kvkkAccepted: legalConsent.kvkkAcknowledged,
        contactPermission: legalConsent.communicationPermissionGiven,
        legalConsent
      },
      {
        userId: donorContext?.userId ?? null,
        sponsorAccountId,
      }
    );

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
