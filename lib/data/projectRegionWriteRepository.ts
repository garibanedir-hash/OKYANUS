import "server-only";

import { asAdminWriteClient } from "@/lib/data/adminWriteClient";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ProjectRegionRow } from "@/lib/data/projectRegionRepository";

export type ProjectRegionWriteInput = {
  slug: string;
  name: string;
  country?: string | null;
  regionLabel?: string | null;
  tagline?: string | null;
  description?: string | null;
  shortDescription?: string | null;
  coordsLng?: number | null;
  coordsLat?: number | null;
  priorityLabel?: string | null;
  operatingModel?: string | null;
  beneficiaryEstimate?: string | null;
  activeProjectCount?: number | null;
  focusAreas: string[];
  categories: string[];
  coverImageUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
  visibility: "public" | "internal";
  relatedProjectSlugs: string[];
  recentUpdates: Array<{ title: string; dateLabel: string; summary: string }>;
};

export type ProjectRegionAdminContext = {
  actorId: string;
  actorRole: string;
};

type ProjectRegionMutationResult = Pick<ProjectRegionRow, "id" | "slug" | "name" | "visibility" | "is_active">;

function getDb() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    throw new Error("Supabase admin bağlantısı hazırlanamadı. Project regions migration/env kontrol edilmeli.");
  }

  return asAdminWriteClient(supabase);
}

function logProjectRegionWriteIssue(event: string, payload: Record<string, unknown>) {
  console.error(`[project_region_write:${event}]`, payload);
}

function assertCoordinate(value: number | null | undefined, min: number, max: number, label: string) {
  if (value === null || value === undefined) return;
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error(`${label} harita bilgisi geçerli aralıkta olmalıdır.`);
  }
}

function assertSafeSlug(slug: string) {
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error("Slug sadece küçük harf, rakam ve tire içermelidir.");
  }
}

export function validateProjectRegionInput(input: ProjectRegionWriteInput) {
  if (!input.name.trim()) throw new Error("Bölge adı zorunludur.");
  if (!input.slug.trim()) throw new Error("Bölge slug alanı zorunludur.");
  if (!input.country?.trim()) throw new Error("Ülke seçimi zorunludur.");
  if (!input.regionLabel?.trim()) throw new Error("Şehir / bölge seçimi zorunludur.");
  assertSafeSlug(input.slug);
  if (input.coordsLng === null || input.coordsLng === undefined || input.coordsLat === null || input.coordsLat === undefined) {
    throw new Error("Seçilen konum için harita bilgisi bulunamadı.");
  }
  assertCoordinate(input.coordsLng, -180, 180, "Boylam");
  assertCoordinate(input.coordsLat, -90, 90, "Enlem");
  if (input.visibility !== "public" && input.visibility !== "internal") {
    throw new Error("Görünürlük public veya internal olmalıdır.");
  }
  if (input.activeProjectCount !== null && input.activeProjectCount !== undefined && input.activeProjectCount < 0) {
    throw new Error("Aktif proje sayısı negatif olamaz.");
  }
}

function toPayload(input: ProjectRegionWriteInput, admin: ProjectRegionAdminContext, mode: "create" | "update") {
  validateProjectRegionInput(input);
  const now = new Date().toISOString();

  return {
    slug: input.slug,
    name: input.name,
    country: input.country,
    region_label: input.regionLabel,
    tagline: input.tagline,
    description: input.description,
    short_description: input.shortDescription,
    coords_lng: input.coordsLng,
    coords_lat: input.coordsLat,
    priority_label: input.priorityLabel,
    operating_model: input.operatingModel,
    beneficiary_estimate: input.beneficiaryEstimate,
    active_project_count: input.activeProjectCount,
    focus_areas: input.focusAreas,
    categories: input.categories,
    cover_image_url: input.coverImageUrl,
    sort_order: input.sortOrder,
    is_active: input.isActive,
    visibility: input.visibility,
    metadata: {
      relatedProjectSlugs: input.relatedProjectSlugs,
      recentUpdates: input.recentUpdates
    },
    updated_by: admin.actorId,
    updated_at: now,
    ...(mode === "create" ? { created_by: admin.actorId, created_at: now } : {})
  };
}

