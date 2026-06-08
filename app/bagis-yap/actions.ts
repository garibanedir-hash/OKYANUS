"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createPaymentIntentForContext, PaymentWriteError } from "@/lib/data/paymentWriteRepository";
import { buildGeneralDonationPaymentContext } from "@/lib/payments/paymentContext";
import { isOnlineDonationMode } from "@/lib/donations/donationMode";

const MIN_DONATION_AMOUNT = 10;

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getBoolean(formData: FormData, key: string) {
  const value = formData.get(key);
  return value === "on" || value === "true" || value === "1";
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

function validateEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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
  return "Bağış ödeme niyeti oluşturulamadı. Lütfen tekrar deneyin.";
}

export async function createGeneralDonationPaymentIntentAction(formData: FormData) {
  const honeypot = getString(formData, "website");
  if (honeypot) {
    redirectToDonationForm("alindi");
  }

  if (!isOnlineDonationMode()) {
    redirectToDonationForm("hata", { mesaj: "Online bağış işlemleri şu anda aktif değildir. Lütfen bağış bilgilendirme hattından destek alın." });
  }

  let paymentIntentNo: string | null = null;

  try {
    const donorName = getString(formData, "fullName");
    const donorEmail = getString(formData, "email").toLowerCase();
    const donorPhone = getString(formData, "phone");
    const donationType = getString(formData, "donationType") || "Genel Bağış";
    const selectedProject = getString(formData, "selectedProject");
    const note = getString(formData, "note");
    const kvkkAccepted = getBoolean(formData, "kvkkAccepted");
    const contactPermission = getBoolean(formData, "contactPermission");
    const amount = resolveDonationAmount(formData);

    if (donorName.length < 3 || donorName.length > 120) throw new Error("Ad soyad alanı zorunludur.");
    if (!validateEmail(donorEmail) || donorEmail.length > 160) throw new Error("Geçerli bir e-posta adresi girilmelidir.");
    if (donorPhone && (donorPhone.length < 7 || donorPhone.length > 30)) throw new Error("Telefon alanı geçerli görünmüyor.");
    if (note.length > 500) throw new Error("Not alanı en fazla 500 karakter olabilir.");
    if (!kvkkAccepted) throw new Error("KVKK onayı zorunludur.");

    const paymentContext = buildGeneralDonationPaymentContext({
      donorName,
      donorEmail,
      donorPhone: donorPhone || null,
      amount,
      currency: "TRY",
      donationType,
      projectSlug: selectedProject && selectedProject !== "genel" ? selectedProject : null,
      note: note || null,
      contactPermission
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
