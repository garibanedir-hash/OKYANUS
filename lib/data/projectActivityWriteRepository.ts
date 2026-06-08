import "server-only";

import type {
  ProjectActivityStatus,
  ProjectActivityType,
  ProjectActivityVisibility
} from "@/data/projectActivityMock";
import { asAdminWriteClient, type DbError } from "@/lib/data/adminWriteClient";
import {
  mapSupabaseProjectActivity,
  projectActivityColumns,
  type ProjectActivityRow
} from "@/lib/data/projectActivityRepository";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type ProjectActivityWriteInput = {
  projectId: string;
  title: string;
  slug?: string | null;
  activityType: ProjectActivityType;
  status: ProjectActivityStatus;
  visibility: ProjectActivityVisibility;
  activityDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  country?: string | null;
  city?: string | null;
  district?: string | null;
  locationName?: string | null;
  regionLabel?: string | null;
  responsiblePerson?: string | null;
  responsibleUserId?: string | null;
  teamName?: string | null;
  beneficiaryCount?: number | null;
  familyCount?: number | null;
  distributedItemType?: string | null;
  distributedItemCount?: number | null;
  estimatedCost?: number | null;
  currency?: string | null;
  summary?: string | null;
  description?: string | null;
  internalNotes?: string | null;
  publicSummary?: string | null;
  coverImageUrl?: string | null;
  galleryUrls?: string[];
  videoUrl?: string | null;
  reportUrl?: string | null;
  relatedExpenseId?: string | null;
  cancelledReason?: string | null;
};

type AdminContextLite = {
  actorId: string;
  actorRole: string;
};

function getDb() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    throw new Error("Service role env eksik olduğu için proje faaliyeti işlemi yapılamadı.");
  }

  return asAdminWriteClient(supabase);
}

function safeDbError(error: DbError | null) {
  if (!error) return null;
  return {
    code: error.code ?? null,
    message: error.message ?? null,
    details: error.details ?? null,
    hint: error.hint ?? null
  };
}

function friendlyProjectActivityError(error: DbError | null, fallback: string) {
  const message = [error?.code, error?.message, error?.details, error?.hint].filter(Boolean).join(" ");
  if (/project_activities|project_activity_events|does not exist|schema cache|PGRST205|42P01/i.test(message)) {
    return "project_activities tablosu bulunamadı. 020_project_activities.sql migration uygulanmalı.";
  }
  if (/permission|42501|row-level|not authorized/i.test(message)) return "Proje faaliyeti işlemi için server yetkisi doğrulanamadı.";
  if (/duplicate|23505/i.test(message)) return "Bu faaliyet slug değeri aynı proje içinde daha önce kullanılmış.";
  if (/check constraint|23514|invalid input|22P02/i.test(message)) return "Proje faaliyeti alanları geçerli değil.";
  return fallback;
}

function logProjectActivityWriteIssue(
  phase: string,
  payload: {
    id?: string;
    projectId?: string;
    operation?: string;
    filter?: Record<string, string>;
    expectedStatus?: ProjectActivityStatus;
    actualStatus?: ProjectActivityStatus | null;
    error?: DbError | null;
    note?: string;
  }
) {
  console.error("[project-activities:write]", phase, {
    operation: payload.operation ?? null,
    id: payload.id ?? null,
    projectId: payload.projectId ?? null,
    filter: payload.filter ?? null,
    expectedStatus: payload.expectedStatus ?? null,
    actualStatus: payload.actualStatus ?? null,
    note: payload.note ?? null,
    error: safeDbError(payload.error ?? null)
  });
}

