import "server-only";

import {
  mockQurbanCampaigns,
  mockQurbanOperations,
  mockQurbanOrders,
  mockQurbanStats,
  qurbanCampaignStatusLabels,
  qurbanDelegationStatusLabels,
  qurbanOperationStatusLabels,
  qurbanOrderStatusLabels,
  qurbanPaymentStatusLabels,
  qurbanRegionLabels,
  qurbanTypeLabels,
  type QurbanCampaign,
  type QurbanCampaignStatus,
  type QurbanDelegationStatus,
  type QurbanOperation,
  type QurbanOperationStatus,
  type QurbanOrder,
  type QurbanOrderStatus,
  type QurbanPaymentStatus,
  type QurbanRegionType,
  type QurbanStats,
  type QurbanType
} from "@/data/qurbanMock";
import {
  createReadOnlyAbortSignal,
  createSupabaseReadOnlyClient,
  logReadOnlyFallback,
  type RepositoryResult
} from "@/lib/data/readOnlySupabase";
import { isAdminDemoMode } from "@/config/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SupabaseQurbanCampaignRow = {
  id: string;
  slug: string;
  title: string;
  type: QurbanType;
  region_type: QurbanRegionType;
  country: string | null;
  city_or_region: string | null;
  unit_price: number | string | null;
  currency: string | null;
  quota_total: number | null;
  quota_reserved: number | null;
  quota_completed: number | null;
  start_date: string | null;
  end_date: string | null;
  status: QurbanCampaignStatus;
  short_description: string | null;
  description: string | null;
  delegation_text: string | null;
  transparency_note: string | null;
  cover_image_url: string | null;
  updated_at: string | null;
};

type SupabaseQurbanOrderRow = {
  id: string;
  order_no: string | null;
  campaign_id: string | null;
  donor_account_id: string | null;
  donor_name: string | null;
  donor_email: string | null;
  donor_phone: string | null;
  donor_city: string | null;
  qurban_type: QurbanType | null;
  share_count: number | null;
  total_amount: number | string | null;
  currency: string | null;
  payment_status: QurbanPaymentStatus;
  order_status: QurbanOrderStatus;
  delegation_status: QurbanDelegationStatus;
  delegation_accepted_at: string | null;
  note: string | null;
  receipt_status: string | null;
  created_at: string | null;
  qurban_campaigns?: { title?: string | null } | Array<{ title?: string | null }> | null;
};

type SupabaseQurbanOperationRow = {
  id: string;
  campaign_id: string | null;
  operation_no: string | null;
  country: string | null;
  city_or_region: string | null;
  slaughter_location: string | null;
  distribution_area: string | null;
  planned_slaughter_date: string | null;
  actual_slaughter_date: string | null;
  responsible_coordinator_id: string | null;
  responsible_staff_id: string | null;
  status: QurbanOperationStatus;
  total_shares: number | null;
  completed_shares: number | null;
  notes: string | null;
  updated_at: string | null;
  qurban_campaigns?: { title?: string | null } | Array<{ title?: string | null }> | null;
};

type QurbanReadClient = {
  from: <T>(table: string) => {
    select: (columns?: string) => QurbanReadQuery<T>;
  };
};

type QurbanReadQuery<T> = {
  eq: (column: string, value: string) => QurbanReadQuery<T>;
  order: (column: string, options?: { ascending?: boolean; nullsFirst?: boolean }) => QurbanReadQuery<T>;
  abortSignal: (signal: AbortSignal) => Promise<{ data: T[] | null; error: { code?: string; message?: string } | null }>;
};

const qurbanCampaignColumns = [
  "id",
  "slug",
  "title",
  "type",
  "region_type",
  "country",
  "city_or_region",
  "unit_price",
  "currency",
  "quota_total",
  "quota_reserved",
  "quota_completed",
  "start_date",
  "end_date",
  "status",
  "short_description",
  "description",
  "delegation_text",
  "transparency_note",
  "cover_image_url",
  "updated_at"
].join(", ");

const qurbanOrderColumns = [
  "id",
  "order_no",
  "campaign_id",
  "donor_account_id",
  "donor_name",
  "donor_email",
  "donor_phone",
  "donor_city",
  "qurban_type",
  "share_count",
  "total_amount",
  "currency",
  "payment_status",
  "order_status",
  "delegation_status",
  "delegation_accepted_at",
  "note",
  "receipt_status",
  "created_at",
  "qurban_campaigns(title)"
].join(", ");

const qurbanOperationColumns = [
  "id",
  "campaign_id",
  "operation_no",
  "country",
  "city_or_region",
  "slaughter_location",
  "distribution_area",
  "planned_slaughter_date",
  "actual_slaughter_date",
  "responsible_coordinator_id",
  "responsible_staff_id",
  "status",
  "total_shares",
  "completed_shares",
  "notes",
  "updated_at",
  "qurban_campaigns(title)"
].join(", ");

