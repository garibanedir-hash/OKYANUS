import "server-only";

import { projects as fallbackProjects } from "@/data/projects";
import {
  mockProjectActivities,
  mockProjectActivityEvents,
  projectActivityStatusLabels,
  projectActivityTypeLabels,
  projectActivityVisibilityLabels,
  type ProjectActivity,
  type ProjectActivityEvent,
  type ProjectActivityStatus,
  type ProjectActivityType,
  type ProjectActivityVisibility,
  type PublicProjectActivity
} from "@/data/projectActivityMock";
import { asAdminWriteClient } from "@/lib/data/adminWriteClient";
import {
  createReadOnlyAbortSignal,
  createSupabaseReadOnlyClient,
  logReadOnlyFallback,
  type RepositoryResult
} from "@/lib/data/readOnlySupabase";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type ProjectActivityProjectRelation =
  | {
      title?: string | null;
      slug?: string | null;
      status?: string | null;
    }
  | Array<{
      title?: string | null;
      slug?: string | null;
      status?: string | null;
    }>
  | null;

export type ProjectActivityRow = {
  id: string;
  project_id: string;
  title: string;
  slug: string | null;
  activity_type: ProjectActivityType;
  status: ProjectActivityStatus;
  visibility: ProjectActivityVisibility;
  activity_date: string | null;
  start_time: string | null;
  end_time: string | null;
  country: string | null;
  city: string | null;
  district: string | null;
  location_name: string | null;
  region_label: string | null;
  responsible_person: string | null;
  responsible_user_id: string | null;
  team_name: string | null;
  beneficiary_count: number | null;
  family_count: number | null;
  distributed_item_type: string | null;
  distributed_item_count: number | null;
  estimated_cost: number | string | null;
  currency: string | null;
  summary: string | null;
  description: string | null;
  internal_notes: string | null;
  public_summary: string | null;
  cover_image_url: string | null;
  gallery_urls: string[] | null;
  video_url: string | null;
  report_url: string | null;
  related_expense_id: string | null;
  created_by: string | null;
  updated_by: string | null;
  published_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancelled_reason: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string | null;
  updated_at: string | null;
  projects?: ProjectActivityProjectRelation;
};

type ProjectActivityPublicRow = Pick<
  ProjectActivityRow,
  | "id"
  | "project_id"
  | "title"
  | "slug"
  | "activity_type"
  | "activity_date"
  | "country"
  | "city"
  | "district"
  | "location_name"
  | "region_label"
  | "beneficiary_count"
  | "family_count"
  | "distributed_item_type"
  | "distributed_item_count"
  | "public_summary"
  | "cover_image_url"
  | "gallery_urls"
  | "video_url"
  | "report_url"
  | "published_at"
  | "completed_at"
>;

export type ProjectActivityEventRow = {
  id: string;
  project_activity_id: string;
  event_type: string;
  old_status: ProjectActivityStatus | null;
  new_status: ProjectActivityStatus | null;
  actor_id: string | null;
  actor_role: string | null;
  note: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string | null;
};

export type ProjectActivityProjectSummary = {
  id: string;
  title: string;
  slug: string;
  status: string;
};

export const projectActivityColumns = [
  "id",
  "project_id",
  "title",
  "slug",
  "activity_type",
  "status",
  "visibility",
  "activity_date",
  "start_time",
  "end_time",
  "country",
  "city",
  "district",
  "location_name",
  "region_label",
  "responsible_person",
  "responsible_user_id",
  "team_name",
  "beneficiary_count",
  "family_count",
  "distributed_item_type",
  "distributed_item_count",
  "estimated_cost",
  "currency",
  "summary",
  "description",
  "internal_notes",
  "public_summary",
  "cover_image_url",
  "gallery_urls",
  "video_url",
  "report_url",
  "related_expense_id",
  "created_by",
  "updated_by",
  "published_at",
  "completed_at",
  "cancelled_at",
  "cancelled_reason",
  "metadata",
  "created_at",
  "updated_at",
  "projects(title, slug, status)"
].join(", ");