function toRow(input: Partial<ProjectActivityWriteInput>, actorId?: string) {
  const row: Record<string, unknown> = {};
  if (input.projectId !== undefined) row.project_id = input.projectId;
  if (input.title !== undefined) row.title = input.title;
  if (input.slug !== undefined) row.slug = input.slug || null;
  if (input.activityType !== undefined) row.activity_type = input.activityType;
  if (input.status !== undefined) row.status = input.status;
  if (input.visibility !== undefined) row.visibility = input.visibility;
  if (input.activityDate !== undefined) row.activity_date = input.activityDate || null;
  if (input.startTime !== undefined) row.start_time = input.startTime || null;
  if (input.endTime !== undefined) row.end_time = input.endTime || null;
  if (input.country !== undefined) row.country = input.country || null;
  if (input.city !== undefined) row.city = input.city || null;
  if (input.district !== undefined) row.district = input.district || null;
  if (input.locationName !== undefined) row.location_name = input.locationName || null;
  if (input.regionLabel !== undefined) row.region_label = input.regionLabel || null;
  if (input.responsiblePerson !== undefined) row.responsible_person = input.responsiblePerson || null;
  if (input.responsibleUserId !== undefined) row.responsible_user_id = input.responsibleUserId || null;
  if (input.teamName !== undefined) row.team_name = input.teamName || null;
  if (input.beneficiaryCount !== undefined) row.beneficiary_count = input.beneficiaryCount ?? null;
  if (input.familyCount !== undefined) row.family_count = input.familyCount ?? null;
  if (input.distributedItemType !== undefined) row.distributed_item_type = input.distributedItemType || null;
  if (input.distributedItemCount !== undefined) row.distributed_item_count = input.distributedItemCount ?? null;
  if (input.estimatedCost !== undefined) row.estimated_cost = input.estimatedCost ?? null;
  if (input.currency !== undefined) row.currency = input.currency || "TRY";
  if (input.summary !== undefined) row.summary = input.summary || null;
  if (input.description !== undefined) row.description = input.description || null;
  if (input.internalNotes !== undefined) row.internal_notes = input.internalNotes || null;
  if (input.publicSummary !== undefined) row.public_summary = input.publicSummary || null;
  if (input.coverImageUrl !== undefined) row.cover_image_url = input.coverImageUrl || null;
  if (input.galleryUrls !== undefined) row.gallery_urls = input.galleryUrls ?? [];
  if (input.videoUrl !== undefined) row.video_url = input.videoUrl || null;
  if (input.reportUrl !== undefined) row.report_url = input.reportUrl || null;
  if (input.relatedExpenseId !== undefined) row.related_expense_id = input.relatedExpenseId || null;
  if (input.cancelledReason !== undefined) row.cancelled_reason = input.cancelledReason || null;
  if (actorId) row.updated_by = actorId;
  row.updated_at = new Date().toISOString();
  return row;
}

function lifecycleDates(status: ProjectActivityStatus, visibility?: ProjectActivityVisibility) {
  const now = new Date().toISOString();
  const row: Record<string, unknown> = {};
  if (status === "completed") row.completed_at = now;
  if (status === "cancelled") row.cancelled_at = now;
  if (status === "completed" && visibility === "public") row.published_at = now;
  return row;
}

