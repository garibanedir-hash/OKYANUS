import { news } from "@/data/news";

export function getNewsPosts() {
  // TODO: Supabase read-only entegrasyonunda news_posts tablosundan beslenecek.
  return news;
}

export function getNewsPostBySlug(slug: string) {
  return news.find((item) => item.slug === slug);
}

export function getLatestNews(limit = 3) {
  return news.slice(0, limit);
}
