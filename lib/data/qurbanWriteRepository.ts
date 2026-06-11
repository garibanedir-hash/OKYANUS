import "server-only";

import { logAdminAction } from "@/lib/audit/auditLogger";
import { asAdminWriteClient, type DbError } from "@/lib/data/adminWriteClient";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { QurbanCampaign, QurbanType } from "@/data/qurbanMock";
import type { LegalConsentAuditFields } from "@/lib/legal/consent";
import {
  qurbanCampaignStatusLabels,
  qurbanRegionLabels,
  qurbanTypeLabels
} from "@/data/qurbanMock";

type QurbanCampaignForOrderRow = {
  id: string;
  slug: string;
  title: string;
  type: QurbanType;
  region_type: "yurt_ici" | "yurt_disi";
  country: string | null;
  city_or_region: string | null;
  unit_price: number | string | null;
  currency: string | null;
  quota_total: number | null;
  quota_reserved: number | null;
  quota_completed: number | null;
  start_date: string | null;
  end_date: string | null;
  status: "draft" | "active" | "paused" | "completed" | "archived";
  short_description: string | null;
  description: string | null;
  delegation_text: string | null;
  transparency_note: string | null;
  cover_image_url: string | null;
  updated_at: string | null;
};

type QurbanOrderRpcResult = {
  order_id: string;
  order_no: string;
  total_amount: number | string;
  share_count: number;
};

type UserAccountRow = {
  id: string;
  auth_user_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  city: string | null;
  account_type: string;
  role: string;
  status: string;
};

type QueryResult<T> = Promise<{ data: T | null; error: DbError | null }>;
type RpcClient = {
  rpc: <T>(fn: string, args: Record<string, unknown>) => QueryResult<T>;
};

export type QurbanDonorContext = {
  userId: string;
  account: UserAccountRow | null;
};

export type CreateQurbanOrderInput = {
  campaignId: string;
  qurbanType: QurbanType;
  shareCount: number;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  donorCity?: string | null;
  note?: string | null;
  kvkkAccepted: boolean;
  contactPermission: boolean;
  delegationAccepted: boolean;
  legalConsent?: LegalConsentAuditFields | null;
};

export type CreateQurbanOrderContext = {
  userId?: string | null;
  donorAccountId?: string | null;
  source?: string;
};

export type CreateQurbanOrderResult = {
  orderId: string;
  orderNo: string;
  totalAmount: number;
  shareCount: number;
};

