import type { ReactNode } from "react";

export function sanitizeAdminUiText(text: string) {
  return text
    .replace(/demo\/read-only/gi, "read-only")
    .replace(/read-only demo/gi, "read-only")
    .replace(/demo\/mock fallback/gi, "boş durum")
    .replace(/demo fallback/gi, "boş durum")
    .replace(/mock fallback/gi, "boş durum")
    .replace(/mock veriyle çalışır/gi, "gerçek kayıt geldiğinde güncellenir")
    .replace(/\bdemo\b/gi, "hazırlık")
    .replace(/\bmock\b/gi, "hazırlık")
    .replace(/Supabase read-only/gi, "gerçek veri")
    .replace(/Supabase/gi, "veri kaynağı")
    .replace(/\bAuth\b/g, "Giriş")
    .replace(/env değişkenleri/gi, "giriş yapılandırması")
    .replace(/env eksik/gi, "giriş yapılandırması eksik");
}

export function sanitizeAdminUiNode(node: ReactNode) {
  return typeof node === "string" ? sanitizeAdminUiText(node) : node;
}
