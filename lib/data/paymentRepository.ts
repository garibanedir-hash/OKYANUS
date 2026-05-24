import "server-only";

import {
  mockNotificationQueue,
  mockPaymentIntents,
  mockPaymentStats,
  mockReceipts,
  notificationChannelLabels,
  notificationQueueStatusLabels,
  paymentContextTypeLabels,
  paymentIntentStatusLabels,
  paymentProviderLabels,
  receiptStatusLabels,
  type NotificationChannel,
  type NotificationQueueItem,
  type NotificationQueueStatus,
  type PaymentContextType,
  type PaymentIntent,
  type PaymentIntentStatus,
  type PaymentProvider,
  type PaymentStats,
  type Receipt,
  type ReceiptStatus
} from "@/data/paymentMock";
import {
  createReadOnlyAbortSignal,
  logReadOnlyFallback,
  type RepositoryResult
} from "@/lib/data/readOnlySupabase";
import { asAdminWriteClient } from "@/lib/data/adminWriteClient";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type PaymentIntentRow = {
  id: string;
  intent_no: string;
  context_type: PaymentContextType;
  context_id: string | null;
  donor_account_id: string | null;
  donor_name: string | null;
  donor_email: string | null;
  donor_phone: string | null;
  amount: number | string | null;
  currency: string | null;
  provider: PaymentProvider;
  provider_reference: string | null;
  status: PaymentIntentStatus;
  metadata: Record<string, unknown> | null;
  expires_at: string | null;
  paid_at: string | null;
  failed_at: string | null;
  cancelled_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type ReceiptRow = {
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
  issued_at: string | null;
  cancelled_at: string | null;
  file_url: string | null;
  file_bucket: string | null;
  file_path: string | null;
  file_mime_type: string | null;
  file_size_bytes: number | string | null;
  file_sha256: string | null;
  generated_at: string | null;
  generated_by: string | null;
  issued_by: string | null;
  version: number | null;
  cancelled_reason: string | null;
  last_downloaded_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  payment_intents?: { intent_no?: string | null; status?: PaymentIntentStatus | null } | Array<{ intent_no?: string | null; status?: PaymentIntentStatus | null }> | null;
};

export type ReceiptWithPayment = {
  id: string;
  receiptNo: string;
  paymentIntentId: string | null;
  paymentIntentNo: string | null;
  paymentIntentStatus: PaymentIntentStatus | null;
  contextType: PaymentContextType;
  contextId: string | null;
  donorAccountId: string | null;
  donorName: string | null;
  donorEmail: string | null;
  amount: number;
  currency: string;
  status: ReceiptStatus;
  issuedAt: string | null;
  cancelledAt: string | null;
  generatedAt: string | null;
  fileBucket: string | null;
  filePath: string | null;
  fileMimeType: string | null;
  fileSizeBytes: number | null;
  fileSha256: string | null;
  version: number;
  cancelledReason: string | null;
  lastDownloadedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

type NotificationQueueRow = {
  id: string;
  context_type: PaymentContextType | null;
  context_id: string | null;
  payment_intent_id: string | null;
  donor_account_id: string | null;
  recipient_email: string | null;
  recipient_phone: string | null;
  channel: NotificationChannel;
  template_key: string;
  status: NotificationQueueStatus;
  scheduled_at: string | null;
  sent_at: string | null;
  failed_at: string | null;
  error_message: string | null;
  created_at: string | null;
  updated_at: string | null;
  payment_intents?: { intent_no?: string | null } | Array<{ intent_no?: string | null }> | null;
};

type PaymentReadClient = {
  from: <T>(table: string) => {
    select: (columns?: string) => PaymentReadQuery<T>;
  };
};

type PaymentReadQuery<T> = {
  eq: (column: string, value: string) => PaymentReadQuery<T>;
  order: (column: string, options?: { ascending?: boolean; nullsFirst?: boolean }) => PaymentReadQuery<T>;
  abortSignal: (signal: AbortSignal) => Promise<{ data: T[] | null; error: { code?: string; message?: string } | null }>;
};

const paymentIntentColumns = [
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
  "status",
  "metadata",
  "expires_at",
  "paid_at",
  "failed_at",
  "cancelled_at",
  "created_at",
  "updated_at"
].join(", ");

const receiptColumns = [
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
  "issued_at",
  "cancelled_at",
  "file_url",
  "file_bucket",
  "file_path",
  "file_mime_type",
  "file_size_bytes",
  "file_sha256",
  "generated_at",
  "generated_by",
  "issued_by",
  "version",
  "cancelled_reason",
  "last_downloaded_at",
  "created_at",
  "updated_at",
  "payment_intents(intent_no, status)"
].join(", ");

const notificationQueueColumns = [
  "id",
  "context_type",
  "context_id",
  "payment_intent_id",
  "donor_account_id",
  "recipient_email",
  "recipient_phone",
  "channel",
  "template_key",
  "status",
  "scheduled_at",
  "sent_at",
  "failed_at",
  "error_message",
  "created_at",
  "updated_at",
  "payment_intents(intent_no)"
].join(", ");

function parseNumber(value: number | string | null | undefined) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function firstRelation<T>(value: T | T[] | null | undefined): T | undefined {
  return Array.isArray(value) ? value[0] : value ?? undefined;
}

function maskName(value: string | null | undefined) {
  if (!value) return "Bağışçı";
  const trimmed = value.trim();
  if (!trimmed) return "Bağışçı";

  return trimmed
    .split(/\s+/)
    .map((part, index) => (index === 0 ? `${part.slice(0, 1)}***` : `${part.slice(0, 1)}.`))
    .join(" ");
}

function maskEmail(value: string | null | undefined) {
  if (!value || !value.includes("@")) return "b***@example.org";
  const [name, domain] = value.split("@");
  return `${name.slice(0, 1) || "b"}***@${domain}`;
}

function maskPhone(value: string | null | undefined) {
  if (!value) return "+90 5** *** ** **";
  return value.replace(/\d(?=\d{2})/g, "*");
}

function maskReference(value: string | null | undefined) {
  if (!value) return undefined;
  if (value.length <= 6) return "***";
  return `${value.slice(0, 3)}***${value.slice(-3)}`;
}

function metadataSummary(metadata: Record<string, unknown> | null | undefined) {
  if (!metadata) return "Ortak ödeme altyapısı kaydı";

  for (const key of ["orderNo", "sponsorshipNo", "applicationNo", "donationType", "summary", "description", "note", "context"]) {
    const value = metadata[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  const keys = Object.keys(metadata);
  return keys.length ? `${keys.length} metadata alanı` : "Ortak ödeme altyapısı kaydı";
}

function mapPaymentIntent(row: PaymentIntentRow): PaymentIntent {
  return {
    id: row.id,
    intentNo: row.intent_no,
    contextType: row.context_type,
    contextTypeLabel: paymentContextTypeLabels[row.context_type],
    contextId: row.context_id ?? undefined,
    donorAccountId: row.donor_account_id ?? "",
    donorDisplayName: maskName(row.donor_name),
    donorEmailMasked: maskEmail(row.donor_email),
    donorPhoneMasked: maskPhone(row.donor_phone),
    amount: parseNumber(row.amount),
    currency: row.currency ?? "TRY",
    provider: row.provider,
    providerLabel: paymentProviderLabels[row.provider],
    providerReferenceMasked: maskReference(row.provider_reference),
    status: row.status,
    statusLabel: paymentIntentStatusLabels[row.status],
    createdAt: row.created_at ?? "Tarih güncellenecek",
    updatedAt: row.updated_at ?? "Tarih güncellenecek",
    expiresAt: row.expires_at ?? undefined,
    paidAt: row.paid_at ?? undefined,
    failedAt: row.failed_at ?? undefined,
    cancelledAt: row.cancelled_at ?? undefined,
    metadataSummary: metadataSummary(row.metadata)
  };
}

function mapReceipt(row: ReceiptRow): Receipt {
  const paymentIntent = firstRelation(row.payment_intents);

  return {
    id: row.id,
    receiptNo: row.receipt_no,
    paymentIntentId: row.payment_intent_id ?? undefined,
    paymentIntentNo: paymentIntent?.intent_no ?? undefined,
    paymentIntentStatus: paymentIntent?.status ?? undefined,
    paymentIntentStatusLabel: paymentIntent?.status ? paymentIntentStatusLabels[paymentIntent.status] : undefined,
    contextType: row.context_type,
    contextTypeLabel: paymentContextTypeLabels[row.context_type],
    contextId: row.context_id ?? undefined,
    donorAccountId: row.donor_account_id ?? "",
    donorDisplayName: maskName(row.donor_name),
    donorEmailMasked: maskEmail(row.donor_email),
    amount: parseNumber(row.amount),
    currency: row.currency ?? "TRY",
    status: row.status,
    statusLabel: receiptStatusLabels[row.status],
    issuedAt: row.issued_at ?? undefined,
    cancelledAt: row.cancelled_at ?? undefined,
    generatedAt: row.generated_at ?? undefined,
    fileBucket: row.file_bucket ?? undefined,
    filePath: row.file_path ?? undefined,
    fileMimeType: row.file_mime_type ?? undefined,
    fileSizeBytes: row.file_size_bytes ? parseNumber(row.file_size_bytes) : undefined,
    fileSha256: row.file_sha256 ?? undefined,
    version: row.version ?? 1,
    hasPdf: Boolean(row.file_path),
    fileUrl: row.file_url ?? undefined,
    createdAt: row.created_at ?? "Tarih güncellenecek",
    updatedAt: row.updated_at ?? "Tarih güncellenecek"
  };
}

function mapReceiptWithPayment(row: ReceiptRow): ReceiptWithPayment {
  const paymentIntent = firstRelation(row.payment_intents);

  return {
    id: row.id,
    receiptNo: row.receipt_no,
    paymentIntentId: row.payment_intent_id,
    paymentIntentNo: paymentIntent?.intent_no ?? null,
    paymentIntentStatus: paymentIntent?.status ?? null,
    contextType: row.context_type,
    contextId: row.context_id,
    donorAccountId: row.donor_account_id,
    donorName: row.donor_name,
    donorEmail: row.donor_email,
    amount: parseNumber(row.amount),
    currency: row.currency ?? "TRY",
    status: row.status,
    issuedAt: row.issued_at,
    cancelledAt: row.cancelled_at,
    generatedAt: row.generated_at,
    fileBucket: row.file_bucket,
    filePath: row.file_path,
    fileMimeType: row.file_mime_type,
    fileSizeBytes: row.file_size_bytes ? parseNumber(row.file_size_bytes) : null,
    fileSha256: row.file_sha256,
    version: row.version ?? 1,
    cancelledReason: row.cancelled_reason,
    lastDownloadedAt: row.last_downloaded_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mockReceiptWithPayment(receiptNo: string): ReceiptWithPayment | null {
  const receipt = mockReceipts.find((item) => item.receiptNo === receiptNo);
  if (!receipt) return null;

  return {
    id: receipt.id,
    receiptNo: receipt.receiptNo,
    paymentIntentId: receipt.paymentIntentId ?? null,
    paymentIntentNo: receipt.paymentIntentNo ?? null,
    paymentIntentStatus: receipt.paymentIntentStatus ?? null,
    contextType: receipt.contextType,
    contextId: receipt.contextId ?? null,
    donorAccountId: receipt.donorAccountId || null,
    donorName: receipt.donorDisplayName,
    donorEmail: receipt.donorEmailMasked,
    amount: receipt.amount,
    currency: receipt.currency,
    status: receipt.status,
    issuedAt: receipt.issuedAt ?? null,
    cancelledAt: receipt.cancelledAt ?? null,
    generatedAt: receipt.generatedAt ?? null,
    fileBucket: receipt.fileBucket ?? null,
    filePath: receipt.filePath ?? null,
    fileMimeType: receipt.fileMimeType ?? null,
    fileSizeBytes: receipt.fileSizeBytes ?? null,
    fileSha256: receipt.fileSha256 ?? null,
    version: receipt.version ?? 1,
    cancelledReason: null,
    lastDownloadedAt: null,
    createdAt: receipt.createdAt,
    updatedAt: receipt.updatedAt
  };
}

function mapNotificationQueueItem(row: NotificationQueueRow): NotificationQueueItem {
  const paymentIntent = firstRelation(row.payment_intents);
  const contextTypeLabel = row.context_type ? paymentContextTypeLabels[row.context_type] : "Sistem";

  return {
    id: row.id,
    contextType: row.context_type ?? undefined,
    contextTypeLabel,
    contextId: row.context_id ?? undefined,
    paymentIntentId: row.payment_intent_id ?? undefined,
    paymentIntentNo: paymentIntent?.intent_no ?? undefined,
    donorAccountId: row.donor_account_id ?? "",
    recipientEmailMasked: maskEmail(row.recipient_email),
    recipientPhoneMasked: maskPhone(row.recipient_phone),
    channel: row.channel,
    channelLabel: notificationChannelLabels[row.channel],
    templateKey: row.template_key,
    status: row.status,
    statusLabel: notificationQueueStatusLabels[row.status],
    scheduledAt: row.scheduled_at ?? undefined,
    sentAt: row.sent_at ?? undefined,
    failedAt: row.failed_at ?? undefined,
    errorMessage: row.error_message ?? undefined,
    createdAt: row.created_at ?? "Tarih güncellenecek",
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

  return supabase as unknown as PaymentReadClient;
}

async function fetchAuthenticatedRows<T>(table: string, columns: string, orderColumn: string) {
  const supabase = await createAuthenticatedReadClient();
  if (!supabase) return null;

  const timeout = createReadOnlyAbortSignal();
  try {
    const { data, error } = await supabase
      .from<T>(table)
      .select(columns)
      .order(orderColumn, { ascending: false })
      .abortSignal(timeout.signal);

    if (error) {
      logReadOnlyFallback(table, error);
      return null;
    }

    return data ?? [];
  } catch {
    logReadOnlyFallback(table);
    return null;
  } finally {
    timeout.clear();
  }
}

async function fetchPaymentIntents() {
  const rows = await fetchAuthenticatedRows<PaymentIntentRow>("payment_intents", paymentIntentColumns, "created_at");
  return rows?.map((row) => mapPaymentIntent(row)) ?? null;
}

async function fetchReceipts() {
  const rows = await fetchAuthenticatedRows<ReceiptRow>("receipts", receiptColumns, "created_at");
  return rows?.map((row) => mapReceipt(row)) ?? null;
}

async function fetchNotificationQueue() {
  const rows = await fetchAuthenticatedRows<NotificationQueueRow>("notification_queue", notificationQueueColumns, "created_at");
  return rows?.map((row) => mapNotificationQueueItem(row)) ?? null;
}

function getStats(paymentIntents: PaymentIntent[], receipts: Receipt[], notifications: NotificationQueueItem[]): PaymentStats {
  return {
    totalIntents: paymentIntents.length,
    pendingIntents: paymentIntents.filter((item) => ["draft", "pending", "initiated", "requires_action"].includes(item.status)).length,
    paidIntents: paymentIntents.filter((item) => item.status === "paid").length,
    failedIntents: paymentIntents.filter((item) => item.status === "failed").length,
    pendingReceipts: receipts.filter((item) => item.status === "pending").length,
    queuedNotifications: notifications.filter((item) => ["pending", "processing"].includes(item.status)).length
  };
}

export async function getAdminPaymentIntentsWithSource(): Promise<RepositoryResult<PaymentIntent[]>> {
  const paymentIntents = await fetchPaymentIntents();
  if (paymentIntents) return { data: paymentIntents, source: "supabase" };
  return { data: mockPaymentIntents, source: "demo" };
}

export async function getAdminPaymentIntents(): Promise<PaymentIntent[]> {
  const result = await getAdminPaymentIntentsWithSource();
  return result.data;
}

async function fetchAdminReceiptsWithAdmin(): Promise<Receipt[] | null> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;

  const db = asAdminWriteClient(supabase);
  try {
    const { data, error } = await db
      .from<ReceiptRow>("receipts")
      .select(receiptColumns)
      .order("created_at", { ascending: false });

    if (error) {
      logReadOnlyFallback("receipts (admin)", error);
      return null;
    }
    return (data ?? []).map((row) => mapReceipt(row));
  } catch {
    logReadOnlyFallback("receipts (admin)");
    return null;
  }
}

export async function getAdminReceiptsWithSource(): Promise<RepositoryResult<Receipt[]>> {
  const receipts = await fetchAdminReceiptsWithAdmin();
  if (receipts) return { data: receipts, source: "supabase" };
  return { data: mockReceipts, source: "demo" };
}

export async function getAdminReceipts(): Promise<Receipt[]> {
  const result = await getAdminReceiptsWithSource();
  return result.data;
}

export async function getAdminNotificationQueueWithSource(): Promise<RepositoryResult<NotificationQueueItem[]>> {
  const notifications = await fetchNotificationQueue();
  if (notifications) return { data: notifications, source: "supabase" };
  return { data: mockNotificationQueue, source: "demo" };
}

export async function getAdminNotificationQueue(): Promise<NotificationQueueItem[]> {
  const result = await getAdminNotificationQueueWithSource();
  return result.data;
}

export async function getAdminPaymentStats(): Promise<PaymentStats> {
  const [paymentIntents, receipts, notifications] = await Promise.all([
    fetchPaymentIntents(),
    fetchReceipts(),
    fetchNotificationQueue()
  ]);

  if (!paymentIntents || !receipts || !notifications) return mockPaymentStats;
  return getStats(paymentIntents, receipts, notifications);
}

export async function getDonorPayments(accountId: string): Promise<PaymentIntent[]> {
  const paymentIntents = await fetchPaymentIntents();
  const source = paymentIntents ?? mockPaymentIntents;
  return source.filter((item) => item.donorAccountId === accountId);
}

export async function getDonorReceipts(accountId: string): Promise<Receipt[]> {
  const receipts = await fetchReceipts();
  const source = receipts ?? mockReceipts;
  return source.filter((item) => item.donorAccountId === accountId);
}

async function fetchReceiptByNoWithAdmin(receiptNo: string): Promise<ReceiptWithPayment | null> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;

  const db = asAdminWriteClient(supabase);
  const { data, error } = await db
    .from<ReceiptRow>("receipts")
    .select(receiptColumns)
    .eq("receipt_no", receiptNo)
    .maybeSingle();

  if (error || !data) return null;
  return mapReceiptWithPayment(data);
}

export async function getReceiptByNo(receiptNo: string): Promise<Receipt | null> {
  const receipt = await getReceiptWithPayment(receiptNo);
  if (!receipt) return null;

  return {
    id: receipt.id,
    receiptNo: receipt.receiptNo,
    paymentIntentId: receipt.paymentIntentId ?? undefined,
    paymentIntentNo: receipt.paymentIntentNo ?? undefined,
    paymentIntentStatus: receipt.paymentIntentStatus ?? undefined,
    paymentIntentStatusLabel: receipt.paymentIntentStatus ? paymentIntentStatusLabels[receipt.paymentIntentStatus] : undefined,
    contextType: receipt.contextType,
    contextTypeLabel: paymentContextTypeLabels[receipt.contextType],
    contextId: receipt.contextId ?? undefined,
    donorAccountId: receipt.donorAccountId ?? "",
    donorDisplayName: maskName(receipt.donorName),
    donorEmailMasked: maskEmail(receipt.donorEmail),
    amount: receipt.amount,
    currency: receipt.currency,
    status: receipt.status,
    statusLabel: receiptStatusLabels[receipt.status],
    issuedAt: receipt.issuedAt ?? undefined,
    cancelledAt: receipt.cancelledAt ?? undefined,
    generatedAt: receipt.generatedAt ?? undefined,
    fileBucket: receipt.fileBucket ?? undefined,
    filePath: receipt.filePath ?? undefined,
    fileMimeType: receipt.fileMimeType ?? undefined,
    fileSizeBytes: receipt.fileSizeBytes ?? undefined,
    fileSha256: receipt.fileSha256 ?? undefined,
    version: receipt.version,
    hasPdf: Boolean(receipt.filePath),
    createdAt: receipt.createdAt ?? "Tarih güncellenecek",
    updatedAt: receipt.updatedAt ?? "Tarih güncellenecek"
  };
}

export async function getReceiptWithPayment(receiptNo: string): Promise<ReceiptWithPayment | null> {
  const receipt = await fetchReceiptByNoWithAdmin(receiptNo);
  return receipt ?? mockReceiptWithPayment(receiptNo);
}

export async function getSupabaseReceiptWithPayment(receiptNo: string): Promise<ReceiptWithPayment | null> {
  return fetchReceiptByNoWithAdmin(receiptNo);
}

export async function getReceiptForDownload(
  receiptNo: string,
  viewerContext: {
    isAdmin?: boolean;
    accountId?: string | null;
  }
): Promise<ReceiptWithPayment | null> {
  const receipt = await getReceiptWithPayment(receiptNo);
  if (!receipt) return null;

  if (viewerContext.isAdmin) return receipt;
  if (viewerContext.accountId && receipt.donorAccountId && viewerContext.accountId === receipt.donorAccountId) return receipt;

  return null;
}
