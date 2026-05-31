import "server-only";

import type { Project } from "@/data/projects";
import {
  getProjectRegionBySlug as getFallbackProjectRegionBySlug,
  inferProjectRegion,
  isProjectRegionCategory,
  projectRegions as fallbackProjectRegions,
  type ProjectRegion,
  type ProjectRegionCategory
} from "@/data/projectRegions";
import { asAdminWriteClient } from "@/lib/data/adminWriteClient";
import {
  createReadOnlyAbortSignal,
  createSupabaseReadOnlyClient,
  logReadOnlyFallback,
  type RepositoryResult
} from "@/lib/data/readOnlySupabase";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type ProjectRegionRow = {
  id: string;
  slug: string;
  name: string;
  country: string | null;
  region_label: string | null;
  tagline: string | null;
  description: string | null;
  short_description: string | null;
  coords_lng: number | string | null;
  coords_lat: number | string | null;
  priority_label: string | null;
  operating_model: string | null;
  beneficiary_estimate: string | null;
  active_project_count: number | null;
  focus_areas: string[] | null;
  categories: string[] | null;
  cover_image_url: string | null;
  sort_order: number | null;
  is_active: boolean | null;
  visibility: "public" | "internal" | string | null;
  metadata: Record<string, unknown> | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type AdminProjectRegion = ProjectRegionRow & {
  linkedProjectCount: number;
};

const projectRegionColumns = [
  "id",
  "slug",
  "name",
  "country",
  "region_label",
  "tagline",
  "description",
  "short_description",
  "coords_lng",
  "coords_lat",
  "priority_label",
  "operating_model",
  "beneficiary_estimate",
  "active_project_count",
  "focus_areas",
  "categories",
  "cover_image_url",
  "sort_order",
  "is_active",
  "visibility",
  "metadata",
  "created_by",
  "updated_by",
  "created_at",
  "updated_at"
].join(", ");

function parseNumber(value: number | string | null | undefined) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function getStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim())) : [];
}

function getRecentUpdates(value: unknown): ProjectRegion["recentUpdates"] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const candidate = item as { title?: unknown; dateLabel?: unknown; summary?: unknown };
      if (typeof candidate.title !== "string" || typeof candidate.summary !== "string") return null;
      return {
        title: candidate.title,
        dateLabel: typeof candidate.dateLabel === "string" ? candidate.dateLabel : "Saha güncellemesi",
        summary: candidate.summary
      };
    })
    .filter((item): item is ProjectRegion["recentUpdates"][number] => Boolean(item));
}

function safeMetadata(row: Pick<ProjectRegionRow, "metadata">) {
  return row.metadata && typeof row.metadata === "object" ? row.metadata : {};
}

function fallbackForSlug(slug: string) {
  return getFallbackProjectRegionBySlug(slug) ?? getFallbackProjectRegionBySlug("turkiye") ?? fallbackProjectRegions[0];
}

export function mapSupabaseProjectRegion(row: ProjectRegionRow): ProjectRegion {
  const fallback = fallbackForSlug(row.slug);
  const metadata = safeMetadata(row);
  const relatedProjectSlugs = getStringArray(metadata.relatedProjectSlugs);
  const recentUpdates = getRecentUpdates(metadata.recentUpdates);
  const categories = getStringArray(row.categories).filter(isProjectRegionCategory) as ProjectRegionCategory[];
  const focusAreas = getStringArray(row.focus_areas);
  const activeProjectCount = row.active_project_count ?? fallback?.activeProjectCount ?? relatedProjectSlugs.length;
  const beneficiaryEstimate = row.beneficiary_estimate ?? fallback?.beneficiaryEstimate ?? "Saha verisi güncellenecek";

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    region: row.region_label ?? fallback?.region ?? "Çalışma bölgesi",
    country: row.country ?? fallback?.country ?? "Bölge",
    iso: fallback?.iso,
    coords: [
      parseNumber(row.coords_lng) ?? fallback?.coords[0] ?? 35,
      parseNumber(row.coords_lat) ?? fallback?.coords[1] ?? 32
    ],
    tagline: row.tagline ?? fallback?.tagline ?? "Bölge bazlı yardım çalışması",
    description: row.description ?? fallback?.description ?? row.short_description ?? "Bu bölge için çalışma bilgileri admin panelinden güncellenebilir.",
    shortDescription: row.short_description ?? fallback?.shortDescription ?? row.description ?? "Bölge bilgileri güncellenebilir.",
    regionLabel: row.region_label ?? fallback?.regionLabel ?? "Çalışma hattı",
    focusAreas: focusAreas.length ? focusAreas : fallback?.focusAreas ?? [],
    priorityLabel: row.priority_label ?? fallback?.priorityLabel ?? "Saha koordinasyonu",
    operatingModel: row.operating_model ?? fallback?.operatingModel ?? "İhtiyaç tespiti, saha koordinasyonu ve düzenli bilgilendirme",
    projectCount: activeProjectCount,
    activeProjectCount,
    beneficiaryEstimate,
    stats: [
      { label: "Ulaşılan kişi", value: beneficiaryEstimate },
      { label: "Aktif proje", value: String(activeProjectCount) },
      { label: "Çalışma alanı", value: String((focusAreas.length ? focusAreas : fallback?.focusAreas ?? []).length) }
    ],
    categories: categories.length ? categories : fallback?.categories ?? [],
    recentUpdates: recentUpdates.length ? recentUpdates : fallback?.recentUpdates ?? [],
    coverTone: fallback?.coverTone ?? "from-[#0F2547] via-[#1F8083] to-[#EEF4F6]",
    relatedProjectSlugs: relatedProjectSlugs.length ? relatedProjectSlugs : fallback?.relatedProjectSlugs ?? []
  };
}