function parseNumber(value: number | string | null | undefined) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function parseInteger(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function firstRelationTitle(value: SupabaseQurbanOrderRow["qurban_campaigns"] | SupabaseQurbanOperationRow["qurban_campaigns"]) {
  if (Array.isArray(value)) return value[0]?.title ?? "Kampanya bilgisi";
  return value?.title ?? "Kampanya bilgisi";
}

function maskEmail(value: string | null | undefined) {
  if (!value || !value.includes("@")) return "g***@example.org";
  const [name, domain] = value.split("@");
  return `${name.slice(0, 1) || "g"}***@${domain}`;
}

function maskPhone(value: string | null | undefined) {
  if (!value) return "+90 5** *** ** **";
  return value.replace(/\d(?=\d{2})/g, "*");
}

function mapCampaign(row: SupabaseQurbanCampaignRow): QurbanCampaign {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    type: row.type,
    typeLabel: qurbanTypeLabels[row.type],
    regionType: row.region_type,
    regionLabel: qurbanRegionLabels[row.region_type],
    country: row.country ?? "Bölge güncellenecek",
    cityOrRegion: row.city_or_region ?? "Saha bilgisi güncellenecek",
    unitPrice: parseNumber(row.unit_price),
    currency: row.currency ?? "TRY",
    quotaTotal: parseInteger(row.quota_total),
    quotaReserved: parseInteger(row.quota_reserved),
    quotaCompleted: parseInteger(row.quota_completed),
    startDate: row.start_date ?? "Tarih güncellenecek",
    endDate: row.end_date ?? "Tarih güncellenecek",
    status: row.status,
    statusLabel: qurbanCampaignStatusLabels[row.status],
    shortDescription: row.short_description ?? "Kurban kampanyası açıklaması güncellenecek.",
    description: row.description ?? row.short_description ?? "Kurban kampanyası detayları güncellenecek.",
    delegationText: row.delegation_text ?? "Vekalet metni production öncesi onaylanmalıdır.",
    transparencyNote: row.transparency_note ?? "Vekalet, kesim ve dağıtım süreci kayıt altında izlenir.",
    coverImageUrl: row.cover_image_url ?? undefined,
    updatedAt: row.updated_at ?? "Tarih güncellenecek"
  };
}

function mapOrder(row: SupabaseQurbanOrderRow): QurbanOrder {
  const qurbanType = row.qurban_type ?? "genel";
  const donorDisplayName = row.donor_name ? `${row.donor_name.slice(0, 1)}***` : "Bağışçı";

  return {
    id: row.id,
    orderNo: row.order_no ?? row.id.slice(0, 8),
    campaignId: row.campaign_id ?? "",
    campaignTitle: firstRelationTitle(row.qurban_campaigns),
    donorAccountId: row.donor_account_id ?? "",
    donorDisplayName,
    donorEmailMasked: maskEmail(row.donor_email),
    donorPhoneMasked: maskPhone(row.donor_phone),
    donorCity: row.donor_city ?? "Şehir bilgisi yok",
    qurbanType,
    qurbanTypeLabel: qurbanTypeLabels[qurbanType],
    shareCount: parseInteger(row.share_count) || 1,
    totalAmount: parseNumber(row.total_amount),
    currency: row.currency ?? "TRY",
    paymentStatus: row.payment_status,
    paymentStatusLabel: qurbanPaymentStatusLabels[row.payment_status],
    orderStatus: row.order_status,
    orderStatusLabel: qurbanOrderStatusLabels[row.order_status],
    delegationStatus: row.delegation_status,
    delegationStatusLabel: qurbanDelegationStatusLabels[row.delegation_status],
    delegationAcceptedAt: row.delegation_accepted_at ?? undefined,
    note: row.note ?? "",
    receiptStatus: row.receipt_status ?? "Makbuz durumu beklemede",
    createdAt: row.created_at ?? "Tarih güncellenecek"
  };
}

