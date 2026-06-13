"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createPaymentIntentForContext, PaymentWriteError } from "@/lib/data/paymentWriteRepository";
import { buildGeneralDonationPaymentContext } from "@/lib/payments/paymentContext";
import { isOnlineDonationMode } from "@/lib/donations/donationMode";
import { assertLegalConsentRequirements, readServerLegalConsent } from "@/lib/legal/serverConsent";
import {
  evaluateFormProtection,
  FORM_SECURITY_GENERIC_ERROR,
  validateEmailFormat,
  validatePhoneFormat,
  validateTextLength
} from "@/lib/security/formProtection";

const MIN_DONATION_AMOUNT = 10;

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function redirectToDonationForm(durum: string, extra?: Record<string, string | number | undefined>) {
  const params = new URLSearchParams({ durum });

  for (const [key, value] of Object.entries(extra ?? {})) {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  }

  redirect(`/bagis-yap?${params.toString()}`);
}

function parseAmount(value: string) {
  const normalized = value.replace(",", ".");
  const amount = Number(normalized);
  return Number.isFinite(amount) ? Math.round(amount * 100) / 100 : 0;
}

function resolveDonationAmount(formData: FormData) {
  const amountChoice = getString(formData, "amount");
  const amount = amountChoice === "custom" ? parseAmount(getString(formData, "customAmount")) : parseAmount(amountChoice);

  if (amount < MIN_DONATION_AMOUNT) {
    throw new Error(`Bağış tutarı en az ${MIN_DONATION_AMOUNT} TL olmalıdır.`);
  }

  if (amount > 1_000_000) {
    throw new Error("Bağış tutarı güvenli işlem limiti üzerinde görünüyor.");
  }

  return amount;
}

function getFriendlyError(error: unknown) {
  if (error instanceof PaymentWriteError || error instanceof Error) return error.message;
  return "Bağış ön kaydı oluşturulamadı. Lütfen tekrar deneyin.";
}

export async function createGeneralDonationPaymentIntentAction(formData: FormData) {
  const formProtection = await evaluateFormProtection(formData, { form: "donation" });
  if (formProtection.honeypotTrapped) {
    redirectToDonationForm("alindi");
  }

  if (formProtection.rateLimited) {
    redirectToDonationForm("hata", { mesaj: FORM_SECURITY_GENERIC_ERROR });
  }

  let paymentIntentNo: string | null = null;

  try {
    const donorName = validateTextLength(getString(formData, "fullName"), {
      fieldLabel: "Ad soyad",
      min: 3,
      max: 120,
      required: true
    });
    const donorEmail = validateEmailFormat(getString(formData, "email"));
    const donorPhone = validatePhoneFormat(getString(formData, "phone"));
    const donationType =
      validateTextLength(getString(formData, "donationType"), {
        fieldLabel: "Bağış türü",
        max: 80
      }) || "Genel Bağış";
    const selectedProject = validateTextLength(getString(formData, "selectedProject"), {
      fieldLabel: "Proje seçimi",
      max: 120
    });
    const note = validateTextLength(getString(formData, "note"), {
      fieldLabel: "Not",
      max: 500
    });
    const amount = resolveDonationAmount(formData);
    const legalConsent = await readServerLegalConsent(formData, "donation", {
      form: "general_donation",
      legalNoticeSlug: "bagis-bilgilendirme-ve-sartlari",
      ...formProtection.metadata
    });

    assertLegalConsentRequirements(legalConsent);

    if (!isOnlineDonationMode()) {
      throw new Error("Online bağış işlemleri şu anda aktif değildir. Lütfen bağış bilgilendirme hattından destek alın.");
    }

    const paymentContext = buildGeneralDonationPaymentContext({
      donorName,
      donorEmail,
      donorPhone: donorPhone || null,
      amount,
      currency: "TRY",
      donationType,
      projectSlug: selectedProject && selectedProject !== "genel" ? selectedProject : null,
      note: note || null,
      contactPermission: legalConsent.communicationPermissionGiven,
      legalConsent
    });

    const paymentIntent = await createPaymentIntentForContext(paymentContext, { actorRole: "donor_form" });

    revalidatePath("/admin/odeme-kayitlari");
    revalidatePath("/panel/bagislarim");

    paymentIntentNo = paymentIntent.intentNo;
  } catch (error) {
    redirectToDonationForm("hata", { mesaj: getFriendlyError(error) });
  }

  if (paymentIntentNo) {
    redirect(`/odeme/paytr/${paymentIntentNo}`);
  }
}
