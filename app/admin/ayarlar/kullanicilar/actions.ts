"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AdminAuthorizationError } from "@/lib/auth/requireAdmin";
import { inviteManagedUser, setManagedUserStatus, type ManagedUserStatus } from "@/lib/data/adminUsersRepository";

function redirectWithStatus(status: string, message?: string) {
  const params = new URLSearchParams({ durum: status });
  if (message) params.set("mesaj", message);
  redirect(`/admin/ayarlar/kullanicilar?${params.toString()}`);
}

function friendlyError(error: unknown) {
  if (error instanceof AdminAuthorizationError) {
    return "Bu işlem için yetkiniz bulunmuyor.";
  }

  return "İşlem tamamlanamadı. Lütfen bilgileri kontrol ederek tekrar deneyin.";
}

export async function inviteManagedUserAction(formData: FormData) {
  let result: Awaited<ReturnType<typeof inviteManagedUser>> | null = null;

  try {
    result = await inviteManagedUser(formData);
  } catch (error) {
    redirectWithStatus("hata", friendlyError(error));
  }

  if (!result || !result.ok) {
    redirectWithStatus("hata", result?.message ?? "İşlem tamamlanamadı.");
  }

  revalidatePath("/admin/kullanicilar");
  revalidatePath("/admin/personel");
  revalidatePath("/admin/ayarlar/kullanicilar");

  redirectWithStatus("davet-olusturuldu");
}

export async function setManagedUserStatusAction(formData: FormData) {
  const id = typeof formData.get("id") === "string" ? String(formData.get("id")) : "";
  const status = typeof formData.get("status") === "string" ? String(formData.get("status")) as ManagedUserStatus : "inactive";
  let result: Awaited<ReturnType<typeof setManagedUserStatus>> | null = null;

  try {
    result = await setManagedUserStatus(id, status);
  } catch (error) {
    redirectWithStatus("hata", friendlyError(error));
  }

  if (!result || !result.ok) {
    redirectWithStatus("hata", result?.message ?? "İşlem tamamlanamadı.");
  }

  revalidatePath("/admin/kullanicilar");
  revalidatePath("/admin/personel");
  revalidatePath("/admin/ayarlar/kullanicilar");

  redirectWithStatus(status === "active" ? "aktif-edildi" : "pasife-alindi");
}