function mapOperation(row: SupabaseQurbanOperationRow): QurbanOperation {
  return {
    id: row.id,
    campaignId: row.campaign_id ?? "",
    campaignTitle: firstRelationTitle(row.qurban_campaigns),
    operationNo: row.operation_no ?? row.id.slice(0, 8),
    country: row.country ?? "Bölge güncellenecek",
    cityOrRegion: row.city_or_region ?? "Saha bilgisi güncellenecek",
    slaughterLocation: row.slaughter_location ?? "Kesim noktası güncellenecek",
    distributionArea: row.distribution_area ?? "Dağıtım alanı güncellenecek",
    plannedSlaughterDate: row.planned_slaughter_date ?? "Tarih güncellenecek",
    actualSlaughterDate: row.actual_slaughter_date ?? undefined,
    responsibleCoordinatorId: row.responsible_coordinator_id ?? "",
    responsibleCoordinatorName: "Koordinatör hesabı",
    responsibleStaffId: row.responsible_staff_id ?? "",
    responsibleStaffName: "Personel hesabı",
    status: row.status,
    statusLabel: qurbanOperationStatusLabels[row.status],
    totalShares: parseInteger(row.total_shares),
    completedShares: parseInteger(row.completed_shares),
    notes: row.notes ?? "",
    updatedAt: row.updated_at ?? "Tarih güncellenecek"
  };
}

async function createAuthenticatedReadClient() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  return supabase as unknown as QurbanReadClient;
}

async function fetchQurbanCampaigns(statuses?: QurbanCampaignStatus[]) {
  const supabase = createSupabaseReadOnlyClient();
  if (!supabase) return null;

  const timeout = createReadOnlyAbortSignal();
  try {
    let query = supabase
      .from("qurban_campaigns")
      .select(qurbanCampaignColumns)
      .order("updated_at", { ascending: false });

    if (statuses?.length) {
      query = query.in("status", statuses);
    }

    const { data, error } = await query.abortSignal(timeout.signal);

    if (error) {
      logReadOnlyFallback("qurban-campaigns", error);
      return null;
    }

    return (data ?? []).map((row) => mapCampaign(row as unknown as SupabaseQurbanCampaignRow));
  } catch {
    logReadOnlyFallback("qurban-campaigns");
    return null;
  } finally {
    timeout.clear();
  }
}

async function fetchQurbanCampaignBySlug(slug: string) {
  const supabase = createSupabaseReadOnlyClient();
  if (!supabase) return null;

  const timeout = createReadOnlyAbortSignal();
  try {
    const { data, error } = await supabase
      .from("qurban_campaigns")
      .select(qurbanCampaignColumns)
      .eq("slug", slug)
      .in("status", ["active", "completed"])
      .abortSignal(timeout.signal)
      .maybeSingle();

    if (error) {
      logReadOnlyFallback("qurban-campaign-detail", error);
      return null;
    }

    return data ? mapCampaign(data as unknown as SupabaseQurbanCampaignRow) : null;
  } catch {
    logReadOnlyFallback("qurban-campaign-detail");
    return null;
  } finally {
    timeout.clear();
  }
}

async function fetchAdminOrders() {
  const supabase = await createAuthenticatedReadClient();
  if (!supabase) return null;

  const timeout = createReadOnlyAbortSignal();
  try {
    const { data, error } = await supabase
      .from("qurban_orders")
      .select(qurbanOrderColumns)
      .order("created_at", { ascending: false })
      .abortSignal(timeout.signal);

    if (error) {
      logReadOnlyFallback("qurban-orders", error);
      return null;
    }

    return (data ?? []).map((row) => mapOrder(row as unknown as SupabaseQurbanOrderRow));
  } catch {
    logReadOnlyFallback("qurban-orders");
    return null;
  } finally {
    timeout.clear();
  }
}

async function fetchAdminOperations() {
  const supabase = await createAuthenticatedReadClient();
  if (!supabase) return null;

  const timeout = createReadOnlyAbortSignal();
  try {
    const { data, error } = await supabase
      .from("qurban_operations")
      .select(qurbanOperationColumns)
      .order("planned_slaughter_date", { ascending: true })
      .abortSignal(timeout.signal);

    if (error) {
      logReadOnlyFallback("qurban-operations", error);
      return null;
    }

    return (data ?? []).map((row) => mapOperation(row as unknown as SupabaseQurbanOperationRow));
  } catch {
    logReadOnlyFallback("qurban-operations");
    return null;
  } finally {
    timeout.clear();
  }
}

async function fetchCurrentDonorOrders() {
  const supabase = await createAuthenticatedReadClient();
  if (!supabase) return null;

  const timeout = createReadOnlyAbortSignal();
  try {
    const { data, error } = await supabase
      .from<SupabaseQurbanOrderRow>("qurban_orders")
      .select(qurbanOrderColumns)
      .order("created_at", { ascending: false })
      .abortSignal(timeout.signal);

    if (error) {
      logReadOnlyFallback("qurban-donor-orders", error);
      return null;
    }

    return (data ?? []).map((row) => mapOrder(row as unknown as SupabaseQurbanOrderRow));
  } catch {
    logReadOnlyFallback("qurban-donor-orders");
    return null;
  } finally {
    timeout.clear();
  }
}

