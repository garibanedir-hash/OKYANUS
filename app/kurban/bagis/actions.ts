"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createPaymentIntentForContext, PaymentWriteError } from "@/lib/data/paymentWriteRepository";
import { createQurbanOrder, getCampaignForOrder, getCurrentQurbanDonorContext, QurbanWriteError } from "@/lib/data/qurbanWriteRepository";
import { buildQurbanPaymentContext } from "@/lib/payments/paymentContext";
import { isOnlineDonationMode } from "@/lib/donations/donationMode";
import { assertLegalConsentRequirements, readServerLegalConsent } from "@/lib/legal/serverConsent";
import {
  evaluateFormProtection,
  FORM_SECURITY_GENERIC_ERROR,
  validateEmailFormat,
  validatePhoneFormat,
  validateTextLength
} from "@/lib/security/formProtection";
import type { QurbanType } from "@/data/qurbanMock";

const qurbanTypes: QurbanType[] = ["vacip", "adak", "akika", "sukur", "nafile", "genel"];

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getBoolean(formData: FormData, key: string) {
  const value = formData.get(key);
  return value === "on" || value === "true" || value === "1";
}

function redirectWithStatus(durum: string, extra?: Record<string, string | number | undefined>) {
  const params = new URLSearchParams({ durum });

  for (const [key, value] of Object.entries(extra ?? {})) {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  }

  redirect(`/kurban/bagis?${params.toString()}`);
}

function parseQurbanOrderForm(formData: FormData) {
  const campaignSlug = validateTextLength(
    getString(formData, "campaign") || getString(formData, "campaignSlug") || getString(formData, "campaignId"),
    {
      fieldLabel: "Kurban kampanyası",
      max: 120,
      required: true
    }
  );
  const qurbanType = getString(formData, "qurbanType") as QurbanType;
  const shareCount = Number.parseInt(getString(formData, "shareCount"), 10);
  const donorName = validateTextLength(getString(formData, "fullName"), {
    fieldLabel: "Ad soyad",
    min: 3,
    max: 120,
    required: true
  });
  const donorEmail = validateEmailFormat(getString(formData, "email"));
  const donorPhone = validatePhoneFormat(getString(formData, "phone"), { required: true });
  const donorCity = validateTextLength(getString(formData, "city"), {
    fieldLabel: "Şehir",
    max: 80
  });
  const note = validateTextLength(getString(formData, "note"), {
    fieldLabel: "Not",
    max: 500
  });
  const delegationAccepted = getBoolean(formData, "delegationAccepted");

  if (!qurbanTypes.includes(qurbanType)) throw new Error("Geçerli bir kurban türü seçilmelidir.");
  if (!Number.isInteger(shareCount) || shareCount < 1 || shareCount > 20) throw new Error("Hisse/adet sayısı 1 ile 20 arasında olmalıdır.");
  if (!delegationAccepted) throw new Error("Vekalet onayı olmadan kurban başvurusu alınamaz.");

  return {
    campaignSlug,
    qurbanType,
    shareCount,
    donorName,
    donorEmail,
    donorPhone,
    donorCity: donorCity || null,
    note: note || null,
    delegationAccepted
  };
}

function getDonorAccountId(context: Awaited<ReturnType<typeof getCurrentQurbanDonorContext>>) {
  const account = context?.account;
  if (!account || account.status !== "active") return null;

  const normalizedAccountType = account.account_type.toLowerCase();
  const normalizedRole = account.role.toLowerCase();
  const canLinkDonor =
    normalizedAccountType.includes("donor") ||
    normalizedAccountType.includes("bagisci") ||
    normalizedAccountType.includes("bağışçı") ||
    normalizedRole.includes("donor") ||
    normalizedRole.includes("bagisci") ||
    normalizedRole.includes("bağışçı");

  return canLinkDonor ? account.id : null;
}

function getFriendlyError(error: unknown) {
  if (error instanceof QurbanWriteError || error instanceof PaymentWriteError || error instanceof Error) {
    return error.message;
  }

  return "Kurban başvurusu oluşturulamadı. Lütfen tekrar deneyin.";
}