const publicProjectActivityColumns = [
  "id",
  "project_id",
  "title",
  "slug",
  "activity_type",
  "activity_date",
  "country",
  "city",
  "district",
  "location_name",
  "region_label",
  "beneficiary_count",
  "family_count",
  "distributed_item_type",
  "distributed_item_count",
  "public_summary",
  "cover_image_url",
  "gallery_urls",
  "video_url",
  "report_url",
  "published_at",
  "completed_at"
].join(", ");

export const projectActivityEventColumns = [
  "id",
  "project_activity_id",
  "event_type",
  "old_status",
  "new_status",
  "actor_id",
  "actor_role",
  "note",
  "metadata",
  "created_at"
].join(", ");

function firstRelation<T>(value: T | T[] | null | undefined): T | undefined {
  return Array.isArray(value) ? value[0] : value ?? undefined;
}

function parseNumber(value: number | string | null | undefined) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

export function getActivityTypeLabel(type: ProjectActivityType) {
  return projectActivityTypeLabels[type] ?? "Diğer";
}

export function getActivityStatusLabel(status: ProjectActivityStatus) {
  return projectActivityStatusLabels[status] ?? status;
}

export function getActivityVisibilityLabel(visibility: ProjectActivityVisibility) {
  return projectActivityVisibilityLabels[visibility] ?? visibility;
}

export function mapSupabaseProjectActivity(row: ProjectActivityRow): ProjectActivity {
  const project = firstRelation(row.projects);
  return {
    id: row.id,
    projectId: row.project_id,
    projectTitle: project?.title ?? undefined,
    projectSlug: project?.slug ?? undefined,
    title: row.title,
    slug: row.slug ?? undefined,
    activityType: row.activity_type,
    activityTypeLabel: getActivityTypeLabel(row.activity_type),
    status: row.status,
    statusLabel: getActivityStatusLabel(row.status),
    visibility: row.visibility,
    visibilityLabel: getActivityVisibilityLabel(row.visibility),
    activityDate: row.activity_date ?? undefined,
    startTime: row.start_time ?? undefined,
    endTime: row.end_time ?? undefined,
    country: row.country ?? undefined,
    city: row.city ?? undefined,
    district: row.district ?? undefined,
    locationName: row.location_name ?? undefined,
    regionLabel: row.region_label ?? undefined,
    responsiblePerson: row.responsible_person ?? undefined,
    teamName: row.team_name ?? undefined,
    beneficiaryCount: row.beneficiary_count ?? undefined,
    familyCount: row.family_count ?? undefined,
    distributedItemType: row.distributed_item_type ?? undefined,
    distributedItemCount: row.distributed_item_count ?? undefined,
    estimatedCost: parseNumber(row.estimated_cost),
    currency: row.currency ?? "TRY",
    summary: row.summary ?? undefined,
    description: row.description ?? undefined,
    internalNotes: row.internal_notes ?? undefined,
    publicSummary: row.public_summary ?? undefined,
    coverImageUrl: row.cover_image_url ?? undefined,
    galleryUrls: row.gallery_urls ?? [],
    videoUrl: row.video_url ?? undefined,
    reportUrl: row.report_url ?? undefined,
    publishedAt: row.published_at ?? undefined,
    completedAt: row.completed_at ?? undefined,
    cancelledAt: row.cancelled_at ?? undefined,
    cancelledReason: row.cancelled_reason ?? undefined,
    createdAt: row.created_at ?? "Tarih güncellenecek",
    updatedAt: row.updated_at ?? "Tarih güncellenecek"
  };
}

