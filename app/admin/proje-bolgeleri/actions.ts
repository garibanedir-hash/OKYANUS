"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AdminAuthorizationError, canManageContent, requireAdminUser } from "@/lib/auth/requireAdmin";
import {
  getOptionalString,
  getSlugValue,
  getString,
  normalizeOptionalUrl,
  parseCsvOrLines,
  parseNumberField,
  userFriendlyActionError
} from "@/lib/admin/contentValidation";
import { logAdminAction } from "@/lib/audit/auditLogger";
import {
  createProjectRegion,
  deactivateProjectRegion,
  setProjectRegionVisibility,
  updateProjectRegion,
  type ProjectRegionWriteInput
} from "@/lib/data/projectRegionWriteRepository";

function redirectWithStatus(path: string, durum: string, mesaj?: string) {
  const params = new URLSearchParams({ durum });
  if (mesaj) params.set("mesaj", mesaj);
  redirect(`${path}?${params.toString()}`);
}

async function requireContentAdmin() {
  const context = await requireAdminUser();
  if (!canManageContent(context)) {
    throw new AdminAuthorizationError("Bu içerik işlemi için admin yetkisi gerekiyor.", "forbidden");
  }

  return context;
}

function parseOptionalNumber(formData: FormData, name: string) {
  const raw = getOptionalString(formData, name);
  if (!raw) return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) throw new Error(`${name} alanı sayısal olmalıdır.`);
  return parsed;
}

function parseRecentUpdatesText(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, dateLabel, ...summaryParts] = line.split("|").map((item) => item.trim());
      const summary = summaryParts.join(" | ");
      if (!title || !summary) return null;
      return {
        title,
        dateLabel: dateLabel || "Saha güncellemesi",
        summary
      };
    })
    .filter((item): item is { title: string; dateLabel: string; summary: string } => Boolean(item));
}

function parseProjectRegionForm(formData: FormData): ProjectRegionWriteInput {
  const name = getString(formData, "name");
  const slug = getSlugValue(formData, name);
  if (!name) throw new Error("Bölge adı zorunludur.");
  if (!slug) throw new Error("Slug alanı zorunludur.");

  const coverImageUrl = normalizeOptionalUrl(getOptionalString(formData, "coverImageUrl"));

  return {
    name,
    slug,
    country: getOptionalString(formData, "country"),
    regionLabel: getOptionalString(formData, "regionLabel"),
    tagline: getOptionalString(formData, "tagline"),
    description: getOptionalString(formData, "description"),
    shortDescription: getOptionalString(formData, "shortDescription"),
    coordsLng: parseOptionalNumber(formData, "coordsLng"),
    coordsLat: parseOptionalNumber(formData, "coordsLat"),
    priorityLabel: getOptionalString(formData, "priorityLabel"),
    operatingModel: getOptionalString(formData, "operatingModel"),
    beneficiaryEstimate: getOptionalString(formData, "beneficiaryEstimate"),
    activeProjectCount: parseOptionalNumber(formData, "activeProjectCount"),
    focusAreas: parseCsvOrLines(getString(formData, "focusAreasText")),
    categories: parseCsvOrLines(getString(formData, "categoriesText")),
    coverImageUrl,
    sortOrder: parseNumberField(formData, "sortOrder", 0),
    isActive: formData.get("isActive") === "on",
    visibility: getString(formData, "visibility") === "internal" ? "internal" : "public",
    relatedProjectSlugs: parseCsvOrLines(getString(formData, "relatedProjectSlugsText")),
    recentUpdates: parseRecentUpdatesText(getString(formData, "recentUpdatesText"))
  };
}

function revalidateProjectRegionPaths() {
  revalidatePath("/");
  revalidatePath("/projeler");
  revalidatePath("/admin/proje-bolgeleri");
  revalidatePath("/admin/projeler");
}