export async function createProjectRegion(input: ProjectRegionWriteInput, admin: ProjectRegionAdminContext) {
  const db = getDb();
  const payload = toPayload(input, admin, "create");
  const { data, error } = await db
    .from<ProjectRegionMutationResult>("project_regions")
    .insert(payload)
    .select("id, slug, name, visibility, is_active")
    .single();

  if (error || !data) {
    logProjectRegionWriteIssue("insert_error", { slug: input.slug, error });
    throw new Error("Proje bölgesi kaydedilemedi. 021 migration ve alanları kontrol edilmeli.");
  }

  return data;
}

export async function updateProjectRegion(id: string, input: ProjectRegionWriteInput, admin: ProjectRegionAdminContext) {
  const db = getDb();
  const payload = toPayload(input, admin, "update");
  const { data, error } = await db
    .from<ProjectRegionMutationResult>("project_regions")
    .update(payload)
    .eq("id", id)
    .select("id, slug, name, visibility, is_active")
    .maybeSingle();

  if (error) {
    logProjectRegionWriteIssue("update_error", { id, slug: input.slug, error });
    throw new Error("Proje bölgesi güncellenemedi.");
  }

  if (!data) {
    logProjectRegionWriteIssue("update_no_row", { id, slug: input.slug });
    throw new Error("Proje bölgesi bulunamadı veya güncellenemedi.");
  }

  return data;
}

export async function deactivateProjectRegion(id: string, admin: ProjectRegionAdminContext) {
  const db = getDb();
  const { data, error } = await db
    .from<ProjectRegionMutationResult>("project_regions")
    .update({
      is_active: false,
      visibility: "internal",
      updated_by: admin.actorId,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .select("id, slug, name, visibility, is_active")
    .maybeSingle();

  if (error) {
    logProjectRegionWriteIssue("deactivate_error", { id, error });
    throw new Error("Proje bölgesi pasife alınamadı.");
  }

  if (!data) {
    logProjectRegionWriteIssue("deactivate_no_row", { id });
    throw new Error("Proje bölgesi bulunamadı veya güncellenemedi.");
  }

  return data;
}

export async function setProjectRegionVisibility(id: string, visibility: "public" | "internal", admin: ProjectRegionAdminContext) {
  const db = getDb();
  const { data, error } = await db
    .from<ProjectRegionMutationResult>("project_regions")
    .update({
      visibility,
      updated_by: admin.actorId,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .select("id, slug, name, visibility, is_active")
    .maybeSingle();

  if (error) {
    logProjectRegionWriteIssue("visibility_error", { id, visibility, error });
    throw new Error("Proje bölgesi görünürlüğü güncellenemedi.");
  }

  if (!data) {
    logProjectRegionWriteIssue("visibility_no_row", { id, visibility });
    throw new Error("Proje bölgesi bulunamadı veya güncellenemedi.");
  }

  return data;
}

export async function updateProjectRegionCoverImage(id: string, coverImageUrl: string, admin: ProjectRegionAdminContext) {
  const db = getDb();
  const { data, error } = await db
    .from<ProjectRegionMutationResult>("project_regions")
    .update({
      cover_image_url: coverImageUrl,
      updated_by: admin.actorId,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .select("id, slug, name, visibility, is_active")
    .maybeSingle();

  if (error) {
    logProjectRegionWriteIssue("cover_image_error", { id, error });
    throw new Error("Bölge görseli yüklendi ancak kayıt güncellenemedi.");
  }

  if (!data) {
    logProjectRegionWriteIssue("cover_image_no_row", { id });
    throw new Error("Proje bölgesi bulunamadı veya görsel bilgisi güncellenemedi.");
  }

  return data;
}