function mapPublicProjectActivity(row: ProjectActivityPublicRow): PublicProjectActivity {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    slug: row.slug ?? undefined,
    activityType: row.activity_type,
    activityTypeLabel: getActivityTypeLabel(row.activity_type),
    activityDate: row.activity_date ?? undefined,
    country: row.country ?? undefined,
    city: row.city ?? undefined,
    district: row.district ?? undefined,
    locationName: row.location_name ?? undefined,
    regionLabel: row.region_label ?? undefined,
    beneficiaryCount: row.beneficiary_count ?? undefined,
    familyCount: row.family_count ?? undefined,
    distributedItemType: row.distributed_item_type ?? undefined,
    distributedItemCount: row.distributed_item_count ?? undefined,
    publicSummary: row.public_summary ?? undefined,
    coverImageUrl: row.cover_image_url ?? undefined,
    galleryUrls: row.gallery_urls ?? [],
    videoUrl: row.video_url ?? undefined,
    reportUrl: row.report_url ?? undefined,
    publishedAt: row.published_at ?? undefined,
    completedAt: row.completed_at ?? undefined
  };
}

function mapProjectActivityEvent(row: ProjectActivityEventRow): ProjectActivityEvent {
  return {
    id: row.id,
    projectActivityId: row.project_activity_id,
    eventType: row.event_type,
    oldStatus: row.old_status ?? undefined,
    newStatus: row.new_status ?? undefined,
    actorId: row.actor_id ?? undefined,
    actorRole: row.actor_role ?? undefined,
    note: row.note ?? undefined,
    createdAt: row.created_at ?? "Tarih güncellenecek"
  };
}

function getAdminDb() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;
  return asAdminWriteClient(supabase);
}

function filterMockActivities(filters?: {
  projectId?: string;
  status?: string;
  visibility?: string;
  activityType?: string;
}) {
  return mockProjectActivities.filter((item) => {
    if (filters?.projectId && item.projectId !== filters.projectId) return false;
    if (filters?.status && filters.status !== "all" && item.status !== filters.status) return false;
    if (filters?.visibility && filters.visibility !== "all" && item.visibility !== filters.visibility) return false;
    if (filters?.activityType && filters.activityType !== "all" && item.activityType !== filters.activityType) return false;
    return true;
  });
}

export async function getProjectActivityProjectSummary(projectId: string): Promise<ProjectActivityProjectSummary | null> {
  const db = getAdminDb();
  if (db) {
    const { data, error } = await db
      .from<{ id: string; title: string; slug: string; status: string }>("projects")
      .select("id, title, slug, status")
      .eq("id", projectId)
      .maybeSingle();

    if (!error && data) return data;
  }

  const fallback = fallbackProjects.find((project) => project.id === projectId);
  return fallback ? { id: fallback.id, title: fallback.title, slug: fallback.slug, status: fallback.status } : null;
}

export async function getAdminProjectActivities(filters?: {
  projectId?: string;
  status?: string;
  visibility?: string;
  activityType?: string;
}): Promise<RepositoryResult<ProjectActivity[]>> {
  const db = getAdminDb();
  if (!db) {
    return { data: filterMockActivities(filters), source: "demo" };
  }

  let query = db
    .from<ProjectActivityRow>("project_activities")
    .select(projectActivityColumns)
    .order("activity_date", { ascending: false, nullsFirst: false });

  if (filters?.projectId) query = query.eq("project_id", filters.projectId);
  if (filters?.status && filters.status !== "all") query = query.eq("status", filters.status);
  if (filters?.visibility && filters.visibility !== "all") query = query.eq("visibility", filters.visibility);
  if (filters?.activityType && filters.activityType !== "all") query = query.eq("activity_type", filters.activityType);

  const { data, error } = await query;
  if (error || !data) {
    logReadOnlyFallback("project_activities (admin)", error);
    return { data: filterMockActivities(filters), source: "demo" };
  }

  return { data: data.map((row) => mapSupabaseProjectActivity(row)), source: "supabase" };
}

export async function getAdminProjectActivitiesByProjectId(projectId: string) {
  return getAdminProjectActivities({ projectId });
}