export async function createQurbanOrderAction(formData: FormData) {
  const formProtection = await evaluateFormProtection(formData, { form: "qurban" });
  if (formProtection.honeypotTrapped) {
    redirectWithStatus("alindi");
  }

  if (formProtection.rateLimited) {
    redirectWithStatus("hata", { mesaj: FORM_SECURITY_GENERIC_ERROR });
  }

  const attemptedCampaignSlug = getString(formData, "campaign") || getString(formData, "campaignSlug") || getString(formData, "campaignId");
  let success: {
    orderNo: string;
    shareCount: number;
    totalAmount: number;
    campaignSlug: string;
    paymentIntentNo?: string;
    paymentIntentWarning?: string;
  } | null = null;

  try {
    const input = parseQurbanOrderForm(formData);
    const legalConsent = await readServerLegalConsent(formData, "qurban", {
      form: "qurban_order",
      legalNoticeSlug: "bagis-bilgilendirme-ve-sartlari",
      ...formProtection.metadata
    });
    assertLegalConsentRequirements(legalConsent);

    if (!isOnlineDonationMode()) {
      throw new Error("Kurban bağışı online başvuru akışı şu anda aktif değildir. Lütfen bağış bilgilendirme hattından destek alın.");
    }

    const campaign = await getCampaignForOrder(input.campaignSlug);

    if (!campaign || campaign.status !== "active") {
      throw new Error("Seçtiğiniz kurban kampanyası şu anda aktif değil.");
    }

    if (campaign.unitPrice <= 0) {
      throw new Error("Bu kampanya için birim bedel henüz hazır değil.");
    }

    if (campaign.quotaTotal > 0 && campaign.quotaReserved + input.shareCount > campaign.quotaTotal) {
      throw new Error("Bu kampanya için yeterli kontenjan kalmadı.");
    }

    const donorContext = await getCurrentQurbanDonorContext();
    const donorAccountId = getDonorAccountId(donorContext);
    const result = await createQurbanOrder(
      {
        campaignId: campaign.id,
        qurbanType: input.qurbanType,
        shareCount: input.shareCount,
        donorName: input.donorName,
        donorEmail: input.donorEmail,
        donorPhone: input.donorPhone,
        donorCity: input.donorCity,
        note: input.note,
        kvkkAccepted: legalConsent.kvkkAcknowledged,
        contactPermission: legalConsent.communicationPermissionGiven,
        delegationAccepted: input.delegationAccepted,
        legalConsent
      },
      {
        userId: donorContext?.userId ?? null,
        donorAccountId,
        source: "web"
      }
    );

    let paymentIntentNo: string | undefined;
    let paymentIntentWarning: string | undefined;
    try {
      const paymentContext = buildQurbanPaymentContext({
        orderId: result.orderId,
        donorAccountId,
        donorName: input.donorName,
        donorEmail: input.donorEmail,
        donorPhone: input.donorPhone,
        totalAmount: result.totalAmount,
        currency: campaign.currency,
        orderNo: result.orderNo,
        legalConsent
      });
      const paymentIntent = await createPaymentIntentForContext(paymentContext, {
        actorId: donorContext?.userId ?? null,
        actorRole: donorAccountId ? "donor" : "guest"
      });
      paymentIntentNo = paymentIntent.intentNo;
    } catch {
      paymentIntentWarning = "Ödeme bağlantısı şu anda oluşturulamadı; başvurunuz alındı ve yönetim ekranından tekrar hazırlanabilir.";
    }

    revalidatePath("/kurban");
    revalidatePath(`/kurban/${campaign.slug}`);
    revalidatePath("/kurban/bagis");
    revalidatePath("/admin/kurban");
    revalidatePath("/admin/kurban/bagislar");
    revalidatePath("/admin/odeme-kayitlari");
    revalidatePath("/panel/kurbanlarim");

    success = {
      orderNo: result.orderNo,
      shareCount: result.shareCount,
      totalAmount: result.totalAmount,
      campaignSlug: campaign.slug,
      paymentIntentNo,
      paymentIntentWarning
    };
  } catch (error) {
    redirectWithStatus("hata", { mesaj: getFriendlyError(error), kampanya: attemptedCampaignSlug });
  }

  if (success) {
    redirectWithStatus("basarili", {
      siparis: success.orderNo,
      adet: success.shareCount,
      tutar: Math.round(success.totalAmount),
      kampanya: success.campaignSlug,
      odeme: success.paymentIntentNo,
      odeme_hata: success.paymentIntentWarning ? "1" : undefined
    });
  }
}
