import type { Report } from "@/data/reports";
import {
  createReadOnlyAbortSignal,
  createSupabaseReadOnlyClient,
  logReadOnlyFallback,
  type RepositoryResult
} from "@/lib/data/readOnlySupabase";

export type SupabaseReportRow = {
  id: string;
  slug: string;
  title: string;
  period: string;
  category: string;
  summary: string;
  status: "draft" | "published" | "archived";
  pdf_asset_id: string | null;
  file_url?: string | null;
  metrics: unknown;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

const publicReportColumns = [
  "id",
  "slug",
  "title",
  "period",
  "category",
  "summary",
  "status",
  "pdf_asset_id",
  "file_url",
  "metrics",
  "published_at",
  "created_at",
  "updated_at"
].join(", ");

const publicQaBlockedTextPattern = /\b(demo|placeholder|lorem|todo|staging|production|test)\b|payment\s+intent|paytr\s+test|taslak/i;

function isMetric(value: unknown): value is { label: string; value: string } {
  return (
    value !== null &&
    typeof value === "object" &&
    "label" in value &&
    "value" in value &&
    typeof (value as { label?: unknown }).label === "string" &&
    typeof (value as { value?: unknown }).value === "string"
  );
}

function normalizeMetrics(metrics: unknown): Report["metrics"] {
  if (!Array.isArray(metrics)) {
    return [];
  }

  return metrics.filter(isMetric);
}

function safePublicReportText(value: string | null | undefined, fallback: string) {
  const text = value?.trim();
  if (!text || publicQaBlockedTextPattern.test(text)) return fallback;
  return text;
}

export function mapSupabaseReportToReport(row: SupabaseReportRow): Report {
  const metrics = normalizeMetrics(row.metrics);

  return {
    id: row.id,
    slug: row.slug,
    title: safePublicReportText(row.title, "Faaliyet Raporu"),
    period: row.period,
    category: row.category,
    summary: safePublicReportText(row.summary, "Dönemsel faaliyet çalışmalarına ait özet bilgiler bu alanda paylaşılır."),
    statusLabel: row.pdf_asset_id ? "Özet yayınlandı" : "PDF hazırlanıyor",
    pdfUrl: row.file_url ?? undefined,
    metrics: metrics.length ? metrics : [{ label: "Durum", value: "Yayında" }],
    tags: [row.category, row.period].filter(Boolean)
  };
}

async function fetchPublishedReports() {
  const supabase = createSupabaseReadOnlyClient();
  if (!supabase) return null;

  const timeout = createReadOnlyAbortSignal();
  try {
    const { data, error } = await supabase
      .from("reports")
      .select(publicReportColumns)
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("updated_at", { ascending: false })
      .abortSignal(timeout.signal);

    if (error) {
      logReadOnlyFallback("reports", error);
      return null;
    }

    return (data ?? []).map((row) => mapSupabaseReportToReport(row as unknown as SupabaseReportRow));
  } catch {
    logReadOnlyFallback("reports");
    return null;
  } finally {
    timeout.clear();
  }
}

export async function getReportsWithSource(): Promise<RepositoryResult<Report[]>> {
  const supabaseReports = await fetchPublishedReports();

  if (supabaseReports) {
    return { data: supabaseReports, source: "supabase" };
  }

  return { data: [], source: "demo" };
}

export async function getReports() {
  const result = await getReportsWithSource();
  return result.data;
}

export async function getPublishedReportsWithSource() {
  return getReportsWithSource();
}

export async function getPublishedReports() {
  const result = await getPublishedReportsWithSource();
  return result.data;
}

export async function getPublishedReportCount(): Promise<RepositoryResult<number>> {
  const supabase = createSupabaseReadOnlyClient();
  if (!supabase) return { data: 0, source: "demo" };

  const timeout = createReadOnlyAbortSignal();
  try {
    const { count, error } = await supabase
      .from("reports")
      .select("id", { count: "exact", head: true })
      .eq("status", "published")
      .abortSignal(timeout.signal);

    if (error) {
      logReadOnlyFallback("reports-count", error);
      return { data: 0, source: "demo" };
    }

    return { data: count ?? 0, source: "supabase" };
  } catch {
    logReadOnlyFallback("reports-count");
    return { data: 0, source: "demo" };
  } finally {
    timeout.clear();
  }
}
