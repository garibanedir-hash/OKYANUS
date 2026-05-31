"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { projects as fallbackProjects } from "@/data/projects";
import { AdminAuthorizationError, canManageContent, requireAdminUser } from "@/lib/auth/requireAdmin";
import {
  assertAllowedStatus,
  getOptionalString,
  getSlugValue,
  getString,
  normalizeOptionalUrl,
  parseCsvOrLines,
  parseDateField,
  parseMetrics,
  parseNumberField,
  toJsonValue,
  userFriendlyActionError
} from "@/lib/admin/contentValidation";
import { logAdminAction } from "@/lib/audit/auditLogger";
import { asAdminWriteClient } from "@/lib/data/adminWriteClient";
import { getAdminProjectRegions } from "@/lib/data/projectRegionRepository";
import type { SupabaseProjectRow } from "@/lib/data/projectsRepository";

const projectStatuses = ["draft", "active", "completed", "archived"] as const;

export type ProjectFormValues = {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  category: string;
  status: string;
  location: string;
  goal: number;
  raised: number;
  startDate: string;
  transparencyNote: string;
  regionSlug: string;
  country: string;
  city: string;
  regionLabel: string;
  coverImageUrl: string;
  thumbnailUrl: string;
  metricsText: string;
  impactItemsText: string;
  scopeItemsText: string;
  ctaLabel: string;
  ctaHref: string;
};

type MutationResult = { id: string; slug?: string };

function redirectWithStatus(path: string, durum: string, mesaj?: string) {
  const params = new URLSearchParams({ durum });
  if (mesaj) params.set("mesaj", mesaj);
  redirect(`${path}?${params.toString()}`);
}

function mapFallbackProject(id: string): ProjectFormValues | null {
  const project = fallbackProjects.find((item) => item.id === id);
  if (!project) return null;

  const status = project.status === "Tamamlandı" ? "completed" : project.status === "Devam Ediyor" ? "active" : "draft";

  return {
    id: project.id,
    title: project.title,
    slug: project.slug,
    summary: project.summary,
    description: project.detail,
    category: project.category,
    status,
    location: project.location,
    goal: project.goal,
    raised: project.raised,
    startDate: "",
    transparencyNote: project.transparencyNote,
    regionSlug: project.regionSlug ?? "",
    country: project.country ?? "",
    city: project.city ?? "",
    regionLabel: project.regionLabel ?? "",
    coverImageUrl: project.coverImageUrl ?? "",
    thumbnailUrl: project.thumbnailUrl ?? "",
    metricsText: project.metrics.map((metric) => `${metric.label}: ${metric.value}`).join("\n"),
    impactItemsText: project.impactItems.join("\n"),
    scopeItemsText: project.scopeItems.join("\n"),
    ctaLabel: project.cta.label,
    ctaHref: project.cta.href
  };
}

function mapSupabaseProject(row: SupabaseProjectRow): ProjectFormValues {
  const metrics = Array.isArray(row.metrics)
    ? row.metrics
        .filter((metric): metric is { label: string; value: string } =>
          Boolean(metric) &&
          typeof metric === "object" &&
          typeof (metric as { label?: unknown }).label === "string" &&
          typeof (metric as { value?: unknown }).value === "string"
        )
        .map((metric) => `${metric.label}: ${metric.value}`)
        .join("\n")
    : "";

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    description: row.description,
    category: row.category,
    status: row.status,
    location: row.location ?? "",
    goal: Number(row.goal_amount ?? 0),
    raised: Number(row.raised_amount ?? 0),
    startDate: row.start_date ?? "",
    transparencyNote: row.transparency_note ?? "",
    regionSlug: row.region_slug ?? "",
    country: row.country ?? "",
    city: row.city ?? "",
    regionLabel: row.region_label ?? "",
    coverImageUrl: row.cover_image_url ?? "",
    thumbnailUrl: row.thumbnail_url ?? "",
    metricsText: metrics,
    impactItemsText: Array.isArray(row.impact_items) ? row.impact_items.join("\n") : "",
    scopeItemsText: Array.isArray(row.scope_items) ? row.scope_items.join("\n") : "",
    ctaLabel: typeof row.cta?.label === "string" ? row.cta.label : "",
    ctaHref: typeof row.cta?.href === "string" ? row.cta.href : ""
  };
}

function parseProjectForm(formData: FormData) {
  const title = getString(formData, "title");
  const slug = getSlugValue(formData, title);
  const summary = getString(formData, "summary");
  const description = getString(formData, "description");
  const status = assertAllowedStatus(getString(formData, "status") || "draft", projectStatuses);
  const ctaHref = normalizeOptionalUrl(getOptionalString(formData, "ctaHref"));
  const coverImageUrl = normalizeOptionalUrl(getOptionalString(formData, "coverImageUrl"));
  const thumbnailUrl = normalizeOptionalUrl(getOptionalString(formData, "thumbnailUrl"));

  if (!title) throw new Error("Proje başlığı zorunludur.");
  if (!slug) throw new Error("Proje slug alanı zorunludur.");
  if (!summary) throw new Error("Proje özeti zorunludur.");
  if (!description) throw new Error("Proje açıklaması zorunludur.");

  const metrics = parseMetrics(getString(formData, "metricsText"));
  const impactItems = parseCsvOrLines(getString(formData, "impactItemsText"));
  const scopeItems = parseCsvOrLines(getString(formData, "scopeItemsText"));
  const ctaLabel = getOptionalString(formData, "ctaLabel") ?? "Projeye Destek Ol";

  return {
    title,
    slug,
    summary,
    description,
    category: getString(formData, "category") || "Genel",
    status,
    location: getOptionalString(formData, "location"),
    region_slug: getOptionalString(formData, "regionSlug"),
    country: getOptionalString(formData, "country"),
    city: getOptionalString(formData, "city"),
    region_label: getOptionalString(formData, "regionLabel"),
    cover_image_url: coverImageUrl,
    thumbnail_url: thumbnailUrl,
    goal_amount: parseNumberField(formData, "goal", 0),
    raised_amount: parseNumberField(formData, "raised", 0),
    start_date: parseDateField(formData, "startDate"),
    transparency_note: getOptionalString(formData, "transparencyNote"),
    metrics: toJsonValue(metrics),
    impact_items: impactItems,
    scope_items: scopeItems,
    cta: toJsonValue({ label: ctaLabel, href: ctaHref ?? `/bagis-yap?proje=${slug}` })
  };
}

