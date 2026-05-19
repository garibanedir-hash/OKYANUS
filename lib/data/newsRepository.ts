import type { NewsItem } from "@/data/news";
import { news as fallbackNews } from "@/data/news";
import {
  createReadOnlyAbortSignal,
  createSupabaseReadOnlyClient,
  logReadOnlyFallback,
  type RepositoryResult
} from "@/lib/data/readOnlySupabase";

export type SupabaseNewsRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  related_project_id: string | null;
  related_activity_id: string | null;
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

const publicNewsColumns = [
  "id",
  "slug",
  "title",
  "category",
  "summary",
  "content",
  "related_project_id",
  "related_activity_id",
  "status",
  "published_at",
  "created_at",
  "updated_at"
].join(", ");

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

export function mapSupabaseNewsToNewsPost(row: SupabaseNewsRow): NewsItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    date: formatDate(row.published_at ?? row.updated_at),
    summary: row.summary,
    content: row.content,
    tags: [row.category].filter(Boolean)
  };
}

async function fetchPublishedNewsPosts() {
  const supabase = createSupabaseReadOnlyClient();
  if (!supabase) return null;

  const timeout = createReadOnlyAbortSignal();
  try {
    const { data, error } = await supabase
      .from("news_posts")
      .select(publicNewsColumns)
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("updated_at", { ascending: false })
      .abortSignal(timeout.signal);

    if (error) {
      logReadOnlyFallback("news", error);
      return null;
    }

    return (data ?? []).map((row) => mapSupabaseNewsToNewsPost(row as unknown as SupabaseNewsRow));
  } catch {
    logReadOnlyFallback("news");
    return null;
  } finally {
    timeout.clear();
  }
}

async function fetchPublishedNewsPostBySlug(slug: string) {
  const supabase = createSupabaseReadOnlyClient();
  if (!supabase) return null;

  const timeout = createReadOnlyAbortSignal();
  try {
    const { data, error } = await supabase
      .from("news_posts")
      .select(publicNewsColumns)
      .eq("slug", slug)
      .eq("status", "published")
      .abortSignal(timeout.signal)
      .maybeSingle();

    if (error) {
      logReadOnlyFallback("news-detail", error);
      return null;
    }

    return data ? mapSupabaseNewsToNewsPost(data as unknown as SupabaseNewsRow) : null;
  } catch {
    logReadOnlyFallback("news-detail");
    return null;
  } finally {
    timeout.clear();
  }
}

export async function getNewsPostsWithSource(): Promise<RepositoryResult<NewsItem[]>> {
  const supabaseNews = await fetchPublishedNewsPosts();

  if (supabaseNews) {
    return { data: supabaseNews, source: "supabase" };
  }

  return { data: fallbackNews, source: "demo" };
}

export async function getNewsPosts() {
  const result = await getNewsPostsWithSource();
  return result.data;
}

export async function getNewsPostBySlugWithSource(slug: string): Promise<RepositoryResult<NewsItem | undefined>> {
  const supabaseNews = await fetchPublishedNewsPostBySlug(slug);

  if (supabaseNews) {
    return { data: supabaseNews, source: "supabase" };
  }

  return {
    data: fallbackNews.find((item) => item.slug === slug),
    source: "demo"
  };
}

export async function getNewsPostBySlug(slug: string) {
  const result = await getNewsPostBySlugWithSource(slug);
  return result.data;
}

export async function getLatestNewsWithSource(limit = 3): Promise<RepositoryResult<NewsItem[]>> {
  const result = await getNewsPostsWithSource();

  return {
    data: result.data.slice(0, limit),
    source: result.source
  };
}

export async function getLatestNews(limit = 3) {
  const result = await getLatestNewsWithSource(limit);
  return result.data;
}

export async function getPublishedNewsCount(): Promise<RepositoryResult<number>> {
  const supabase = createSupabaseReadOnlyClient();
  if (!supabase) return { data: fallbackNews.length, source: "demo" };

  const timeout = createReadOnlyAbortSignal();
  try {
    const { count, error } = await supabase
      .from("news_posts")
      .select("id", { count: "exact", head: true })
      .eq("status", "published")
      .abortSignal(timeout.signal);

    if (error) {
      logReadOnlyFallback("news-count", error);
      return { data: fallbackNews.length, source: "demo" };
    }

    return { data: count ?? 0, source: "supabase" };
  } catch {
    logReadOnlyFallback("news-count");
    return { data: fallbackNews.length, source: "demo" };
  } finally {
    timeout.clear();
  }
}