export async function createProjectRegionAction(formData: FormData) {
  let successPath: string | null = null;
  try {
    const context = await requireContentAdmin();
    const payload = parseProjectRegionForm(formData);
    const region = await createProjectRegion(payload, { actorId: context.user.id, actorRole: context.role });

    await logAdminAction({
      actorId: context.user.id,
      action: "project_region.create",
      entityType: "project_regions",
      entityId: region.id,
      summary: `Proje bölgesi oluşturuldu: ${payload.name}`,
      metadata: { slug: payload.slug, visibility: payload.visibility }
    });

    revalidateProjectRegionPaths();
    successPath = "/admin/proje-bolgeleri?durum=bolge-olusturuldu";
  } catch (error) {
    if (error instanceof AdminAuthorizationError) {
      redirectWithStatus("/admin/proje-bolgeleri/yeni", "yetkisiz", error.message);
    }

    redirectWithStatus("/admin/proje-bolgeleri/yeni", "hata", userFriendlyActionError(error));
  }

  if (successPath) redirect(successPath);
}

export async function updateProjectRegionAction(formData: FormData) {
  const id = getString(formData, "id");
  const errorPath = id ? `/admin/proje-bolgeleri/${id}/duzenle` : "/admin/proje-bolgeleri";
  let successPath: string | null = null;

  try {
    if (!id) throw new Error("Proje bölgesi kaydı bulunamadı.");
    const context = await requireContentAdmin();
    const payload = parseProjectRegionForm(formData);
    const region = await updateProjectRegion(id, payload, { actorId: context.user.id, actorRole: context.role });

    await logAdminAction({
      actorId: context.user.id,
      action: "project_region.update",
      entityType: "project_regions",
      entityId: id,
      summary: `Proje bölgesi güncellendi: ${payload.name}`,
      metadata: { slug: region.slug, visibility: region.visibility, isActive: region.is_active }
    });

    revalidateProjectRegionPaths();
    successPath = "/admin/proje-bolgeleri?durum=bolge-guncellendi";
  } catch (error) {
    if (error instanceof AdminAuthorizationError) {
      redirectWithStatus(errorPath, "yetkisiz", error.message);
    }

    redirectWithStatus(errorPath, "hata", userFriendlyActionError(error));
  }

  if (successPath) redirect(successPath);
}

export async function deactivateProjectRegionAction(formData: FormData) {
  const id = getString(formData, "id");
  let successPath: string | null = null;

  try {
    if (!id) throw new Error("Proje bölgesi kaydı bulunamadı.");
    const context = await requireContentAdmin();
    const region = await deactivateProjectRegion(id, { actorId: context.user.id, actorRole: context.role });

    await logAdminAction({
      actorId: context.user.id,
      action: "project_region.deactivate",
      entityType: "project_regions",
      entityId: id,
      summary: `Proje bölgesi pasife alındı: ${region.name}`,
      metadata: { slug: region.slug }
    });

    revalidateProjectRegionPaths();
    successPath = "/admin/proje-bolgeleri?durum=bolge-pasif";
  } catch (error) {
    if (error instanceof AdminAuthorizationError) {
      redirectWithStatus("/admin/proje-bolgeleri", "yetkisiz", error.message);
    }

    redirectWithStatus("/admin/proje-bolgeleri", "hata", userFriendlyActionError(error));
  }

  if (successPath) redirect(successPath);
}

export async function setProjectRegionVisibilityAction(formData: FormData) {
  const id = getString(formData, "id");
  const visibility = getString(formData, "visibility") === "internal" ? "internal" : "public";
  let successPath: string | null = null;

  try {
    if (!id) throw new Error("Proje bölgesi kaydı bulunamadı.");
    const context = await requireContentAdmin();
    const region = await setProjectRegionVisibility(id, visibility, { actorId: context.user.id, actorRole: context.role });

    await logAdminAction({
      actorId: context.user.id,
      action: "project_region.visibility",
      entityType: "project_regions",
      entityId: id,
      summary: `Proje bölgesi görünürlüğü güncellendi: ${region.name}`,
      metadata: { slug: region.slug, visibility }
    });

    revalidateProjectRegionPaths();
    successPath = "/admin/proje-bolgeleri?durum=bolge-gorunurluk";
  } catch (error) {
    if (error instanceof AdminAuthorizationError) {
      redirectWithStatus("/admin/proje-bolgeleri", "yetkisiz", error.message);
    }

    redirectWithStatus("/admin/proje-bolgeleri", "hata", userFriendlyActionError(error));
  }

  if (successPath) redirect(successPath);
}