const campaignForOrderColumns = [
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

function mapCampaign(row: QurbanCampaignForOrderRow): QurbanCampaign {
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

function userFriendlyQurbanWriteError(error: DbError | null) {
  const message = error?.message ?? "";

  if (/kontenjan/i.test(message)) return "Bu kampanya için yeterli kontenjan kalmadı.";
  if (/aktif degil|aktif değil/i.test(message)) return "Seçtiğiniz kurban kampanyası şu anda aktif değil.";
  if (/dogrulanamadi|doğrulanamadı|permission|42501/i.test(message)) return "Hesap doğrulaması tamamlanamadı. Lütfen tekrar deneyin.";
  if (/hisse|adet/i.test(message)) return "Hisse/adet sayısı 1 ile 20 arasında olmalıdır.";

  return "Kurban başvurusu oluşturulamadı. Lütfen bilgileri kontrol edip tekrar deneyin.";
}

function mapLegalConsent(legalConsent: LegalConsentAuditFields) {
  return {
    kvkk_acknowledged: legalConsent.kvkkAcknowledged,
    explicit_consent_given: legalConsent.explicitConsentGiven,
    communication_permission_given: legalConsent.communicationPermissionGiven,
    consent_text_version: legalConsent.consentTextVersion,
    consent_given_at: legalConsent.consentGivenAt,
    consent_ip: legalConsent.consentIp,
    consent_user_agent: legalConsent.consentUserAgent,
    consent_metadata: legalConsent.consentMetadata
  };
}

export class QurbanWriteError extends Error {
  constructor(message: string, public code = "qurban_write_failed") {
    super(message);
    this.name = "QurbanWriteError";
  }
}

export async function getCurrentQurbanDonorContext(): Promise<QurbanDonorContext | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const db = supabase as unknown as {
    from: <T>(table: string) => {
      select: (columns?: string) => {
        eq: (column: string, value: string) => {
          maybeSingle: () => QueryResult<T>;
        };
      };
    };
  };

  const { data, error } = await db
    .from<UserAccountRow>("user_accounts")
    .select("id, auth_user_id, full_name, email, phone, city, account_type, role, status")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  return {
    userId: user.id,
    account: error ? null : data
  };
}

export async function getCampaignForOrder(campaignIdOrSlug: string): Promise<QurbanCampaign | null> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    throw new QurbanWriteError("Kurban kayıt sistemi şu anda hazır değil. Lütfen daha sonra tekrar deneyin.", "missing_admin_client");
  }

  const db = asAdminWriteClient(supabase);
  const byId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(campaignIdOrSlug);
  const query = db
    .from<QurbanCampaignForOrderRow>("qurban_campaigns")
    .select(campaignForOrderColumns)
    .eq(byId ? "id" : "slug", campaignIdOrSlug);

  const { data, error } = await query.maybeSingle();

  if (error || !data) {
    throw new QurbanWriteError("Seçilen kurban kampanyası bulunamadı.", "campaign_missing");
  }

  return mapCampaign(data as unknown as QurbanCampaignForOrderRow);
}

export async function createQurbanOrder(input: CreateQurbanOrderInput, context: CreateQurbanOrderContext): Promise<CreateQurbanOrderResult> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    throw new QurbanWriteError("Kurban kayıt sistemi şu anda hazır değil. Lütfen daha sonra tekrar deneyin.", "missing_admin_client");
  }

  const rpc = supabase as unknown as RpcClient;
  const { data, error } = await rpc.rpc<QurbanOrderRpcResult | QurbanOrderRpcResult[]>("create_qurban_order", {
    p_campaign_id: input.campaignId,
    p_qurban_type: input.qurbanType,
    p_share_count: input.shareCount,
    p_donor_account_id: context.donorAccountId ?? null,
    p_donor_name: input.donorName,
    p_donor_email: input.donorEmail,
    p_donor_phone: input.donorPhone,
    p_donor_city: input.donorCity ?? null,
    p_note: input.note ?? null,
    p_kvkk_accepted: input.kvkkAccepted,
    p_contact_permission: input.contactPermission,
    p_source: context.source ?? "web",
    p_created_by: context.userId ?? null
  });

  if (error || !data) {
    throw new QurbanWriteError(userFriendlyQurbanWriteError(error), error?.code ?? "rpc_failed");
  }

  const result = Array.isArray(data) ? data[0] : data;
  if (!result) {
    throw new QurbanWriteError("Kurban başvurusu oluşturulamadı. Lütfen tekrar deneyin.", "empty_rpc_result");
  }

  if (input.legalConsent) {
    const db = asAdminWriteClient(supabase);
    const { error: consentUpdateError } = await db
      .from<{ id: string }>("qurban_orders")
      .update(mapLegalConsent(input.legalConsent))
      .eq("id", result.order_id)
      .select("id")
      .single();

    if (consentUpdateError) {
      throw new QurbanWriteError("Kurban başvurusu onay kaydı tamamlanamadı. Lütfen ekibimizle iletişime geçin.", consentUpdateError.code ?? "consent_update_failed");
    }
  }

  if (context.userId) {
    const auditItems = [
      { action: "qurban.order.create", summary: "Kurban başvurusu oluşturuldu" },
      { action: "qurban.delegation.accept", summary: "Kurban vekaleti kabul edildi" },
      { action: "qurban.share.reserve", summary: "Kurban hisseleri rezerve edildi" },
      { action: "qurban.quota.reserve", summary: "Kampanya kontenjanı rezerve edildi" }
    ];

    for (const item of auditItems) {
      try {
        await logAdminAction({
          actorId: context.userId,
          action: item.action,
          entityType: "qurban_orders",
          entityId: result.order_id,
          summary: item.summary,
          metadata: {
            orderNo: result.order_no,
            shareCount: result.share_count,
            paymentStatus: "pending"
          }
        });
      } catch {
        if (process.env.NODE_ENV !== "production") {
          console.warn("[qurban-audit] Audit log could not be written.", {
            action: item.action
          });
        }
      }
    }
  }

  return {
    orderId: result.order_id,
    orderNo: result.order_no,
    totalAmount: parseNumber(result.total_amount),
    shareCount: result.share_count
  };
}

