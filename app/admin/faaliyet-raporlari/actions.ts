"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { reports as fallbackReports } from "@/data/reports";
import { AdminAuthorizationError, canManageContent, requireAdminUser } from "@/lib/auth/requireAdmin";
import {
  assertAllowedStatus,
  getOptionalString,
  getSlugValue,
  getString,
  normalizeOptionalUrl,
  parseDateField,
  parseMetrics,
  toJsonValue,
  userFriendlyActionError
} from "@/lib/admin/contentValidation";
import { logAdminAction } from "@/lib/audit/auditLogger";
import { asAdminWriteClient } from "@/lib/data/adminWriteClient";
import type { SupabaseReportRow } from "@/lib/data/reportsRepository";

const reportStatuses = ["draft", "published", "archived"] as const;

export type ReportFormValues = {
  id?: string;
  title: string;
  slug: string;
  period: string;
  category: string;
  summary: string;
  status: string;
  fileUrl: string;
  metricsText: string;
  publishedAt: string;
};

type MutationResult = { id: string; slug?: string };

function redirectWithStatus(path: string, durum: string, mesaj?: string) {
  const params = new URLSearchParams({ durum });
  if (mesaj) params.set("mesaj", mesaj);
  redirect(`${path}?${params.toString()}`);
}

async function requireContentAdmin() {
  const context = await requireAdminUser();
  if (!canManageContent(context)) {
    throw new AdminAuthorizationError("Bu içerik işlemi için admin yetkisi gerekiyor.", "forbidden");
  }

  return context;
}

function parseReportForm(formData: FormData) {
  const title = getString(formData, "title");
  const slug = getSlugValue(formData, title);
  const summary = getString(formData, "summary");
  const status = assertAllowedStatus(getString(formData, "status") || "draft", reportStatuses);
  const fileUrl = normalizeOptionalUrl(getOptionalString(formData, "fileUrl"));

  if (!title) throw new Error("Rapor başlığı zorunludur.");
  if (!slug) throw new Error("Rapor slug alanı zorunludur.");
  if (!summary) throw new Error("Rapor açıklaması zorunludur.");

  const publishedAt = parseDateField(formData, "publishedAt");

  return {
    title,
    slug,
    period: getString(formData, "period") || "Dönem belirtilmedi",
    category: getString(formData, "category") || "Genel Faaliyet",
    summary,
    status,
    file_url: fileUrl,
    metrics: toJsonValue(parseMetrics(getString(formData, "metricsText"))),
    published_at: status === "published" ? publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString() : null
  };
}

function mapFallbackReport(id: string): ReportFormValues | null {
  const report = fallbackReports.find((item) => item.id === id);
  if (!report) return null;

  return {
    id: report.id,
    title: report.title,
    slug: report.slug,
    period: report.period,
    category: report.category,
    summary: report.summary,
    status: "published",
    fileUrl: report.pdfUrl ?? "",
    metricsText: report.metrics.map((metric) => `${metric.label}: ${metric.value}`).join("\n"),
    publishedAt: ""
  };
}

function mapSupabaseReport(row: SupabaseReportRow): ReportFormValues {
  const metrics = Array.isArray(row.metrics)
    ? row.metrics
        .filter((metric): metric is { label: string; value: string } =>
          Boolean(metric) &&
          typeof metric === "object" &&
          typeof (metric as { label?: unknown }).label === "string" &&
          typeof (metric as { value?: unknown }).value === "string"
        )
        .map((metric) => `${metric.label}: ${metric.value}`)
        .join("\n")
    : "";

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    period: row.period,
    category: row.category,
    summary: row.summary,
    status: row.status,
    fileUrl: row.file_url ?? "",
    metricsText: metrics,
    publishedAt: row.published_at ? row.published_at.slice(0, 10) : ""
  };
}

export async function getReportForEdit(id: string): Promise<ReportFormValues | null> {
  try {
    const context = await requireContentAdmin();
    const db = asAdminWriteClient(context.supabase);
    const { data, error } = await db
      .from<SupabaseReportRow>("reports")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!error && data) {
      return mapSupabaseReport(data as unknown as SupabaseReportRow);
    }
  } catch {
    return mapFallbackReport(id);
  }

  return mapFallbackReport(id);
}

