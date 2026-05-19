"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createQurbanOrder, getCampaignForOrder, getCurrentQurbanDonorContext, QurbanWriteError } from "@/lib/data/qurbanWriteRepository";
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

function validateEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function parseQurbanOrderForm(formData: FormData) {
  const campaignSlug = getString(formData, "campaign") || getString(formData, "campaignSlug") || getString(formData, "campaignId");
  const qurbanType = getString(formData, "qurbanType") as QurbanType;
  const shareCount = Number.parseInt(getString(formData, "shareCount"), 10);
  const donorName = getString(formData, "fullName");
  const donorEmail = getString(formData, "email").toLowerCase();
  const donorPhone = getString(formData, "phone");
  const donorCity = getString(formData, "city");
  const note = getString(formData, "note");
  const delegationAccepted = getBoolean(formData, "delegationAccepted");
  const kvkkAccepted = getBoolean(formData, "kvkkAccepted");
  const contactPermission = getBoolean(formData, "contactPermission");

  if (!campaignSlug) throw new Error("Kurban kampanyası seçilmelidir.");
  if (!qurbanTypes.includes(qurbanType)) throw new Error("Geçerli bir kurban türü seçilmelidir.");
  if (!Number.isInteger(shareCount) || shareCount < 1 || shareCount > 20) throw new Error("Hisse/adet sayısı 1 ile 20 arasında olmalıdır.");
  if (donorName.length < 3 || donorName.length > 120) throw new Error("Ad soyad alanı zorunludur.");
  if (!validateEmail(donorEmail) || donorEmail.length > 160) throw new Error("Geçerli bir e-posta adresi girilmelidir.");
  if (donorPhone.length < 7 || donorPhone.length > 30) throw new Error("Telefon alanı zorunludur.");
  if (donorCity.length > 80) throw new Error("Şehir alanı çok uzun.");
  if (note.length > 500) throw new Error("Not alanı en fazla 500 karakter olabilir.");
  if (!delegationAccepted) throw new Error("Vekalet onayı olmadan kurban başvurusu alınamaz.");
  if (!kvkkAccepted) throw new Error("KVKK onayı zorunludur.");

  return {
    campaignSlug,
    qurbanType,
    shareCount,
    donorName,
    donorEmail,
    donorPhone,
    donorCity: donorCity || null,
    note: note || null,
    delegationAccepted,
    kvkkAccepted,
    contactPermission
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
  if (error instanceof QurbanWriteError || error instanceof Error) {
    return error.message;
  }

  return "Kurban başvurusu oluşturulamadı. Lütfen tekrar deneyin.";
}

export async function createQurbanOrderAction(formData: FormData) {
  const honeypot = getString(formData, "website");
  if (honeypot) {
    redirectWithStatus("alindi");
  }

  let success: { orderNo: string; shareCount: number; totalAmount: number } | null = null;

  try {
    const input = parseQurbanOrderForm(formData);
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
        kvkkAccepted: input.kvkkAccepted,
        contactPermission: input.contactPermission,
        delegationAccepted: input.delegationAccepted
      },
      {
        userId: donorContext?.userId ?? null,
        donorAccountId,
        source: "web"
      }
    );

    revalidatePath("/kurban");
    revalidatePath(`/kurban/${campaign.slug}`);
    revalidatePath("/kurban/bagis");
    revalidatePath("/admin/kurban");
    revalidatePath("/admin/kurban/bagislar");
    revalidatePath("/panel/kurbanlarim");

    success = {
      orderNo: result.orderNo,
      shareCount: result.shareCount,
      totalAmount: result.totalAmount
    };
  } catch (error) {
    redirectWithStatus("hata", { mesaj: getFriendlyError(error) });
  }

  if (success) {
    redirectWithStatus("basarili", {
      siparis: success.orderNo,
      adet: success.shareCount,
      tutar: Math.round(success.totalAmount)
    });
  }
}
