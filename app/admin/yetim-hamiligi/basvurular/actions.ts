"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminUser, AdminAuthorizationError } from "@/lib/auth/requireAdmin";
import {
  approveSponsorshipMatch,
  createSponsorshipFromMatch,
  createSponsorshipMatch,
  OrphanSponsorshipWriteError,
  rejectSponsorshipApplication
} from "@/lib/data/orphanSponsorshipWriteRepository";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function redirectToMatch(applicationId: string, durum: string, extra?: Record<string, string | number | undefined>) {
  const params = new URLSearchParams({ durum });

  for (const [key, value] of Object.entries(extra ?? {})) {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  }

  redirect(`/admin/yetim-hamiligi/basvurular/${applicationId}/eslestir?${params.toString()}`);
}

function getFriendlyError(error: unknown) {
  if (error instanceof AdminAuthorizationError || error instanceof OrphanSponsorshipWriteError || error instanceof Error) {
    return error.message;
  }

  return "İşlem tamamlanamadı. Lütfen bilgileri kontrol edip tekrar deneyin.";
}

export async function approveAndMatchSponsorshipAction(formData: FormData) {
  const applicationId = getString(formData, "applicationId");
  const orphanId = getString(formData, "orphanId");
  const note = getString(formData, "note");
  let success: { sponsorshipNo: string } | null = null;

  if (!applicationId) {
    redirectToMatch("eksik", "hata", { mesaj: "Başvuru kaydı seçilmelidir." });
  }

  try {
    if (!orphanId) throw new Error("Eşleştirme için uygun yetim profili seçilmelidir.");

    const admin = await requireAdminUser();
    const match = await createSponsorshipMatch({
      applicationId,
      orphanId,
      actorId: admin.user.id,
      note: note || null
    });
    const approvedMatch = await approveSponsorshipMatch(match.id, admin.user.id);
    const result = await createSponsorshipFromMatch(approvedMatch.id, admin.user.id);

    revalidatePath("/admin/yetim-hamiligi");
    revalidatePath("/admin/yetim-hamiligi/basvurular");
    revalidatePath(`/admin/yetim-hamiligi/basvurular/${applicationId}/eslestir`);
    revalidatePath("/admin/yetim-hamiligi/sponsorluklar");
    revalidatePath("/admin/yetim-hamiligi/yetimler");
    revalidatePath("/panel/yetim-sponsorluk");

    success = { sponsorshipNo: result.sponsorshipNo };
  } catch (error) {
    redirectToMatch(applicationId, "hata", { mesaj: getFriendlyError(error) });
  }

  if (success) {
    redirectToMatch(applicationId, "basarili", { sponsorluk: success.sponsorshipNo });
  }
}

export async function rejectSponsorshipApplicationAction(formData: FormData) {
  const applicationId = getString(formData, "applicationId");
  const note = getString(formData, "rejectNote") || getString(formData, "note");

  if (!applicationId) {
    redirectToMatch("eksik", "hata", { mesaj: "Başvuru kaydı seçilmelidir." });
  }

  try {
    const admin = await requireAdminUser();
    await rejectSponsorshipApplication({
      applicationId,
      actorId: admin.user.id,
      note: note || null
    });

    revalidatePath("/admin/yetim-hamiligi");
    revalidatePath("/admin/yetim-hamiligi/basvurular");
    revalidatePath(`/admin/yetim-hamiligi/basvurular/${applicationId}/eslestir`);
  } catch (error) {
    redirectToMatch(applicationId, "hata", { mesaj: getFriendlyError(error) });
  }

  redirectToMatch(applicationId, "reddedildi");
}