export async function appendProjectActivityEvent(input: {
  projectActivityId: string;
  eventType: string;
  oldStatus?: ProjectActivityStatus | null;
  newStatus?: ProjectActivityStatus | null;
  actorId?: string | null;
  actorRole?: string | null;
  note?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const db = getDb();
  const { error } = await db.from("project_activity_events").insert({
    project_activity_id: input.projectActivityId,
    event_type: input.eventType,
    old_status: input.oldStatus ?? null,
    new_status: input.newStatus ?? null,
    actor_id: input.actorId ?? null,
    actor_role: input.actorRole ?? null,
    note: input.note ?? null,
    metadata: input.metadata ?? {}
  });

  if (error) {
    console.warn("[project-activities:write]", "event_insert_failed", {
      projectActivityId: input.projectActivityId,
      eventType: input.eventType,
      error: safeDbError(error)
    });
  }
}

export async function createProjectActivity(input: ProjectActivityWriteInput, admin: AdminContextLite) {
  const db = getDb();
  const { data, error } = await db
    .from<ProjectActivityRow>("project_activities")
    .insert({
      ...toRow(input, admin.actorId),
      ...lifecycleDates(input.status, input.visibility),
      created_by: admin.actorId,
      updated_by: admin.actorId
    })
    .select(projectActivityColumns)
    .single();

  if (error) {
    logProjectActivityWriteIssue("insert_error", { operation: "createProjectActivity", projectId: input.projectId, error });
    throw new Error(friendlyProjectActivityError(error, "Proje faaliyeti oluşturulamadı."));
  }
  if (!data) {
    logProjectActivityWriteIssue("insert_no_row", { operation: "createProjectActivity", projectId: input.projectId, note: "insert returned no row" });
    throw new Error("Proje faaliyeti oluşturuldu ancak kayıt geri okunamadı.");
  }

  const activity = mapSupabaseProjectActivity(data);
  await appendProjectActivityEvent({
    projectActivityId: activity.id,
    eventType: "project_activity.create",
    newStatus: activity.status,
    actorId: admin.actorId,
    actorRole: admin.actorRole,
    note: "Proje faaliyeti oluşturuldu."
  });
  return activity;
}

export async function updateProjectActivity(id: string, input: ProjectActivityWriteInput, admin: AdminContextLite) {
  const db = getDb();
  const { data, error } = await db
    .from<ProjectActivityRow>("project_activities")
    .update({
      ...toRow(input, admin.actorId),
      ...lifecycleDates(input.status, input.visibility)
    })
    .eq("id", id)
    .select(projectActivityColumns)
    .maybeSingle();

  if (error) {
    logProjectActivityWriteIssue("update_error", { operation: "updateProjectActivity", id, filter: { id }, error });
    throw new Error(friendlyProjectActivityError(error, "Proje faaliyeti güncellenemedi."));
  }
  if (!data) {
    logProjectActivityWriteIssue("update_no_row", { operation: "updateProjectActivity", id, filter: { id }, note: "update returned no row" });
    throw new Error("Proje faaliyeti kaydı bulunamadı veya güncellenemedi.");
  }

  const activity = mapSupabaseProjectActivity(data);
  await appendProjectActivityEvent({
    projectActivityId: activity.id,
    eventType: "project_activity.update",
    newStatus: activity.status,
    actorId: admin.actorId,
    actorRole: admin.actorRole,
    note: "Proje faaliyeti güncellendi."
  });
  return activity;
}

export async function updateProjectActivityCoverImage(id: string, coverImageUrl: string, admin: AdminContextLite) {
  const db = getDb();
  const { data, error } = await db
    .from<ProjectActivityRow>("project_activities")
    .update({
      cover_image_url: coverImageUrl,
      updated_by: admin.actorId,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .select(projectActivityColumns)
    .maybeSingle();

  if (error) {
    logProjectActivityWriteIssue("cover_image_error", { operation: "updateProjectActivityCoverImage", id, filter: { id }, error });
    throw new Error(friendlyProjectActivityError(error, "Faaliyet görseli yüklendi ancak kayıt güncellenemedi."));
  }
  if (!data) {
    logProjectActivityWriteIssue("cover_image_no_row", { operation: "updateProjectActivityCoverImage", id, filter: { id } });
    throw new Error("Proje faaliyeti bulunamadı veya görsel bilgisi güncellenemedi.");
  }

  return mapSupabaseProjectActivity(data);
}

export async function updateProjectActivityStatus(input: {
  id: string;
  status: ProjectActivityStatus;
  oldStatus?: ProjectActivityStatus | null;
  admin: AdminContextLite;
  note?: string | null;
  extra?: Record<string, unknown>;
  eventType: string;
}) {
  const db = getDb();
  const now = new Date().toISOString();
  const payload: Record<string, unknown> = {
    status: input.status,
    updated_by: input.admin.actorId,
    updated_at: now,
    ...lifecycleDates(input.status),
    ...(input.extra ?? {})
  };

  const { data, error } = await db
    .from<ProjectActivityRow>("project_activities")
    .update(payload)
    .eq("id", input.id)
    .select(projectActivityColumns)
    .maybeSingle();

  if (error) {
    logProjectActivityWriteIssue("status_update_error", { operation: input.eventType, id: input.id, filter: { id: input.id }, error });
    throw new Error(friendlyProjectActivityError(error, "Proje faaliyeti durumu güncellenemedi."));
  }
  if (!data) {
    logProjectActivityWriteIssue("status_update_no_row", { operation: input.eventType, id: input.id, filter: { id: input.id }, note: "update returned no row" });
    throw new Error("Proje faaliyeti kaydı bulunamadı veya durumu güncellenemedi.");
  }

  const activity = mapSupabaseProjectActivity(data);
  if (activity.status !== input.status) {
    logProjectActivityWriteIssue("status_update_verification_failed", {
      operation: input.eventType,
      id: input.id,
      filter: { id: input.id },
      expectedStatus: input.status,
      actualStatus: activity.status,
      note: "updated row status did not match target status"
    });
    throw new Error("Proje faaliyeti durumu güncellendi ancak doğrulama başarısız oldu.");
  }

  await appendProjectActivityEvent({
    projectActivityId: activity.id,
    eventType: input.eventType,
    oldStatus: input.oldStatus ?? null,
    newStatus: activity.status,
    actorId: input.admin.actorId,
    actorRole: input.admin.actorRole,
    note: input.note ?? null
  });
  return activity;
}

export async function updateProjectActivityVisibility(input: {
  id: string;
  visibility: ProjectActivityVisibility;
  admin: AdminContextLite;
  note?: string | null;
}) {
  const db = getDb();
  const now = new Date().toISOString();
  const payload: Record<string, unknown> = {
    visibility: input.visibility,
    updated_by: input.admin.actorId,
    updated_at: now
  };
  if (input.visibility === "public") payload.published_at = now;

  const { data, error } = await db
    .from<ProjectActivityRow>("project_activities")
    .update(payload)
    .eq("id", input.id)
    .select(projectActivityColumns)
    .maybeSingle();

  if (error) {
    logProjectActivityWriteIssue("visibility_update_error", { operation: "project_activity.visibility", id: input.id, filter: { id: input.id }, error });
    throw new Error(friendlyProjectActivityError(error, "Proje faaliyeti görünürlüğü güncellenemedi."));
  }
  if (!data) {
    logProjectActivityWriteIssue("visibility_update_no_row", { operation: "project_activity.visibility", id: input.id, filter: { id: input.id }, note: "update returned no row" });
    throw new Error("Proje faaliyeti kaydı bulunamadı veya görünürlüğü güncellenemedi.");
  }

  const activity = mapSupabaseProjectActivity(data);
  await appendProjectActivityEvent({
    projectActivityId: activity.id,
    eventType: "project_activity.visibility",
    oldStatus: activity.status,
    newStatus: activity.status,
    actorId: input.admin.actorId,
    actorRole: input.admin.actorRole,
    note: input.note ?? null,
    metadata: { visibility: input.visibility }
  });
  return activity;
}
