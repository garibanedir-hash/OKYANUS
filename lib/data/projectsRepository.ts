import type { Project } from "@/data/projects";
import { projects as fallbackProjects } from "@/data/projects";
import {
  createReadOnlyAbortSignal,
  createSupabaseReadOnlyClient,
  logReadOnlyFallback,
  type RepositoryResult
} from "@/lib/data/readOnlySupabase";

export type SupabaseProjectRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  status: "planning" | "active" | "completed" | "paused" | "archived";
  location: string | null;
  goal_amount: number | string | null;
  raised_amount: number | string | null;
  start_date: string | null;
  end_date?: string | null;
  transparency_note: string | null;
  featured: boolean | null;
  metrics?: unknown;
  impact_items?: string[] | null;
  scope_items?: string[] | null;
  cta?: { label?: unknown; href?: unknown } | null;
  created_at: string;
  updated_at: string;
};

const publicProjectColumns = [
  "id",
  "slug",
  "title",
  "summary",
  "description",
  "category",
  "status",
  "location",
  "goal_amount",
  "raised_amount",
  "start_date",
  "end_date",
  "transparency_note",
  "featured",
  "metrics",
  "impact_items",
  "scope_items",
  "cta",
  "created_at",
  "updated_at"
].join(", ");

const projectVisualTones: Record<string, string> = {
  "Eğitim": "from-soft-blue via-warm-white to-mint-green",
  "Gıda": "from-mint-green via-soft-blue to-warm-white",
  "Sağlık": "from-mint-green via-soft-blue to-warm-white",
  "Acil Yardım": "from-soft-blue via-warm-white to-soft-gray",
  "Yetim": "from-soft-blue via-warm-white to-mint-green"
};

function parseAmount(value: number | string | null | undefined) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Tarih güncellenecek";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

function formatMetricAmount(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: 0
  }).format(value);
}

function isMetric(value: unknown): value is { label: string; value: string } {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as { label?: unknown }).label === "string" &&
    typeof (value as { value?: unknown }).value === "string"
  );
}

function normalizeMetrics(metrics: unknown, goal: number, raised: number, status: Project["status"]) {
  if (Array.isArray(metrics) && metrics.every(isMetric) && metrics.length) {
    return metrics;
  }

  return [
    { label: "Hedef destek", value: formatMetricAmount(goal) },
    { label: "Ulaşılan destek", value: formatMetricAmount(raised) },
    { label: "Durum", value: status }
  ];
}

function normalizeStringList(value: string[] | null | undefined, fallback: string[]) {
  return Array.isArray(value) && value.length ? value.filter(Boolean) : fallback;
}

function normalizeCta(value: SupabaseProjectRow["cta"], slug: string) {
  const label = typeof value?.label === "string" && value.label.trim() ? value.label.trim() : "Projeye Destek Ol";
  const href = typeof value?.href === "string" && value.href.trim() ? value.href.trim() : `/bagis-yap?proje=${slug}`;

  return { label, href };
}

function mapProjectStatus(status: SupabaseProjectRow["status"]): Project["status"] {
  switch (status) {
    case "active":
      return "Devam Ediyor";
    case "completed":
      return "Tamamlandı";
    case "planning":
    case "paused":
    case "archived":
    default:
      return "Planlanıyor";
  }
}

export function mapSupabaseProjectToProject(row: SupabaseProjectRow): Project {
  const goal = parseAmount(row.goal_amount);
  const raised = parseAmount(row.raised_amount);
  const status = mapProjectStatus(row.status);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category as Project["category"],
    summary: row.summary,
    description: row.summary || row.description,
    detail: row.description,
    goal,
    raised,
    status,
    location: row.location ?? "Lokasyon güncellenecek",
    startDate: formatDate(row.start_date),
    updatedAt: formatDate(row.updated_at),
    visualTone: projectVisualTones[row.category] ?? "from-soft-blue via-warm-white to-mint-green",
    tags: [row.category].filter(Boolean),
    metrics: normalizeMetrics(row.metrics, goal, raised, status),
    impactItems: normalizeStringList(row.impact_items, ["Proje bazlı destek", "Kayıtlı takip", "Şeffaf bilgilendirme"]),
    scopeItems: normalizeStringList(row.scope_items, ["İhtiyaç tespiti", "Destek planlama", "Saha koordinasyonu", "Dönemsel raporlama"]),
    transparencyNote:
      row.transparency_note ??
      "Bu proje için şeffaflık notu Supabase içerik modelinden güncellenecektir.",
    cta: normalizeCta(row.cta, row.slug)
  };
}