export async function createQurbanShares(orderId: string, campaignId: string, orderNo: string, count: number) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    throw new QurbanWriteError("Kurban hisse rezervasyonu için server bağlantısı hazır değil.", "missing_admin_client");
  }

  const db = asAdminWriteClient(supabase);
  const shares = Array.from({ length: count }, (_, index) => ({
    order_id: orderId,
    campaign_id: campaignId,
    share_no: `${orderNo}-${String(index + 1).padStart(2, "0")}`,
    share_index: index + 1,
    status: "payment_pending",
    reserved_at: new Date().toISOString()
  }));

  const { data, error } = await db.from<{ id: string }>("qurban_shares").insert(shares).select("id");
  if (error) {
    throw new QurbanWriteError("Kurban hisseleri rezerve edilemedi.", error.code ?? "share_insert_failed");
  }

  return data ?? [];
}

export async function appendQurbanStatusLog(payload: {
  orderId: string;
  eventType: string;
  oldStatus?: string | null;
  newStatus: string;
  actorId?: string | null;
  actorRole?: string | null;
  note?: string | null;
}) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return;

  const db = asAdminWriteClient(supabase);
  const { error } = await db.from("qurban_status_logs").insert({
    order_id: payload.orderId,
    old_status: payload.oldStatus ?? null,
    new_status: payload.newStatus,
    actor_id: payload.actorId ?? null,
    actor_role: payload.actorRole ?? null,
    event_type: payload.eventType,
    note: payload.note ?? null
  });

  if (error && process.env.NODE_ENV !== "production") {
    console.warn("[qurban-status] Status log could not be written.", {
      code: error.code ?? "no-code",
      eventType: payload.eventType
    });
  }
}

export async function reserveCampaignQuota(campaignId: string, shareCount: number) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    throw new QurbanWriteError("Kampanya kontenjanı güncellenemedi.", "missing_admin_client");
  }

  const rpc = supabase as unknown as {
    from: <T>(table: string) => {
      select: (columns?: string) => {
        eq: (column: string, value: string) => {
          maybeSingle: () => QueryResult<T>;
        };
      };
      update: (values: Record<string, unknown>) => {
        eq: (column: string, value: string) => {
          select: (columns?: string) => {
            single: () => QueryResult<T>;
          };
        };
      };
    };
  };

  const { data: campaign, error: readError } = await rpc
    .from<{ quota_reserved: number | null }>("qurban_campaigns")
    .select("quota_reserved")
    .eq("id", campaignId)
    .maybeSingle();

  if (readError || !campaign) {
    throw new QurbanWriteError("Kampanya kontenjanı okunamadı.", readError?.code ?? "quota_read_failed");
  }

  const nextReserved = parseInteger(campaign.quota_reserved) + shareCount;
  const { error } = await rpc
    .from("qurban_campaigns")
    .update({ quota_reserved: nextReserved, updated_at: new Date().toISOString() })
    .eq("id", campaignId)
    .select("id")
    .single();

  if (error) {
    throw new QurbanWriteError("Kampanya kontenjanı güncellenemedi.", error.code ?? "quota_update_failed");
  }
}
