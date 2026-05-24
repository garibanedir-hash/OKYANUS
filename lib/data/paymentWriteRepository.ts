import "server-only";

import { logAdminAction } from "@/lib/audit/auditLogger";
import { asAdminWriteClient, type DbError } from "@/lib/data/adminWriteClient";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  PaymentContextType,
  PaymentIntentStatus,
  PaymentProvider,
  ReceiptStatus,
  NotificationChannel,
  NotificationQueueStatus
} from "@/data/paymentMock";
import {
  getPaymentContextDisplayName,
  validatePaymentContextAmount,
  type PaymentIntentDraft
} from "@/lib/payments/paymentContext";

type PaymentEventType =
  | "created"
  | "initiated"
  | "provider_callback_received"
  | "paid"
  | "failed"
  | "cancelled"
  | "refunded"
  | "expired"
  | "manually_marked_paid"
  | "manually_cancelled";

type PaymentIntentWriteRow = {
  id: string;
  intent_no: string;
  context_type: PaymentContextType;
  context_id: string | null;
  donor_account_id: string | null;
  donor_name: string | null;
  donor_email: string | null;
  donor_phone: string | null;
  amount: number | string;
  currency: string | null;
  provider: PaymentProvider;
  provider_reference: string | null;
  idempotency_key: string | null;
  status: PaymentIntentStatus;
  metadata: Record<string, unknown> | null;
  expires_at: string | null;
  paid_at: string | null;
  failed_at: string | null;
  cancelled_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type ReceiptWriteRow = {
  id: string;
  receipt_no: string;
  payment_intent_id: string | null;
  context_type: PaymentContextType;
  context_id: string | null;
  donor_account_id: string | null;
  donor_name: string | null;
  donor_email: string | null;
  amount: number | string | null;
  currency: string | null;
  status: ReceiptStatus;
  created_at: string | null;
  updated_at: string | null;
};

type PaymentProviderEventRow = {
  id: string;
  provider: PaymentProvider;
  provider_event_id: string | null;
  event_type: string | null;
  signature_verified: boolean | null;
  processed: boolean | null;
  processing_error: string | null;
  received_at: string | null;
  processed_at: string | null;
  payload_summary: Record<string, unknown> | null;
};

export type PaymentIntentRecord = {
  id: string;
  intentNo: string;
  contextType: PaymentContextType;
  contextId: string | null;
  donorAccountId: string | null;
  donorName: string | null;
  donorEmail: string | null;
  donorPhone: string | null;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  providerReference: string | null;
  idempotencyKey: string | null;
  status: PaymentIntentStatus;
  metadata: Record<string, unknown>;
  expiresAt: string | null;
  paidAt: string | null;
  failedAt: string | null;
  cancelledAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type ReceiptRecord = {
  id: string;
  receiptNo: string;
  paymentIntentId: string | null;
  contextType: PaymentContextType;
  contextId: string | null;
  donorAccountId: string | null;
  donorName: string | null;
  donorEmail: string | null;
  amount: number;
  currency: string;
  status: ReceiptStatus;
  createdAt: string | null;
  updatedAt: string | null;
};

export type PaymentProviderEventRecord = {
  id: string;
  provider: PaymentProvider;
  providerEventId: string | null;
  eventType: string | null;
  signatureVerified: boolean;
  processed: boolean;
  processingError: string | null;
  receivedAt: string | null;
  processedAt: string | null;
  payloadSummary: Record<string, unknown>;
};

export type CreatePaymentIntentInput = {
  contextType: PaymentContextType;
  contextId?: string | null;
  donorAccountId?: string | null;
  donorName?: string | null;
  donorEmail?: string | null;
  donorPhone?: string | null;
  amount: number;
  currency?: string;
  provider?: PaymentProvider;
  providerReference?: string | null;
  idempotencyKey?: string | null;
  returnUrl?: string | null;
  cancelUrl?: string | null;
  metadata?: Record<string, unknown>;
  expiresAt?: string | null;
  status?: Extract<PaymentIntentStatus, "draft" | "pending" | "initiated">;
};

export type PaymentWriteContext = {
  actorId?: string | null;
  actorRole?: string | null;
};

export class PaymentWriteError extends Error {
  constructor(message: string, public code = "payment_write_failed") {
    super(message);
    this.name = "PaymentWriteError";
  }
}

const paymentIntentWriteColumns = [
  "id",
  "intent_no",
  "context_type",
  "context_id",
  "donor_account_id",
  "donor_name",
  "donor_email",
  "donor_phone",
  "amount",
  "currency",
  "provider",
  "provider_reference",
  "idempotency_key",
  "status",
  "metadata",
  "expires_at",
  "paid_at",
  "failed_at",
  "cancelled_at",
  "created_at",
  "updated_at"
].join(", ");

const receiptWriteColumns = [
  "id",
  "receipt_no",
  "payment_intent_id",
  "context_type",
  "context_id",
  "donor_account_id",
  "donor_name",
  "donor_email",
  "amount",
  "currency",
  "status",
  "created_at",
  "updated_at"
].join(", ");

const paymentProviderEventColumns = [
  "id",
  "provider",
  "provider_event_id",
  "event_type",
  "signature_verified",
  "processed",
  "processing_error",
  "received_at",
  "processed_at",
  "payload_summary"
].join(", ");

function parseNumber(value: number | string | null | undefined) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function normalizeEmail(value: string | null | undefined) {
  return value?.trim().toLowerCase() || null;
}

function getAdminDb() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    throw new PaymentWriteError("Ortak ödeme kayıt sistemi şu anda hazır değil. Lütfen daha sonra tekrar deneyin.", "missing_admin_client");
  }

  return asAdminWriteClient(supabase);
}