async function fetchPublishedProjects() {
  const supabase = createSupabaseReadOnlyClient();
  if (!supabase) return null;

  const timeout = createReadOnlyAbortSignal();
  try {
    const { data, error } = await supabase
      .from("projects")
      .select(publicProjectColumns)
      .in("status", ["active", "completed"])
      .order("featured", { ascending: false })
      .order("updated_at", { ascending: false })
      .abortSignal(timeout.signal);

    if (error) {
      logReadOnlyFallback("projects", error);
      return null;
    }

    return (data ?? []).map((row) => mapSupabaseProjectToProject(row as unknown as SupabaseProjectRow));
  } catch {
    logReadOnlyFallback("projects");
    return null;
  } finally {
    timeout.clear();
  }
}

async function fetchPublishedProjectBySlug(slug: string) {
  const supabase = createSupabaseReadOnlyClient();
  if (!supabase) return null;

  const timeout = createReadOnlyAbortSignal();
  try {
    const { data, error } = await supabase
      .from("projects")
      .select(publicProjectColumns)
      .eq("slug", slug)
      .in("status", ["active", "completed"])
      .abortSignal(timeout.signal)
      .maybeSingle();

    if (error) {
      logReadOnlyFallback("project-detail", error);
      return null;
    }

    return data ? mapSupabaseProjectToProject(data as unknown as SupabaseProjectRow) : null;
  } catch {
    logReadOnlyFallback("project-detail");
    return null;
  } finally {
    timeout.clear();
  }
}

export async function getProjectsWithSource(): Promise<RepositoryResult<Project[]>> {
  const supabaseProjects = await fetchPublishedProjects();

  if (supabaseProjects) {
    return { data: supabaseProjects, source: "supabase" };
  }

  return { data: fallbackProjects, source: "demo" };
}

export async function getProjects() {
  const result = await getProjectsWithSource();
  return result.data;
}

export async function getProjectBySlugWithSource(slug: string): Promise<RepositoryResult<Project | undefined>> {
  const supabaseProject = await fetchPublishedProjectBySlug(slug);

  if (supabaseProject) {
    return { data: supabaseProject, source: "supabase" };
  }

  return {
    data: fallbackProjects.find((project) => project.slug === slug),
    source: "demo"
  };
}

export async function getProjectBySlug(slug: string) {
  const result = await getProjectBySlugWithSource(slug);
  return result.data;
}

export async function getFeaturedProjectsWithSource(limit = 4): Promise<RepositoryResult<Project[]>> {
  const result = await getProjectsWithSource();
  const featured = result.data.filter((project) => project.status !== "Planlanıyor").slice(0, limit);

  return {
    data: featured.length ? featured : result.data.slice(0, limit),
    source: result.source
  };
}

export async function getFeaturedProjects(limit = 4) {
  const result = await getFeaturedProjectsWithSource(limit);
  return result.data;
}

export async function getPublishedProjectCount(): Promise<RepositoryResult<number>> {
  const supabase = createSupabaseReadOnlyClient();
  if (!supabase) return { data: fallbackProjects.length, source: "demo" };

  const timeout = createReadOnlyAbortSignal();
  try {
    const { count, error } = await supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .in("status", ["active", "completed"])
      .abortSignal(timeout.signal);

    if (error) {
      logReadOnlyFallback("projects-count", error);
      return { data: fallbackProjects.length, source: "demo" };
    }

    return { data: count ?? 0, source: "supabase" };
  } catch {
    logReadOnlyFallback("projects-count");
    return { data: fallbackProjects.length, source: "demo" };
  } finally {
    timeout.clear();
  }
}
