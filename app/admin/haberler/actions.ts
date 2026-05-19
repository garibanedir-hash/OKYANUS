"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { news as fallbackNews } from "@/data/news";
import { AdminAuthorizationError, canManageContent, requireAdminUser } from "@/lib/auth/requireAdmin";
import {
  assertAllowedStatus,
  getOptionalString,
  getSlugValue,
  getString,
  normalizeOptionalUrl,
  parseCsvOrLines,
  parseDateField,
  userFriendlyActionError
} from "@/lib/admin/contentValidation";
import { logAdminAction } from "@/lib/audit/auditLogger";
import { asAdminWriteClient } from "@/lib/data/adminWriteClient";
import type { SupabaseNewsRow } from "@/lib/data/newsRepository";

const newsStatuses = ["draft", "published", "archived"] as const;

export type NewsFormValues = {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  status: string;
  publishedAt: string;
  tagsText: string;
  relatedProjectSlug: string;
  relatedActivitySlug: string;
  coverImageUrl: string;
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

function parseNewsForm(formData: FormData) {
  const title = getString(formData, "title");
  const slug = getSlugValue(formData, title);
  const summary = getString(formData, "summary");
  const content = getString(formData, "content");
  const status = assertAllowedStatus(getString(formData, "status") || "draft", newsStatuses);
  const coverImageUrl = normalizeOptionalUrl(getOptionalString(formData, "coverImageUrl"));

  if (!title) throw new Error("Haber başlığı zorunludur.");
  if (!slug) throw new Error("Haber slug alanı zorunludur.");
  if (!summary) throw new Error("Haber özeti zorunludur.");
  if (!content) throw new Error("Haber içeriği zorunludur.");
  if (status === "published" && (!title || !slug || !content)) {
    throw new Error("Yayına almak için başlık, slug ve içerik dolu olmalıdır.");
  }

  const publishedAt = parseDateField(formData, "publishedAt");

  return {
    title,
    slug,
    summary,
    content,
    category: getString(formData, "category") || "Duyuru",
    status,
    published_at: status === "published" ? publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString() : null,
    tags: parseCsvOrLines(getString(formData, "tagsText")),
    related_project_slug: getOptionalString(formData, "relatedProjectSlug"),
    related_activity_slug: getOptionalString(formData, "relatedActivitySlug"),
    cover_image_url: coverImageUrl
  };
}

function mapFallbackNews(id: string): NewsFormValues | null {
  const item = fallbackNews.find((entry) => entry.id === id);
  if (!item) return null;

  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    summary: item.summary,
    content: item.content,
    category: item.category,
    status: "published",
    publishedAt: "",
    tagsText: item.tags.join(", "),
    relatedProjectSlug: item.relatedProjectSlug ?? "",
    relatedActivitySlug: item.relatedActivitySlug ?? "",
    coverImageUrl: ""
  };
}

function mapSupabaseNews(row: SupabaseNewsRow): NewsFormValues {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    content: row.content,
    category: row.category,
    status: row.status,
    publishedAt: row.published_at ? row.published_at.slice(0, 10) : "",
    tagsText: Array.isArray(row.tags) ? row.tags.join(", ") : "",
    relatedProjectSlug: row.related_project_slug ?? "",
    relatedActivitySlug: row.related_activity_slug ?? "",
    coverImageUrl: row.cover_image_url ?? ""
  };
}

export async function getNewsForEdit(id: string): Promise<NewsFormValues | null> {
  try {
    const context = await requireContentAdmin();
    const db = asAdminWriteClient(context.supabase);
    const { data, error } = await db
      .from<SupabaseNewsRow>("news_posts")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!error && data) {
      return mapSupabaseNews(data as unknown as SupabaseNewsRow);
    }
  } catch {
    return mapFallbackNews(id);
  }

  return mapFallbackNews(id);
}

export async function createNewsAction(formData: FormData) {
  let successPath: string | null = null;
  try {
    const context = await requireContentAdmin();
    const payload = parseNewsForm(formData);
    const db = asAdminWriteClient(context.supabase);
    const { data, error } = await db
      .from<MutationResult>("news_posts")
      .insert(payload)
      .select("id, slug")
      .single();

    if (error || !data) {
      throw new Error("Haber kaydedilemedi. Lütfen alanları kontrol edin.");
    }

    await logAdminAction({
      actorId: context.user.id,
      action: "news.create",
      entityType: "news_posts",
      entityId: data.id,
      summary: `Haber oluşturuldu: ${payload.title}`,
      metadata: { slug: payload.slug, status: payload.status }
    });

    revalidatePath("/");
    revalidatePath("/haberler");
    revalidatePath("/admin/haberler");
    successPath = "/admin/haberler?durum=haber-olusturuldu";
  } catch (error) {
    if (error instanceof AdminAuthorizationError) {
      redirectWithStatus("/admin/haberler/yeni", "yetkisiz", error.message);
    }

    redirectWithStatus("/admin/haberler/yeni", "hata", userFriendlyActionError(error));
  }

  if (successPath) redirect(successPath);
}

export async function updateNewsAction(formData: FormData) {
  const id = getString(formData, "id");
  const errorPath = id ? `/admin/haberler/${id}/duzenle` : "/admin/haberler";
  let successPath: string | null = null;

  try {
    if (!id) throw new Error("Haber kaydı bulunamadı.");

    const context = await requireContentAdmin();
    const payload = parseNewsForm(formData);
    const db = asAdminWriteClient(context.supabase);
    const { data, error } = await db
      .from<MutationResult>("news_posts")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id, slug")
      .single();

    if (error || !data) {
      throw new Error("Haber güncellenemedi. Lütfen tekrar deneyin.");
    }

    await logAdminAction({
      actorId: context.user.id,
      action: "news.update",
      entityType: "news_posts",
      entityId: id,
      summary: `Haber güncellendi: ${payload.title}`,
      metadata: { slug: payload.slug, status: payload.status }
    });

    revalidatePath("/");
    revalidatePath("/haberler");
    revalidatePath(`/haberler/${payload.slug}`);
    revalidatePath("/admin/haberler");
    successPath = "/admin/haberler?durum=haber-guncellendi";
  } catch (error) {
    if (error instanceof AdminAuthorizationError) {
      redirectWithStatus(errorPath, "yetkisiz", error.message);
    }

    redirectWithStatus(errorPath, "hata", userFriendlyActionError(error));
  }

  if (successPath) redirect(successPath);
}

export async function archiveNewsAction(formData: FormData) {
  const id = getString(formData, "id");
  let successPath: string | null = null;

  try {
    if (!id) throw new Error("Haber kaydı bulunamadı.");

    const context = await requireContentAdmin();
    const db = asAdminWriteClient(context.supabase);
    const { error } = await db
      .from<MutationResult>("news_posts")
      .update({ status: "archived", updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id")
      .single();

    if (error) {
      throw new Error("Haber arşivlenemedi.");
    }

    await logAdminAction({
      actorId: context.user.id,
      action: "news.archive",
      entityType: "news_posts",
      entityId: id,
      summary: "Haber arşivlendi"
    });

    revalidatePath("/");
    revalidatePath("/haberler");
    revalidatePath("/admin/haberler");
    successPath = "/admin/haberler?durum=haber-arsivlendi";
  } catch (error) {
    if (error instanceof AdminAuthorizationError) {
      redirectWithStatus("/admin/haberler", "yetkisiz", error.message);
    }

    redirectWithStatus("/admin/haberler", "hata", userFriendlyActionError(error));
  }

  if (successPath) redirect(successPath);
}