async function applyRegionDefaults<T extends { region_slug?: string | null; country?: string | null; region_label?: string | null }>(payload: T): Promise<T> {
  if (!payload.region_slug) return payload;

  const regions = await getAdminProjectRegions();
  const region = regions.data.find((item) => item.slug === payload.region_slug);
  if (!region) return payload;

  return {
    ...payload,
    country: payload.country || region.country || null,
    region_label: payload.region_label || region.region_label || null
  };
}

async function requireContentAdmin() {
  const context = await requireAdminUser();
  if (!canManageContent(context)) {
    throw new AdminAuthorizationError("Bu içerik işlemi için admin yetkisi gerekiyor.", "forbidden");
  }

  return context;
}

export async function getProjectForEdit(id: string): Promise<ProjectFormValues | null> {
  try {
    const context = await requireContentAdmin();
    const db = asAdminWriteClient(context.supabase);
    const { data, error } = await db
      .from<SupabaseProjectRow>("projects")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!error && data) {
      return mapSupabaseProject(data as unknown as SupabaseProjectRow);
    }
  } catch {
    return mapFallbackProject(id);
  }

  return mapFallbackProject(id);
}

export async function createProjectAction(formData: FormData) {
  let successPath: string | null = null;
  try {
    const context = await requireContentAdmin();
    const payload = await applyRegionDefaults(parseProjectForm(formData));
    const db = asAdminWriteClient(context.supabase);
    const { data, error } = await db
      .from<MutationResult>("projects")
      .insert(payload)
      .select("id, slug")
      .single();

    if (error || !data) {
      throw new Error("Proje kaydedilemedi. Lütfen alanları kontrol edin.");
    }

    await logAdminAction({
      actorId: context.user.id,
      action: "project.create",
      entityType: "projects",
      entityId: data.id,
      summary: `Proje oluşturuldu: ${payload.title}`,
      metadata: { slug: payload.slug, status: payload.status, regionSlug: payload.region_slug }
    });

    revalidatePath("/");
    revalidatePath("/projeler");
    revalidatePath("/admin/projeler");
    successPath = "/admin/projeler?durum=proje-olusturuldu";
  } catch (error) {
    if (error instanceof AdminAuthorizationError) {
      redirectWithStatus("/admin/projeler/yeni", "yetkisiz", error.message);
    }

    redirectWithStatus("/admin/projeler/yeni", "hata", userFriendlyActionError(error));
  }

  if (successPath) redirect(successPath);
}

export async function updateProjectAction(formData: FormData) {
  const id = getString(formData, "id");
  const errorPath = id ? `/admin/projeler/${id}/duzenle` : "/admin/projeler";
  let successPath: string | null = null;

  try {
    if (!id) throw new Error("Proje kaydı bulunamadı.");

    const context = await requireContentAdmin();
    const payload = await applyRegionDefaults(parseProjectForm(formData));
    const db = asAdminWriteClient(context.supabase);
    const { data, error } = await db
      .from<MutationResult>("projects")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id, slug")
      .single();

    if (error || !data) {
      throw new Error("Proje güncellenemedi. Lütfen tekrar deneyin.");
    }

    await logAdminAction({
      actorId: context.user.id,
      action: "project.update",
      entityType: "projects",
      entityId: id,
      summary: `Proje güncellendi: ${payload.title}`,
      metadata: { slug: payload.slug, status: payload.status, regionSlug: payload.region_slug }
    });

    revalidatePath("/");
    revalidatePath("/projeler");
    revalidatePath(`/projeler/${payload.slug}`);
    revalidatePath("/admin/projeler");
    successPath = "/admin/projeler?durum=proje-guncellendi";
  } catch (error) {
    if (error instanceof AdminAuthorizationError) {
      redirectWithStatus(errorPath, "yetkisiz", error.message);
    }

    redirectWithStatus(errorPath, "hata", userFriendlyActionError(error));
  }

  if (successPath) redirect(successPath);
}

export async function archiveProjectAction(formData: FormData) {
  const id = getString(formData, "id");
  let successPath: string | null = null;
  try {
    if (!id) throw new Error("Proje kaydı bulunamadı.");

    const context = await requireContentAdmin();
    const db = asAdminWriteClient(context.supabase);
    const { error } = await db
      .from<MutationResult>("projects")
      .update({ status: "archived", updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id")
      .single();

    if (error) {
      throw new Error("Proje arşivlenemedi.");
    }

    await logAdminAction({
      actorId: context.user.id,
      action: "project.archive",
      entityType: "projects",
      entityId: id,
      summary: "Proje arşivlendi"
    });

    revalidatePath("/");
    revalidatePath("/projeler");
    revalidatePath("/admin/projeler");
    successPath = "/admin/projeler?durum=proje-arsivlendi";
  } catch (error) {
    if (error instanceof AdminAuthorizationError) {
      redirectWithStatus("/admin/projeler", "yetkisiz", error.message);
    }

    redirectWithStatus("/admin/projeler", "hata", userFriendlyActionError(error));
  }

  if (successPath) redirect(successPath);
}
