import type { Json } from "@/lib/supabase/types";
import { slugify } from "@/lib/utils/slugify";

export type MetricInput = { label: string; value: string };

export function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export function getOptionalString(formData: FormData, key: string) {
  const value = getString(formData, key);
  return value.length ? value : null;
}

export function getSlugValue(formData: FormData, title: string) {
  const explicit = getString(formData, "slug");
  return explicit ? slugify(explicit) : slugify(title);
}

export function parseNumberField(formData: FormData, key: string, fallback = 0) {
  const raw = getString(formData, key);
  if (!raw) return fallback;

  const normalized = raw.replace(",", ".");
  const parsed = Number(normalized);

  if (!Number.isFinite(parsed)) {
    throw new Error(`${key} alanı sayı olmalıdır.`);
  }

  return parsed;
}

export function parseDateField(formData: FormData, key: string) {
  const value = getString(formData, key);
  return value || null;
}

export function parseCsvOrLines(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function isMetricInput(value: unknown): value is MetricInput {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as { label?: unknown }).label === "string" &&
    typeof (value as { value?: unknown }).value === "string"
  );
}

export function parseMetrics(value: string): MetricInput[] {
  const trimmed = value.trim();
  if (!trimmed) return [];

  if (trimmed.startsWith("[")) {
    const parsed = JSON.parse(trimmed) as unknown;
    if (!Array.isArray(parsed) || !parsed.every(isMetricInput)) {
      throw new Error("Metrikler JSON listesi label/value alanları içermelidir.");
    }

    return parsed.map((metric) => ({
      label: metric.label.trim(),
      value: metric.value.trim()
    })).filter((metric) => metric.label && metric.value);
  }

  return trimmed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...valueParts] = line.split(":");
      return {
        label: label.trim(),
        value: valueParts.join(":").trim()
      };
    })
    .filter((metric) => metric.label && metric.value);
}

export function assertAllowedStatus(value: string, allowed: readonly string[]) {
  if (!allowed.includes(value)) {
    throw new Error("Geçersiz yayın durumu seçildi.");
  }

  return value;
}

export function normalizeOptionalUrl(value: string | null) {
  if (!value) return null;
  if (value.startsWith("/")) return value;

  try {
    const url = new URL(value);
    return url.toString();
  } catch {
    throw new Error("URL alanı geçerli bir bağlantı olmalıdır.");
  }
}

export function toJsonValue(value: unknown): Json {
  return value as Json;
}

export function userFriendlyActionError(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "İşlem tamamlanamadı. Lütfen bilgileri kontrol edip tekrar deneyin.";
}
