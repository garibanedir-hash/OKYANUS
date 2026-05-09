import { reports } from "@/data/reports";

export function getReports() {
  // TODO: Supabase read-only entegrasyonunda reports tablosundan beslenecek.
  return reports;
}

export function getPublishedReports() {
  // Mock veriler demo/published görünüme hazırdır; gerçek status alanı Supabase geçişinde ayrılacak.
  return reports;
}