export function getFallbackProjectRegions() {
  return fallbackProjectRegions;
}

export function resolveRegionForProject(project: Project) {
  return getFallbackProjectRegionBySlug(project.regionSlug) ?? inferProjectRegion(project);
}

export async function getPublicProjectRegionsWithSource(): Promise<RepositoryResult<ProjectRegion[]>> {
  const supabase = createSupabaseReadOnlyClient();
  if (!supabase) return { data: getFallbackProjectRegions(), source: "demo" };

  const timeout = createReadOnlyAbortSignal();
  try {
    const { data, error } = await supabase
      .from("project_regions")
      .select(projectRegionColumns)
      .eq("is_active", true)
      .eq("visibility", "public")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true })
      .abortSignal(timeout.signal);

    if (error) {
      logReadOnlyFallback("project_regions", error);
      return { data: getFallbackProjectRegions(), source: "demo" };
    }

    const regions = (data ?? []).map((row) => mapSupabaseProjectRegion(row as unknown as ProjectRegionRow));
    return regions.length ? { data: regions, source: "supabase" } : { data: getFallbackProjectRegions(), source: "demo" };
  } catch {
    logReadOnlyFallback("project_regions");
    return { data: getFallbackProjectRegions(), source: "demo" };
  } finally {
    timeout.clear();
  }
}

export async function getPublicProjectRegions() {
  const result = await getPublicProjectRegionsWithSource();
  return result.data;
}

export async function getProjectRegionBySlug(slug?: string | null) {
  if (!slug) return undefined;
  const regions = await getPublicProjectRegions();
  return regions.find((region) => region.slug === slug) ?? getFallbackProjectRegionBySlug(slug);
}

function getAdminDb() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;
  return asAdminWriteClient(supabase);
}

async function getLinkedProjectCounts(slugs: string[]) {
  const db = getAdminDb();
  if (!db || !slugs.length) return {};

  const { data, error } = await db
    .from<{ region_slug: string | null }>("projects")
    .select("region_slug");

  if (error || !data) return {};

  return data.reduce<Record<string, number>>((acc, row) => {
    if (row.region_slug && slugs.includes(row.region_slug)) {
      acc[row.region_slug] = (acc[row.region_slug] ?? 0) + 1;
    }
    return acc;
  }, {});
}

export async function getAdminProjectRegions(): Promise<RepositoryResult<AdminProjectRegion[]>> {
  const db = getAdminDb();
  if (!db) {
    return {
      source: "demo",
      data: fallbackProjectRegions.map((region, index) => ({
        id: region.id,
        slug: region.slug,
        name: region.name,
        country: region.country,
        region_label: region.regionLabel,
        tagline: region.tagline,
        description: region.description,
        short_description: region.shortDescription,
        coords_lng: region.coords[0],
        coords_lat: region.coords[1],
        priority_label: region.priorityLabel,
        operating_model: region.operatingModel,
        beneficiary_estimate: region.beneficiaryEstimate,
        active_project_count: region.activeProjectCount,
        focus_areas: region.focusAreas,
        categories: region.categories,
        cover_image_url: null,
        sort_order: (index + 1) * 10,
        is_active: true,
        visibility: "public",
        metadata: {
          relatedProjectSlugs: region.relatedProjectSlugs,
          recentUpdates: region.recentUpdates
        },
        created_by: null,
        updated_by: null,
        created_at: null,
        updated_at: null,
        linkedProjectCount: region.relatedProjectSlugs.length
      }))
    };
  }

  const { data, error } = await db
    .from<ProjectRegionRow>("project_regions")
    .select(projectRegionColumns)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error || !data) {
    logReadOnlyFallback("project_regions (admin)", error);
    return { data: [], source: "demo" };
  }

  const counts = await getLinkedProjectCounts(data.map((row) => row.slug));
  return {
    source: "supabase",
    data: data.map((row) => ({
      ...row,
      linkedProjectCount: counts[row.slug] ?? 0
    }))
  };
}

export async function getAdminProjectRegionById(id: string): Promise<RepositoryResult<AdminProjectRegion | null>> {
  const db = getAdminDb();
  if (!db) {
    const region = (await getAdminProjectRegions()).data.find((item) => item.id === id) ?? null;
    return { data: region, source: "demo" };
  }

  const { data, error } = await db
    .from<ProjectRegionRow>("project_regions")
    .select(projectRegionColumns)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    logReadOnlyFallback("project_region_detail", error);
    return { data: null, source: "demo" };
  }

  if (!data) return { data: null, source: "supabase" };
  const counts = await getLinkedProjectCounts([data.slug]);
  return { data: { ...data, linkedProjectCount: counts[data.slug] ?? 0 }, source: "supabase" };
}
