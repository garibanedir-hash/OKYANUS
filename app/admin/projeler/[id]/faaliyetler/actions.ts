"use server";

import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import {
  parseCsvOrLines,
  userFriendlyActionError
} from "@/lib/admin/contentValidation";
import { logAdminAction } from "@/lib/audit/auditLogger";
import { AdminAuthorizationError, requireAdminUser } from "@/lib/auth/requireAdmin";
import {
  getProjectActivityById,
  getProjectActivityProjectSummary
} from "@/lib/data/projectActivityRepository";
import {
  createProjectActivity,
  updateProjectActivity,
  updateProjectActivityStatus,
  updateProjectActivityVisibility,
  type ProjectActivityWriteInput
} from "@/lib/data/projectActivityWriteRepository";
import { slugify } from "@/lib/utils/slugify";
import type {
  ProjectActivityStatus,
  ProjectActivityType,
  ProjectActivityVisibility
} from "@/data/projectActivityMock";

const activityTypes: ProjectActivityType[] = [
  "distribution",
  "field_visit",
  "procurement",
  "logistics",
  "education",
  "health_support",
  "qurban_distribution",
  "orphan_support",
  "emergency_aid",
  "media_record",
  "reporting",
  "meeting",
  "volunteer_work",
  "other"
];

const activityStatuses: ProjectActivityStatus[] = ["draft", "planned", "in_progress", "completed", "cancelled", "archived"];
const activityVisibilities: ProjectActivityVisibility[] = ["internal", "public"];
const terminalStatuses: ProjectActivityStatus[] = ["archived"];

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readNullableString(formData: FormData, key: string) {
  const value = readString(formData, key);
  return value.length ? value : null;
}

