import { projects } from "@/data/projects";

export function getProjects() {
  // TODO: Supabase read-only entegrasyonunda projects tablosundan beslenecek.
  return projects;
}

export function getProjectBySlug(slug: string) {
  // Env yoksa ve demo modda local data kullanılır.
  return projects.find((project) => project.slug === slug);
}

export function getFeaturedProjects() {
  // Mevcut mock modelde featured alanı yok; ana sayfa sırası korunur.
  return projects.slice(0, 4);
}