export async function createReportAction(formData: FormData) {
  let successPath: string | null = null;
  try {
    const context = await requireContentAdmin();
    const payload = parseReportForm(formData);
    const db = asAdminWriteClient(context.supabase);
    const { data, error } = await db
      .from<MutationResult>("reports")
      .insert(payload)
      .select("id, slug")
      .single();

    if (error || !data) {
      throw new Error("Rapor kaydedilemedi. Lütfen alanları kontrol edin.");
    }

    await logAdminAction({
      actorId: context.user.id,
      action: "report.create",
      entityType: "reports",
      entityId: data.id,
      summary: `Rapor oluşturuldu: ${payload.title}`,
      metadata: { slug: payload.slug, status: payload.status }
    });

    revalidatePath("/faaliyet-raporlari");
    revalidatePath("/admin/faaliyet-raporlari");
    successPath = "/admin/faaliyet-raporlari?durum=rapor-olusturuldu";
  } catch (error) {
    if (error instanceof AdminAuthorizationError) {
      redirectWithStatus("/admin/faaliyet-raporlari/yeni", "yetkisiz", error.message);
    }

    redirectWithStatus("/admin/faaliyet-raporlari/yeni", "hata", userFriendlyActionError(error));
  }

  if (successPath) redirect(successPath);
}

export async function updateReportAction(formData: FormData) {
  const id = getString(formData, "id");
  const errorPath = id ? `/admin/faaliyet-raporlari/${id}/duzenle` : "/admin/faaliyet-raporlari";
  let successPath: string | null = null;

  try {
    if (!id) throw new Error("Rapor kaydı bulunamadı.");

    const context = await requireContentAdmin();
    const payload = parseReportForm(formData);
    const db = asAdminWriteClient(context.supabase);
    const { data, error } = await db
      .from<MutationResult>("reports")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id, slug")
      .single();

    if (error || !data) {
      throw new Error("Rapor güncellenemedi. Lütfen tekrar deneyin.");
    }

    await logAdminAction({
      actorId: context.user.id,
      action: "report.update",
      entityType: "reports",
      entityId: id,
      summary: `Rapor güncellendi: ${payload.title}`,
      metadata: { slug: payload.slug, status: payload.status }
    });

    revalidatePath("/faaliyet-raporlari");
    revalidatePath("/admin/faaliyet-raporlari");
    successPath = "/admin/faaliyet-raporlari?durum=rapor-guncellendi";
  } catch (error) {
    if (error instanceof AdminAuthorizationError) {
      redirectWithStatus(errorPath, "yetkisiz", error.message);
    }

    redirectWithStatus(errorPath, "hata", userFriendlyActionError(error));
  }

  if (successPath) redirect(successPath);
}

export async function archiveReportAction(formData: FormData) {
  const id = getString(formData, "id");
  let successPath: string | null = null;

  try {
    if (!id) throw new Error("Rapor kaydı bulunamadı.");

    const context = await requireContentAdmin();
    const db = asAdminWriteClient(context.supabase);
    const { error } = await db
      .from<MutationResult>("reports")
      .update({ status: "archived", updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id")
      .single();

    if (error) {
      throw new Error("Rapor arşivlenemedi.");
    }

    await logAdminAction({
      actorId: context.user.id,
      action: "report.archive",
      entityType: "reports",
      entityId: id,
      summary: "Rapor arşivlendi"
    });

    revalidatePath("/faaliyet-raporlari");
    revalidatePath("/admin/faaliyet-raporlari");
    successPath = "/admin/faaliyet-raporlari?durum=rapor-arsivlendi";
  } catch (error) {
    if (error instanceof AdminAuthorizationError) {
      redirectWithStatus("/admin/faaliyet-raporlari", "yetkisiz", error.message);
    }

    redirectWithStatus("/admin/faaliyet-raporlari", "hata", userFriendlyActionError(error));
  }

  if (successPath) redirect(successPath);
}