function friendlyPaymentWriteError(error: DbError | null, fallback: string) {
  const message = error?.message ?? "";

  if (/permission|42501|row-level/i.test(message)) return "Ödeme kaydı için yetki doğrulaması tamamlanamadı.";
  if (/duplicate|unique/i.test(message)) return "Bu ödeme kaydı için tekrar eden bir referans oluştu.";
  if (/foreign key|23503/i.test(message)) return "Ödeme kaydına bağlı hesap veya kayıt doğrulanamadı.";
  if (/check constraint|amount|23514/i.test(message)) return "Ödeme tutarı geçerli olmalıdır.";
  if (/not null|23502/i.test(message)) return "Ödeme kaydı için zorunlu bilgiler eksik.";

  return fallback;
}

function mapPaymentIntent(row: PaymentIntentWriteRow): PaymentIntentRecord {
  return {
    id: row.id,
    intentNo: row.intent_no,
    contextType: row.context_type,
    contextId: row.context_id,
    donorAccountId: row.donor_account_id,
    donorName: row.donor_name,
    donorEmail: row.donor_email,
    donorPhone: row.donor_phone,
    amount: parseNumber(row.amount),
    currency: row.currency ?? "TRY",
    provider: row.provider,
    providerReference: row.provider_reference,
    idempotencyKey: row.idempotency_key,
    status: row.status,
    metadata: row.metadata ?? {},
    expiresAt: row.expires_at,
    paidAt: row.paid_at,
    failedAt: row.failed_at,
    cancelledAt: row.cancelled_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapReceipt(row: ReceiptWriteRow): ReceiptRecord {
  return {
    id: row.id,
    receiptNo: row.receipt_no,
    paymentIntentId: row.payment_intent_id,
    contextType: row.context_type,
    contextId: row.context_id,
    donorAccountId: row.donor_account_id,
    donorName: row.donor_name,
    donorEmail: row.donor_email,
    amount: parseNumber(row.amount),
    currency: row.currency ?? "TRY",
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapPaymentProviderEvent(row: PaymentProviderEventRow): PaymentProviderEventRecord {
  return {
    id: row.id,
    provider: row.provider,
    providerEventId: row.provider_event_id,
    eventType: row.event_type,
    signatureVerified: Boolean(row.signature_verified),
    processed: Boolean(row.processed),
    processingError: row.processing_error,
    receivedAt: row.received_at,
    processedAt: row.processed_at,
    payloadSummary: row.payload_summary ?? {}
  };
}

function validatePaymentIntentInput(input: CreatePaymentIntentInput) {
  if (!input.contextType) throw new PaymentWriteError("Ödeme bağlamı zorunludur.", "context_required");
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new PaymentWriteError("Ödeme tutarı sıfırdan büyük olmalıdır.", "amount_invalid");
  }
}

function getReusablePaymentStatuses(): PaymentIntentStatus[] {
  return ["draft", "pending", "initiated", "requires_action"];
}

export async function getPaymentIntentById(id: string): Promise<PaymentIntentRecord | null> {
  const db = getAdminDb();
  const { data, error } = await db
    .from<PaymentIntentWriteRow>("payment_intents")
    .select(paymentIntentWriteColumns)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new PaymentWriteError(friendlyPaymentWriteError(error, "Ödeme kaydı okunamadı."), error.code ?? "payment_read_failed");
  }

  return data ? mapPaymentIntent(data) : null;
}

export async function getPaymentIntentByIntentNo(intentNo: string): Promise<PaymentIntentRecord | null> {
  const db = getAdminDb();
  const { data, error } = await db
    .from<PaymentIntentWriteRow>("payment_intents")
    .select(paymentIntentWriteColumns)
    .eq("intent_no", intentNo)
    .maybeSingle();

  if (error) {
    throw new PaymentWriteError(friendlyPaymentWriteError(error, "Ödeme kaydı okunamadı."), error.code ?? "payment_read_failed");
  }

  return data ? mapPaymentIntent(data) : null;
}

export async function getPaymentIntentByProviderReference(
  provider: PaymentProvider,
  providerReference: string
): Promise<PaymentIntentRecord | null> {
  const db = getAdminDb();
  const { data, error } = await db
    .from<PaymentIntentWriteRow>("payment_intents")
    .select(paymentIntentWriteColumns)
    .eq("provider", provider)
    .eq("provider_reference", providerReference)
    .maybeSingle();

  if (error) {
    throw new PaymentWriteError(friendlyPaymentWriteError(error, "Provider ödeme referansı okunamadı."), error.code ?? "payment_provider_reference_read_failed");
  }

  return data ? mapPaymentIntent(data) : null;
}

export async function findExistingPendingIntent(
  contextType: PaymentContextType,
  contextId?: string | null
): Promise<PaymentIntentRecord | null> {
  if (!contextId) return null;

  const db = getAdminDb();
  const { data, error } = await db
    .from<PaymentIntentWriteRow>("payment_intents")
    .select(paymentIntentWriteColumns)
    .eq("context_type", contextType)
    .eq("context_id", contextId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    throw new PaymentWriteError(
      friendlyPaymentWriteError(error, "Bağlama ait ödeme niyetleri okunamadı."),
      error.code ?? "payment_context_read_failed"
    );
  }

  const reusableStatuses = getReusablePaymentStatuses();
  const existing = (data ?? []).map((row) => mapPaymentIntent(row)).find((paymentIntent) => reusableStatuses.includes(paymentIntent.status));

  return existing ?? null;
}

export async function preventDuplicatePendingIntent(
  contextType: PaymentContextType,
  contextId?: string | null
): Promise<PaymentIntentRecord | null> {
  return findExistingPendingIntent(contextType, contextId);
}

export async function createPaymentIntent(
  input: CreatePaymentIntentInput,
  context: PaymentWriteContext = {}
): Promise<PaymentIntentRecord> {
  validatePaymentIntentInput(input);

  const db = getAdminDb();
  const idempotencyKey = input.idempotencyKey?.trim() || null;

  if (idempotencyKey) {
    const { data: existing, error: existingError } = await db
      .from<PaymentIntentWriteRow>("payment_intents")
      .select(paymentIntentWriteColumns)
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();

    if (existingError) {
      throw new PaymentWriteError(
        friendlyPaymentWriteError(existingError, "Ödeme idempotency kaydı okunamadı."),
        existingError.code ?? "payment_idempotency_read_failed"
      );
    }

    if (existing) return mapPaymentIntent(existing);
  }

  const { data, error } = await db
    .from<PaymentIntentWriteRow>("payment_intents")
    .insert({
      context_type: input.contextType,
      context_id: input.contextId ?? null,
      donor_account_id: input.donorAccountId ?? null,
      donor_name: input.donorName?.trim() || null,
      donor_email: normalizeEmail(input.donorEmail),
      donor_phone: input.donorPhone?.trim() || null,
      amount: input.amount,
      currency: input.currency ?? "TRY",
      provider: input.provider ?? "manual",
      provider_reference: input.providerReference?.trim() || null,
      idempotency_key: idempotencyKey,
      status: input.status ?? "pending",
      return_url: input.returnUrl ?? null,
      cancel_url: input.cancelUrl ?? null,
      metadata: input.metadata ?? {},
      expires_at: input.expiresAt ?? null
    })
    .select(paymentIntentWriteColumns)
    .single();

  if (error || !data) {
    throw new PaymentWriteError(
      friendlyPaymentWriteError(error, "Ödeme niyeti oluşturulamadı."),
      error?.code ?? "payment_intent_insert_failed"
    );
  }

  const paymentIntent = mapPaymentIntent(data);
  await appendPaymentEvent({
    paymentIntentId: paymentIntent.id,
    eventType: "created",
    newStatus: paymentIntent.status,
    provider: paymentIntent.provider,
    idempotencyKey,
    actorId: context.actorId ?? null,
    actorRole: context.actorRole ?? "server",
    note: "Provider bağımsız ödeme niyeti oluşturuldu."
  });
  await appendPaymentStatusLog({
    paymentIntentId: paymentIntent.id,
    newStatus: paymentIntent.status,
    eventType: "created",
    actorId: context.actorId ?? null,
    actorRole: context.actorRole ?? "server",
    note: "Ödeme niyeti oluşturuldu."
  });

  if (context.actorId) {
    await logAdminAction({
      actorId: context.actorId,
      action: "payment.intent.create",
      entityType: "payment_intents",
      entityId: paymentIntent.id,
      summary: "Ortak ödeme niyeti oluşturuldu",
      metadata: {
        intentNo: paymentIntent.intentNo,
        contextType: paymentIntent.contextType,
        amount: paymentIntent.amount,
        provider: paymentIntent.provider
      }
    });
  }

  return paymentIntent;
}

export async function createOrReusePendingPaymentIntent(
  context: PaymentIntentDraft,
  writeContext: PaymentWriteContext = {}
): Promise<PaymentIntentRecord> {
  try {
    validatePaymentContextAmount(context);
  } catch (error) {
    throw new PaymentWriteError(error instanceof Error ? error.message : "Ödeme bağlamı geçersiz.", "payment_context_invalid");
  }

  const existing = await findExistingPendingIntent(context.contextType, context.contextId);
  if (existing) return existing;

  const metadata = {
    ...context.metadata,
    contextDisplayName: getPaymentContextDisplayName(context.contextType)
  };

  return createPaymentIntent(
    {
      contextType: context.contextType,
      contextId: context.contextId,
      donorAccountId: context.donorAccountId,
      donorName: context.donorName,
      donorEmail: context.donorEmail,
      donorPhone: context.donorPhone,
      amount: context.amount,
      currency: context.currency,
      provider: context.provider,
      status: "pending",
      metadata
    },
    writeContext
  );
}

export async function createPaymentIntentForContext(
  context: PaymentIntentDraft,
  writeContext: PaymentWriteContext = {}
): Promise<PaymentIntentRecord> {
  return createOrReusePendingPaymentIntent(context, writeContext);
}

export async function attachProviderReferenceToPaymentIntent(
  paymentIntentId: string,
  provider: PaymentProvider,
  providerReference: string
): Promise<PaymentIntentRecord> {
  const current = await getPaymentIntentById(paymentIntentId);
  if (!current) throw new PaymentWriteError("Ödeme kaydı bulunamadı.", "payment_missing");

  const reference = providerReference.trim();
  if (!reference) throw new PaymentWriteError("Provider referansı zorunludur.", "provider_reference_required");

  if (current.provider === provider && current.providerReference === reference) return current;

  const now = new Date().toISOString();
  const db = getAdminDb();
  const { data, error } = await db
    .from<PaymentIntentWriteRow>("payment_intents")
    .update({
      provider,
      provider_reference: reference,
      updated_at: now
    })
    .eq("id", current.id)
    .select(paymentIntentWriteColumns)
    .single();

  if (error || !data) {
    throw new PaymentWriteError(
      friendlyPaymentWriteError(error, "Ödeme provider referansı güncellenemedi."),
      error?.code ?? "payment_provider_reference_update_failed"
    );
  }

  return mapPaymentIntent(data);
}

export async function markPaymentInitiated(
  paymentIntentId: string,
  providerReference: string,
  context: PaymentWriteContext = {}
): Promise<PaymentIntentRecord> {
  const current = await getPaymentIntentById(paymentIntentId);
  if (!current) throw new PaymentWriteError("Ödeme kaydı bulunamadı.", "payment_missing");

  const reference = providerReference.trim();
  if (!reference) throw new PaymentWriteError("Provider referansı zorunludur.", "provider_reference_required");

  if (["paid", "failed", "cancelled", "refunded", "expired"].includes(current.status)) return current;
  if (current.status === "initiated" && current.provider === "paytr" && current.providerReference === reference) return current;

  const now = new Date().toISOString();
  const db = getAdminDb();
  const { data, error } = await db
    .from<PaymentIntentWriteRow>("payment_intents")
    .update({
      status: "initiated",
      provider: "paytr",
      provider_reference: reference,
      updated_at: now
    })
    .eq("id", current.id)
    .select(paymentIntentWriteColumns)
    .single();

  if (error || !data) {
    throw new PaymentWriteError(
      friendlyPaymentWriteError(error, "Ödeme başlatıldı durumu kaydedilemedi."),
      error?.code ?? "payment_initiated_update_failed"
    );
  }

  const updated = mapPaymentIntent(data);
  await appendPaymentEvent({
    paymentIntentId: updated.id,
    eventType: "initiated",
    oldStatus: current.status,
    newStatus: updated.status,
    provider: updated.provider,
    providerEventId: reference,
    actorId: context.actorId ?? null,
    actorRole: context.actorRole ?? "server",
    note: "PayTR test iframe token akışı başlatıldı."
  });
  await appendPaymentStatusLog({
    paymentIntentId: updated.id,
    oldStatus: current.status,
    newStatus: updated.status,
    eventType: "initiated",
    actorId: context.actorId ?? null,
    actorRole: context.actorRole ?? "server",
    note: "PayTR test ödeme ekranı başlatıldı."
  });

  return updated;
}

export async function appendPaymentEvent(payload: {
  paymentIntentId: string;
  eventType: PaymentEventType;
  oldStatus?: string | null;
  newStatus?: string | null;
  provider?: PaymentProvider | null;
  providerEventId?: string | null;
  idempotencyKey?: string | null;
  rawEventSummary?: Record<string, unknown>;
  actorId?: string | null;
  actorRole?: string | null;
  note?: string | null;
}) {
  const db = getAdminDb();
  const { error } = await db.from("payment_events").insert({
    payment_intent_id: payload.paymentIntentId,
    event_type: payload.eventType,
    old_status: payload.oldStatus ?? null,
    new_status: payload.newStatus ?? null,
    provider: payload.provider ?? null,
    provider_event_id: payload.providerEventId ?? null,
    idempotency_key: payload.idempotencyKey ?? null,
    raw_event_summary: payload.rawEventSummary ?? {},
    actor_id: payload.actorId ?? null,
    actor_role: payload.actorRole ?? null,
    note: payload.note ?? null
  });

  if (error) {
    throw new PaymentWriteError(friendlyPaymentWriteError(error, "Ödeme olayı kaydedilemedi."), error.code ?? "payment_event_insert_failed");
  }
}

export async function appendPaymentStatusLog(payload: {
  paymentIntentId: string;
  oldStatus?: string | null;
  newStatus: string;
  eventType: string;
  actorId?: string | null;
  actorRole?: string | null;
  note?: string | null;
}) {
  const db = getAdminDb();
  const { error } = await db.from("payment_status_logs").insert({
    payment_intent_id: payload.paymentIntentId,
    old_status: payload.oldStatus ?? null,
    new_status: payload.newStatus,
    event_type: payload.eventType,
    actor_id: payload.actorId ?? null,
    actor_role: payload.actorRole ?? null,
    note: payload.note ?? null
  });

  if (error) {
    throw new PaymentWriteError(friendlyPaymentWriteError(error, "Ödeme durum logu kaydedilemedi."), error.code ?? "payment_status_log_insert_failed");
  }
}

async function updatePaymentStatus(input: {
  paymentIntentId: string;
  status: Extract<PaymentIntentStatus, "paid" | "failed" | "cancelled">;
  eventType: PaymentEventType;
  providerReference?: string | null;
  actorId?: string | null;
  actorRole?: string | null;
  note?: string | null;
}) {
  const current = await getPaymentIntentById(input.paymentIntentId);
  if (!current) throw new PaymentWriteError("Ödeme kaydı bulunamadı.", "payment_missing");
  if (current.status === input.status) return current;

  const now = new Date().toISOString();
  const timestampFields =
    input.status === "paid"
      ? { paid_at: now, failed_at: null, cancelled_at: null }
      : input.status === "failed"
        ? { failed_at: now }
        : { cancelled_at: now };

  const db = getAdminDb();
  const { data, error } = await db
    .from<PaymentIntentWriteRow>("payment_intents")
    .update({
      status: input.status,
      provider_reference: input.providerReference?.trim() || current.providerReference,
      updated_at: now,
      ...timestampFields
    })
    .eq("id", current.id)
    .select(paymentIntentWriteColumns)
    .single();

  if (error || !data) {
    throw new PaymentWriteError(
      friendlyPaymentWriteError(error, "Ödeme durumu güncellenemedi."),
      error?.code ?? "payment_status_update_failed"
    );
  }

  const updated = mapPaymentIntent(data);
  await appendPaymentEvent({
    paymentIntentId: updated.id,
    eventType: input.eventType,
    oldStatus: current.status,
    newStatus: updated.status,
    provider: updated.provider,
    actorId: input.actorId ?? null,
    actorRole: input.actorRole ?? "server",
    note: input.note ?? null
  });
  await appendPaymentStatusLog({
    paymentIntentId: updated.id,
    oldStatus: current.status,
    newStatus: updated.status,
    eventType: input.eventType,
    actorId: input.actorId ?? null,
    actorRole: input.actorRole ?? "server",
    note: input.note ?? null
  });

  return updated;
}

export async function markPaymentPaid(input: {
  paymentIntentId: string;
  providerReference?: string | null;
  actorId?: string | null;
  actorRole?: string | null;
  note?: string | null;
}) {
  return updatePaymentStatus({
    paymentIntentId: input.paymentIntentId,
    status: "paid",
    eventType: "manually_marked_paid",
    providerReference: input.providerReference ?? null,
    actorId: input.actorId ?? null,
    actorRole: input.actorRole ?? "admin",
    note: input.note ?? "Ödeme manuel olarak ödendi işaretlendi."
  });
}

export async function markPaymentPaidFromProvider(input: {
  paymentIntentId: string;
  providerReference?: string | null;
  actorId?: string | null;
  actorRole?: string | null;
  note?: string | null;
}) {
  return updatePaymentStatus({
    paymentIntentId: input.paymentIntentId,
    status: "paid",
    eventType: "paid",
    providerReference: input.providerReference ?? null,
    actorId: input.actorId ?? null,
    actorRole: input.actorRole ?? "provider_callback",
    note: input.note ?? "Provider callback ile ödeme onaylandı."
  });
}

export async function markPaymentFailed(input: {
  paymentIntentId: string;
  providerReference?: string | null;
  actorId?: string | null;
  actorRole?: string | null;
  note?: string | null;
}) {
  return updatePaymentStatus({
    paymentIntentId: input.paymentIntentId,
    status: "failed",
    eventType: "failed",
    providerReference: input.providerReference ?? null,
    actorId: input.actorId ?? null,
    actorRole: input.actorRole ?? "admin",
    note: input.note ?? "Ödeme başarısız olarak işaretlendi."
  });
}

export async function markPaymentCancelled(input: {
  paymentIntentId: string;
  providerReference?: string | null;
  actorId?: string | null;
  actorRole?: string | null;
  note?: string | null;
}) {
  return updatePaymentStatus({
    paymentIntentId: input.paymentIntentId,
    status: "cancelled",
    eventType: "manually_cancelled",
    providerReference: input.providerReference ?? null,
    actorId: input.actorId ?? null,
    actorRole: input.actorRole ?? "admin",
    note: input.note ?? "Ödeme manuel olarak iptal edildi."
  });
}

export async function prepareReceiptForPayment(input: {
  paymentIntentId: string;
  status?: Extract<ReceiptStatus, "pending" | "prepared">;
  metadata?: Record<string, unknown>;
}) {
  const paymentIntent = await getPaymentIntentById(input.paymentIntentId);
  if (!paymentIntent) throw new PaymentWriteError("Makbuz için ödeme kaydı bulunamadı.", "payment_missing");

  const db = getAdminDb();
  const { data: existing, error: existingError } = await db
    .from<ReceiptWriteRow>("receipts")
    .select(receiptWriteColumns)
    .eq("payment_intent_id", paymentIntent.id)
    .maybeSingle();

  if (existingError) {
    throw new PaymentWriteError(
      friendlyPaymentWriteError(existingError, "Makbuz hazırlık kaydı okunamadı."),
      existingError.code ?? "receipt_read_failed"
    );
  }

  if (existing) return mapReceipt(existing);

  const { data, error } = await db
    .from<ReceiptWriteRow>("receipts")
    .insert({
      payment_intent_id: paymentIntent.id,
      context_type: paymentIntent.contextType,
      context_id: paymentIntent.contextId,
      donor_account_id: paymentIntent.donorAccountId,
      donor_name: paymentIntent.donorName,
      donor_email: paymentIntent.donorEmail,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: input.status ?? "prepared",
      metadata: input.metadata ?? { source: "payment_intent" }
    })
    .select(receiptWriteColumns)
    .single();

  if (error || !data) {
    throw new PaymentWriteError(friendlyPaymentWriteError(error, "Makbuz hazırlık kaydı oluşturulamadı."), error?.code ?? "receipt_insert_failed");
  }

  return mapReceipt(data);
}

export async function getPaymentProviderEvent(
  provider: PaymentProvider,
  providerEventId: string
): Promise<PaymentProviderEventRecord | null> {
  const db = getAdminDb();
  const { data, error } = await db
    .from<PaymentProviderEventRow>("payment_provider_events")
    .select(paymentProviderEventColumns)
    .eq("provider", provider)
    .eq("provider_event_id", providerEventId)
    .maybeSingle();

  if (error) {
    throw new PaymentWriteError(
      friendlyPaymentWriteError(error, "Provider callback kaydı okunamadı."),
      error.code ?? "payment_provider_event_read_failed"
    );
  }

  return data ? mapPaymentProviderEvent(data) : null;
}

export async function recordPaymentProviderEvent(input: {
  provider: PaymentProvider;
  providerEventId?: string | null;
  eventType?: string | null;
  signatureVerified?: boolean;
  processed?: boolean;
  processingError?: string | null;
  payloadSummary?: Record<string, unknown>;
}) {
  const providerEventId = input.providerEventId?.trim() || null;

  if (providerEventId) {
    const existing = await getPaymentProviderEvent(input.provider, providerEventId);
    if (existing) {
      const db = getAdminDb();
      const { data, error } = await db
        .from<PaymentProviderEventRow>("payment_provider_events")
        .update({
          signature_verified: input.signatureVerified ?? existing.signatureVerified,
          processed: input.processed ?? existing.processed,
          processing_error: Object.prototype.hasOwnProperty.call(input, "processingError") ? (input.processingError ?? null) : existing.processingError,
          processed_at: input.processed ? new Date().toISOString() : existing.processedAt,
          payload_summary: input.payloadSummary ?? existing.payloadSummary
        })
        .eq("id", existing.id)
        .select(paymentProviderEventColumns)
        .single();

      if (error || !data) {
        throw new PaymentWriteError(
          friendlyPaymentWriteError(error, "Provider callback kaydı güncellenemedi."),
          error?.code ?? "payment_provider_event_update_failed"
        );
      }

      return { record: mapPaymentProviderEvent(data), duplicate: true };
    }
  }

  const db = getAdminDb();
  const { data, error } = await db
    .from<PaymentProviderEventRow>("payment_provider_events")
    .insert({
      provider: input.provider,
      provider_event_id: providerEventId,
      event_type: input.eventType ?? null,
      signature_verified: input.signatureVerified ?? false,
      processed: input.processed ?? false,
      processing_error: input.processingError ?? null,
      processed_at: input.processed ? new Date().toISOString() : null,
      payload_summary: input.payloadSummary ?? {}
    })
    .select(paymentProviderEventColumns)
    .single();

  if (error || !data) {
    throw new PaymentWriteError(
      friendlyPaymentWriteError(error, "Provider callback kaydı oluşturulamadı."),
      error?.code ?? "payment_provider_event_insert_failed"
    );
  }

  return { record: mapPaymentProviderEvent(data), duplicate: false };
}

export async function enqueueNotification(input: {
  contextType?: PaymentContextType | null;
  contextId?: string | null;
  paymentIntentId?: string | null;
  donorAccountId?: string | null;
  recipientEmail?: string | null;
  recipientPhone?: string | null;
  channel: NotificationChannel;
  templateKey: string;
  status?: NotificationQueueStatus;
  payload?: Record<string, unknown>;
  scheduledAt?: string | null;
}) {
  if (!input.templateKey.trim()) {
    throw new PaymentWriteError("Bildirim şablonu zorunludur.", "notification_template_required");
  }

  const db = getAdminDb();
  const { data, error } = await db
    .from<{ id: string }>("notification_queue")
    .insert({
      context_type: input.contextType ?? null,
      context_id: input.contextId ?? null,
      payment_intent_id: input.paymentIntentId ?? null,
      donor_account_id: input.donorAccountId ?? null,
      recipient_email: normalizeEmail(input.recipientEmail),
      recipient_phone: input.recipientPhone?.trim() || null,
      channel: input.channel,
      template_key: input.templateKey.trim(),
      status: input.status ?? "pending",
      payload: input.payload ?? {},
      scheduled_at: input.scheduledAt ?? null
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new PaymentWriteError(
      friendlyPaymentWriteError(error, "Bildirim kuyruğu kaydı oluşturulamadı."),
      error?.code ?? "notification_insert_failed"
    );
  }

  return { id: data.id };
}