export async function getQurbanCampaignsWithSource(): Promise<RepositoryResult<QurbanCampaign[]>> {
  const supabaseCampaigns = await fetchQurbanCampaigns();

  if (supabaseCampaigns) {
    return { data: supabaseCampaigns, source: "supabase" };
  }

  return { data: mockQurbanCampaigns, source: "demo" };
}

export async function getQurbanCampaigns() {
  const result = await getQurbanCampaignsWithSource();
  return result.data;
}

export async function getActiveQurbanCampaignsWithSource(): Promise<RepositoryResult<QurbanCampaign[]>> {
  const supabaseCampaigns = await fetchQurbanCampaigns(["active"]);

  if (supabaseCampaigns) {
    return { data: supabaseCampaigns, source: "supabase" };
  }

  return { data: mockQurbanCampaigns.filter((campaign) => campaign.status === "active"), source: "demo" };
}

export async function getActiveQurbanCampaigns() {
  const result = await getActiveQurbanCampaignsWithSource();
  return result.data;
}

export async function getQurbanCampaignBySlugWithSource(slug: string): Promise<RepositoryResult<QurbanCampaign | undefined>> {
  const supabaseCampaign = await fetchQurbanCampaignBySlug(slug);

  if (supabaseCampaign) {
    return { data: supabaseCampaign, source: "supabase" };
  }

  return {
    data: mockQurbanCampaigns.find((campaign) => campaign.slug === slug && ["active", "completed"].includes(campaign.status)),
    source: "demo"
  };
}

export async function getQurbanCampaignBySlug(slug: string) {
  const result = await getQurbanCampaignBySlugWithSource(slug);
  return result.data;
}

export async function getQurbanStats(): Promise<QurbanStats> {
  const orders = await fetchAdminOrders();
  if (!orders) return mockQurbanStats;

  return {
    totalOrders: orders.length,
    totalShares: orders.reduce((sum, order) => sum + order.shareCount, 0),
    delegationPending: orders.filter((order) => order.delegationStatus === "pending").length,
    paymentPending: orders.filter((order) => order.paymentStatus === "pending").length,
    scheduled: orders.filter((order) => order.orderStatus === "scheduled").length,
    slaughtered: orders.filter((order) => ["slaughtered", "distributed", "completed"].includes(order.orderStatus)).length,
    distributed: orders.filter((order) => ["distributed", "completed"].includes(order.orderStatus)).length,
    notificationPending: orders.filter((order) => !["completed", "cancelled"].includes(order.orderStatus)).length,
    regionBreakdown: mockQurbanStats.regionBreakdown,
    typeBreakdown: mockQurbanStats.typeBreakdown
  };
}

export async function getAdminQurbanOrdersWithSource(): Promise<RepositoryResult<QurbanOrder[]>> {
  const orders = await fetchAdminOrders();
  if (orders) return { data: orders, source: "supabase" };
  return { data: mockQurbanOrders, source: "demo" };
}

export async function getAdminQurbanOrders() {
  const result = await getAdminQurbanOrdersWithSource();
  return result.data;
}

export async function getAdminQurbanOperationsWithSource(): Promise<RepositoryResult<QurbanOperation[]>> {
  const operations = await fetchAdminOperations();
  if (operations) return { data: operations, source: "supabase" };
  return { data: mockQurbanOperations, source: "demo" };
}

export async function getAdminQurbanOperations() {
  const result = await getAdminQurbanOperationsWithSource();
  return result.data;
}

export async function getDonorQurbanOrders(accountId: string) {
  const orders = await fetchAdminOrders();
  const source = orders ?? mockQurbanOrders;
  return source.filter((order) => order.donorAccountId === accountId);
}

export async function getCurrentDonorQurbanOrdersWithSource(): Promise<RepositoryResult<QurbanOrder[]>> {
  const orders = await fetchCurrentDonorOrders();

  if (orders) {
    return { data: orders, source: "supabase" };
  }

  return {
    data: isAdminDemoMode ? mockQurbanOrders.filter((order) => order.donorAccountId === "demo-donor-account") : [],
    source: "demo"
  };
}

export async function getCurrentDonorQurbanOrders() {
  const result = await getCurrentDonorQurbanOrdersWithSource();
  return result.data;
}

export async function getCoordinatorQurbanOperations(accountId: string) {
  const operations = await fetchAdminOperations();
  const source = operations ?? mockQurbanOperations;
  return source.filter((operation) => operation.responsibleCoordinatorId === accountId);
}

export async function getStaffQurbanTasks(accountId: string) {
  const operations = await fetchAdminOperations();
  const source = operations ?? mockQurbanOperations;
  return source.filter((operation) => operation.responsibleStaffId === accountId);
}