function readNonNegativeNumber(formData: FormData, key: string) {
  const value = readString(formData, key);
  if (!value) return null;
  const parsed = Number(value.replace(",", "."));
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${key} alanı negatif olmayan bir sayı olmalıdır.`);
  }
  return parsed;
}

function readOptionalUrl(formData: FormData, key: string) {
  const value = readNullableString(formData, key);
  if (!value) return null;
  if (value.startsWith("/")) return value;
  try {
    return new URL(value).toString();
  } catch {
    throw new Error(`${key} alanı geçerli bir URL olmalıdır.`);
  }
}

function readOptionalDateTime(formData: FormData, key: string) {
  const value = readNullableString(formData, key);
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) throw new Error(`${key} alanı geçerli bir tarih/saat olmalıdır.`);
  return date.toISOString();
}

function readEnum<T extends string>(formData: FormData, key: string, allowed: readonly T[], fallback: T) {
  const value = readString(formData, key) || fallback;
  if (!allowed.includes(value as T)) throw new Error(`${key} alanı geçerli değil.`);
  return value as T;
}

function readGalleryUrls(formData: FormData) {
  const raw = readString(formData, "galleryUrls");
  if (!raw) return [];
  return parseCsvOrLines(raw).map((url) => {
    if (url.startsWith("/")) return url;
    try {
      return new URL(url).toString();
    } catch {
      throw new Error("Galeri URL'leri içinde geçersiz bağlantı var.");
    }
  });
}

function formDataKeys(formData: FormData) {
  return Array.from(new Set(Array.from(formData.keys()).map(String))).sort();
}

function logActivityActionStart(
  action: string,
  formData: FormData,
  input: {
    projectId?: string | null;
    activityId?: string | null;
    targetStatus?: string | null;
    adminUserId?: string | null;
    adminRole?: string | null;
    reasonProvided?: boolean;
  } = {}
) {
  console.info("[project-activities:action]", "start", {
    action,
    projectId: input.projectId ?? null,
    activityId: input.activityId ?? null,
    targetStatus: input.targetStatus ?? null,
    adminUserId: input.adminUserId ?? null,
    adminRole: input.adminRole ?? null,
    reasonProvided: input.reasonProvided ?? null,
    formKeys: formDataKeys(formData)
  });
}

function parseActivityInput(formData: FormData): ProjectActivityWriteInput {
  const projectId = readString(formData, "projectId");
  const title = readString(formData, "title");
  const activityType = readEnum(formData, "activityType", activityTypes, "field_visit");
  const status = readEnum(formData, "status", activityStatuses, "draft");
  const visibility = readEnum(formData, "visibility", activityVisibilities, "internal");
  const cancelledReason = readNullableString(formData, "cancelledReason");

  if (!projectId) throw new Error("Proje kimliği zorunludur.");
  if (!title) throw new Error("Faaliyet başlığı zorunludur.");
  if (status === "cancelled" && !cancelledReason) throw new Error("İptal durumundaki faaliyet için iptal gerekçesi zorunludur.");
  if (visibility === "public" && status !== "completed") {
    throw new Error("Public görünürlük için faaliyet durumu Tamamlandı olmalıdır.");
  }

  const explicitSlug = readString(formData, "slug");
  return {
    projectId,
    title,
    slug: explicitSlug ? slugify(explicitSlug) : slugify(title),
    activityType,
    status,
    visibility,
    activityDate: readNullableString(formData, "activityDate"),
    startTime: readOptionalDateTime(formData, "startTime"),
    endTime: readOptionalDateTime(formData, "endTime"),
    country: readNullableString(formData, "country"),
    city: readNullableString(formData, "city"),
    district: readNullableString(formData, "district"),
    locationName: readNullableString(formData, "locationName"),
    regionLabel: readNullableString(formData, "regionLabel"),
    responsiblePerson: readNullableString(formData, "responsiblePerson"),
    teamName: readNullableString(formData, "teamName"),
    beneficiaryCount: readNonNegativeNumber(formData, "beneficiaryCount"),
    familyCount: readNonNegativeNumber(formData, "familyCount"),
    distributedItemType: readNullableString(formData, "distributedItemType"),
    distributedItemCount: readNonNegativeNumber(formData, "distributedItemCount"),
    estimatedCost: readNonNegativeNumber(formData, "estimatedCost"),
    currency: readString(formData, "currency") || "TRY",
    summary: readNullableString(formData, "summary"),
    description: readNullableString(formData, "description"),
    internalNotes: readNullableString(formData, "internalNotes"),
    publicSummary: readNullableString(formData, "publicSummary"),
    coverImageUrl: readOptionalUrl(formData, "coverImageUrl"),
    galleryUrls: readGalleryUrls(formData),
    videoUrl: readOptionalUrl(formData, "videoUrl"),
    reportUrl: readOptionalUrl(formData, "reportUrl"),
    cancelledReason
  };
}

async function revalidateActivityViews(projectId: string, activityId?: string | null) {
  revalidatePath("/admin/projeler");
  revalidatePath("/admin/faaliyet-kayitlari");
  revalidatePath(`/admin/projeler/${projectId}/faaliyetler`);
  revalidatePath(`/admin/projeler/${projectId}/faaliyetler/yeni`);
  if (activityId) {
    revalidatePath(`/admin/projeler/${projectId}/faaliyetler/${activityId}`);
    revalidatePath(`/admin/projeler/${projectId}/faaliyetler/${activityId}/duzenle`);
  }

  const project = await getProjectActivityProjectSummary(projectId);
  if (project?.slug) revalidatePath(`/projeler/${project.slug}`);
}

function redirectToProjectActivities(projectId: string, status: string, message?: string) {
  const params = new URLSearchParams({ durum: status });
  if (message) params.set("mesaj", message);
  redirect(`/admin/projeler/${projectId}/faaliyetler?${params.toString()}`);
}

function redirectToActivity(projectId: string, activityId: string, status: string, message?: string) {
  const params = new URLSearchParams({ durum: status });
  if (message) params.set("mesaj", message);
  redirect(`/admin/projeler/${projectId}/faaliyetler/${activityId}?${params.toString()}`);
}

async function getRequiredSupabaseActivity(activityId: string) {
  const result = await getProjectActivityById(activityId);
  if (result.source !== "supabase") throw new Error("Bu işlem için Supabase kaynaklı gerçek faaliyet kaydı gerekir.");
  if (!result.data) throw new Error("Proje faaliyeti bulunamadı.");
  return result.data;
}

export async function createProjectActivityAction(formData: FormData) {
  const projectId = readString(formData, "projectId");
  try {
    const admin = await requireAdminUser();
    logActivityActionStart("createProjectActivityAction", formData, { projectId, adminUserId: admin.user.id, adminRole: admin.role });
    const input = parseActivityInput(formData);
    const activity = await createProjectActivity(input, { actorId: admin.user.id, actorRole: admin.role });
    await logAdminAction({
      actorId: admin.user.id,
      action: "project_activity.create",
      entityType: "project_activities",
      entityId: activity.id,
      summary: `Proje faaliyeti oluşturuldu: ${activity.title}`,
      metadata: { projectId: activity.projectId, status: activity.status, visibility: activity.visibility }
    });
    await revalidateActivityViews(activity.projectId, activity.id);
    redirectToActivity(activity.projectId, activity.id, "faaliyet-olusturuldu");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (error instanceof AdminAuthorizationError) redirectToProjectActivities(projectId || "unknown", "yetkisiz", error.message);
    redirectToProjectActivities(projectId || "unknown", "hata", userFriendlyActionError(error));
  }
}

export async function updateProjectActivityAction(formData: FormData) {
  const projectId = readString(formData, "projectId");
  const activityId = readString(formData, "activityId");
  try {
    const admin = await requireAdminUser();
    logActivityActionStart("updateProjectActivityAction", formData, { projectId, activityId, adminUserId: admin.user.id, adminRole: admin.role });
    if (!activityId) throw new Error("Faaliyet kimliği zorunludur.");
    const existing = await getRequiredSupabaseActivity(activityId);
    if (terminalStatuses.includes(existing.status) || existing.status === "cancelled") {
      throw new Error("İptal edilmiş veya arşivlenmiş faaliyet düzenlenemez.");
    }
    const activity = await updateProjectActivity(activityId, parseActivityInput(formData), { actorId: admin.user.id, actorRole: admin.role });
    await logAdminAction({
      actorId: admin.user.id,
      action: "project_activity.update",
      entityType: "project_activities",
      entityId: activity.id,
      summary: `Proje faaliyeti güncellendi: ${activity.title}`,
      metadata: { projectId: activity.projectId, status: activity.status, visibility: activity.visibility }
    });
    await revalidateActivityViews(activity.projectId, activity.id);
    redirectToActivity(activity.projectId, activity.id, "faaliyet-guncellendi");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (error instanceof AdminAuthorizationError) redirectToProjectActivities(projectId || "unknown", "yetkisiz", error.message);
    redirectToActivity(projectId || "unknown", activityId || "unknown", "hata", userFriendlyActionError(error));
  }
}

export async function markProjectActivityCompletedAction(formData: FormData) {
  const projectId = readString(formData, "projectId");
  const activityId = readString(formData, "activityId");
  try {
    const admin = await requireAdminUser();
    logActivityActionStart("markProjectActivityCompletedAction", formData, { projectId, activityId, targetStatus: "completed", adminUserId: admin.user.id, adminRole: admin.role });
    if (!activityId) throw new Error("Faaliyet kimliği zorunludur.");
    const existing = await getRequiredSupabaseActivity(activityId);
    if (existing.status === "archived" || existing.status === "cancelled") throw new Error("İptal edilmiş veya arşivlenmiş faaliyet tamamlandı yapılamaz.");
    const activity = await updateProjectActivityStatus({
      id: activityId,
      status: "completed",
      oldStatus: existing.status,
      admin: { actorId: admin.user.id, actorRole: admin.role },
      eventType: "project_activity.complete",
      note: "Faaliyet tamamlandı olarak işaretlendi."
    });
    await logAdminAction({
      actorId: admin.user.id,
      action: "project_activity.complete",
      entityType: "project_activities",
      entityId: activity.id,
      summary: `Proje faaliyeti tamamlandı: ${activity.title}`,
      metadata: { projectId: activity.projectId }
    });
    await revalidateActivityViews(activity.projectId, activity.id);
    redirectToActivity(activity.projectId, activity.id, "durum-guncellendi");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (error instanceof AdminAuthorizationError) redirectToProjectActivities(projectId || "unknown", "yetkisiz", error.message);
    redirectToActivity(projectId || "unknown", activityId || "unknown", "hata", userFriendlyActionError(error));
  }
}

export async function cancelProjectActivityAction(formData: FormData) {
  const projectId = readString(formData, "projectId");
  const activityId = readString(formData, "activityId");
  const reason = readString(formData, "reason");
  try {
    const admin = await requireAdminUser();
    logActivityActionStart("cancelProjectActivityAction", formData, {
      projectId,
      activityId,
      targetStatus: "cancelled",
      reasonProvided: Boolean(reason),
      adminUserId: admin.user.id,
      adminRole: admin.role
    });
    if (!activityId) throw new Error("Faaliyet kimliği zorunludur.");
    if (!reason || reason.length < 5) throw new Error("İptal gerekçesi zorunludur.");
    const existing = await getRequiredSupabaseActivity(activityId);
    if (existing.status === "archived" || existing.status === "cancelled") throw new Error("İptal edilmiş veya arşivlenmiş faaliyet tekrar iptal edilemez.");
    const activity = await updateProjectActivityStatus({
      id: activityId,
      status: "cancelled",
      oldStatus: existing.status,
      admin: { actorId: admin.user.id, actorRole: admin.role },
      eventType: "project_activity.cancel",
      note: reason,
      extra: {
        cancelled_at: new Date().toISOString(),
        cancelled_reason: reason
      }
    });
    await logAdminAction({
      actorId: admin.user.id,
      action: "project_activity.cancel",
      entityType: "project_activities",
      entityId: activity.id,
      summary: `Proje faaliyeti iptal edildi: ${activity.title}`,
      metadata: { projectId: activity.projectId, reason }
    });
    await revalidateActivityViews(activity.projectId, activity.id);
    redirectToActivity(activity.projectId, activity.id, "iptal-edildi");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (error instanceof AdminAuthorizationError) redirectToProjectActivities(projectId || "unknown", "yetkisiz", error.message);
    redirectToActivity(projectId || "unknown", activityId || "unknown", "hata", userFriendlyActionError(error));
  }
}

export async function archiveProjectActivityAction(formData: FormData) {
  const projectId = readString(formData, "projectId");
  const activityId = readString(formData, "activityId");
  try {
    const admin = await requireAdminUser();
    logActivityActionStart("archiveProjectActivityAction", formData, { projectId, activityId, targetStatus: "archived", adminUserId: admin.user.id, adminRole: admin.role });
    if (!activityId) throw new Error("Faaliyet kimliği zorunludur.");
    const existing = await getRequiredSupabaseActivity(activityId);
    if (existing.status === "archived") throw new Error("Faaliyet zaten arşivlenmiş.");
    const activity = await updateProjectActivityStatus({
      id: activityId,
      status: "archived",
      oldStatus: existing.status,
      admin: { actorId: admin.user.id, actorRole: admin.role },
      eventType: "project_activity.archive",
      note: "Faaliyet arşivlendi."
    });
    await logAdminAction({
      actorId: admin.user.id,
      action: "project_activity.archive",
      entityType: "project_activities",
      entityId: activity.id,
      summary: `Proje faaliyeti arşivlendi: ${activity.title}`,
      metadata: { projectId: activity.projectId }
    });
    await revalidateActivityViews(activity.projectId, activity.id);
    redirectToActivity(activity.projectId, activity.id, "arsivlendi");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (error instanceof AdminAuthorizationError) redirectToProjectActivities(projectId || "unknown", "yetkisiz", error.message);
    redirectToActivity(projectId || "unknown", activityId || "unknown", "hata", userFriendlyActionError(error));
  }
}

export async function toggleProjectActivityVisibilityAction(formData: FormData) {
  const projectId = readString(formData, "projectId");
  const activityId = readString(formData, "activityId");
  try {
    const admin = await requireAdminUser();
    logActivityActionStart("toggleProjectActivityVisibilityAction", formData, { projectId, activityId, adminUserId: admin.user.id, adminRole: admin.role });
    if (!activityId) throw new Error("Faaliyet kimliği zorunludur.");
    const existing = await getRequiredSupabaseActivity(activityId);
    if (existing.status === "archived" || existing.status === "cancelled") throw new Error("İptal edilmiş veya arşivlenmiş faaliyetin görünürlüğü değiştirilemez.");
    const nextVisibility: ProjectActivityVisibility = existing.visibility === "public" ? "internal" : "public";
    if (nextVisibility === "public" && existing.status !== "completed") {
      throw new Error("Public görünürlük için faaliyet önce Tamamlandı olmalıdır.");
    }
    const activity = await updateProjectActivityVisibility({
      id: activityId,
      visibility: nextVisibility,
      admin: { actorId: admin.user.id, actorRole: admin.role },
      note: nextVisibility === "public" ? "Faaliyet public görünür yapıldı." : "Faaliyet iç kayda alındı."
    });
    await logAdminAction({
      actorId: admin.user.id,
      action: "project_activity.visibility",
      entityType: "project_activities",
      entityId: activity.id,
      summary: `Proje faaliyeti görünürlüğü güncellendi: ${activity.title}`,
      metadata: { projectId: activity.projectId, visibility: activity.visibility }
    });
    await revalidateActivityViews(activity.projectId, activity.id);
    redirectToActivity(activity.projectId, activity.id, "gorunurluk-guncellendi");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (error instanceof AdminAuthorizationError) redirectToProjectActivities(projectId || "unknown", "yetkisiz", error.message);
    redirectToActivity(projectId || "unknown", activityId || "unknown", "hata", userFriendlyActionError(error));
  }
}