export async function getProjectActivityById(id: string): Promise<RepositoryResult<ProjectActivity | null>> {
  const db = getAdminDb();
  if (!db) return { data: mockProjectActivities.find((item) => item.id === id) ?? null, source: "demo" };

  const { data, error } = await db
    .from<ProjectActivityRow>("project_activities")
    .select(projectActivityColumns)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    logReadOnlyFallback("project_activity_detail", error);
    return { data: mockProjectActivities.find((item) => item.id === id) ?? null, source: "demo" };
  }

  return { data: data ? mapSupabaseProjectActivity(data) : null, source: "supabase" };
}

export async function getProjectActivityBySlug(slug: string): Promise<ProjectActivity | null> {
  const db = getAdminDb();
  if (!db) return mockProjectActivities.find((item) => item.slug === slug) ?? null;

  const { data, error } = await db
    .from<ProjectActivityRow>("project_activities")
    .select(projectActivityColumns)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return mockProjectActivities.find((item) => item.slug === slug) ?? null;
  return mapSupabaseProjectActivity(data);
}

export async function getProjectActivityEvents(activityId: string) {
  const db = getAdminDb();
  if (!db) return mockProjectActivityEvents.filter((event) => event.projectActivityId === activityId);

  const { data, error } = await db
    .from<ProjectActivityEventRow>("project_activity_events")
    .select(projectActivityEventColumns)
    .eq("project_activity_id", activityId)
    .order("created_at", { ascending: false });

  if (error || !data) return mockProjectActivityEvents.filter((event) => event.projectActivityId === activityId);
  return data.map((row) => mapProjectActivityEvent(row));
}

export async function getPublicProjectActivities(projectId: string): Promise<PublicProjectActivity[]> {
  const supabase = createSupabaseReadOnlyClient();
  if (!supabase) {
    return [];
  }

  const timeout = createReadOnlyAbortSignal();
  try {
    const { data, error } = await supabase
      .from("project_activities")
      .select(publicProjectActivityColumns)
      .eq("project_id", projectId)
      .eq("visibility", "public")
      .eq("status", "completed")
      .order("activity_date", { ascending: false, nullsFirst: false })
      .abortSignal(timeout.signal);

    if (error) {
      logReadOnlyFallback("project_activities_public", error);
      return [];
    }

    return (data ?? []).map((row) => mapPublicProjectActivity(row as unknown as ProjectActivityPublicRow));
  } catch {
    logReadOnlyFallback("project_activities_public");
    return [];
  } finally {
    timeout.clear();
  }
}

export async function getPublicProjectActivitiesForProjectIds(projectIds: string[]): Promise<PublicProjectActivity[]> {
  const uniqueProjectIds = Array.from(new Set(projectIds.filter(Boolean)));
  if (!uniqueProjectIds.length) return [];

  const supabase = createSupabaseReadOnlyClient();
  if (!supabase) {
    return [];
  }

  const timeout = createReadOnlyAbortSignal();
  try {
    const { data, error } = await supabase
      .from("project_activities")
      .select(publicProjectActivityColumns)
      .in("project_id", uniqueProjectIds)
      .eq("visibility", "public")
      .eq("status", "completed")
      .order("activity_date", { ascending: false, nullsFirst: false })
      .abortSignal(timeout.signal);

    if (error) {
      logReadOnlyFallback("project_activities_public_region", error);
      return [];
    }

    return (data ?? []).map((row) => mapPublicProjectActivity(row as unknown as ProjectActivityPublicRow));
  } catch {
    logReadOnlyFallback("project_activities_public_region");
    return [];
  } finally {
    timeout.clear();
  }
}

export async function getPublicProjectActivitiesByProjectSlug(slug: string): Promise<PublicProjectActivity[]> {
  const supabase = createSupabaseReadOnlyClient();
  if (!supabase) {
    return [];
  }

  const timeout = createReadOnlyAbortSignal();
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("id")
      .eq("slug", slug)
      .in("status", ["active", "completed"])
      .abortSignal(timeout.signal)
      .maybeSingle();

    if (error || !data) return [];
    return getPublicProjectActivities(String((data as { id: string }).id));
  } catch {
    return [];
  } finally {
    timeout.clear();
  }
}
