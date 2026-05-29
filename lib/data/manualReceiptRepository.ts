import "server-only";

import {
  manualReceiptDonationTypeLabels,
  manualReceiptOutputTypeLabels,
  manualReceiptPaymentMethodLabels,
  manualReceiptStatusLabels,
  mockManualReceiptEvents,
  mockManualReceipts,
  type ManualReceipt,
  type ManualReceiptDonationType,
  type ManualReceiptEvent,
  type ManualReceiptOutputType,
  type ManualReceiptPaymentMethod,
  type ManualReceiptStatus
} from "@/data/manualReceiptMock";
import { asAdminWriteClient } from "@/lib/data/adminWriteClient";
import type { RepositoryResult } from "@/lib/data/readOnlySupabase";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type ManualReceiptRow = {
  id: string;
  receipt_no: string;
  serial_no: string | null;
  sequence_no: number | null;
  booklet_no: string | null;
  output_type: ManualReceiptOutputType;
  status: ManualReceiptStatus;
  receipt_date: string | null;
  branch_name: string | null;
  unit_name: string | null;
  donor_type: string | null;
  donor_name: string | null;
  donor_phone: string | null;
  donor_email: string | null;
  donor_tax_id: string | null;
  donor_address: string | null;
  donation_type: ManualReceiptDonationType;
  donation_type_other: string | null;
  campaign_name: string | null;
  project_name: string | null;
  amount: number | string | null;
  currency: string | null;
  amount_in_words: string | null;
  payment_method: ManualReceiptPaymentMethod;
  payment_method_other: string | null;
  purpose: string | null;
  description: string | null;
  collector_name: string | null;
  collector_user_id: string | null;
  collector_role: string | null;
  accounting_officer_name: string | null;
  approved_by_name: string | null;
  created_by: string | null;
  updated_by: string | null;
  printed_count: number | null;
  last_printed_at: string | null;
  delivered_at: string | null;
  signed_at: string | null;
  archived_at: string | null;
  cancelled_at: string | null;
  cancelled_by: string | null;
  cancelled_reason: string | null;
  file_bucket: string | null;
  file_path: string | null;
  file_mime_type: string | null;
  file_size_bytes: number | string | null;
  file_sha256: string | null;
  generated_at: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string | null;
  updated_at: string | null;
};

export type ManualReceiptEventRow = {
  id: string;
  manual_receipt_id: string;
  event_type: string;
  old_status: ManualReceiptStatus | null;
  new_status: ManualReceiptStatus | null;
  actor_id: string | null;
  actor_role: string | null;
  note: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string | null;
};

export const manualReceiptColumns = [
  "id",
  "receipt_no",
  "serial_no",
  "sequence_no",
  "booklet_no",
  "output_type",
  "status",
  "receipt_date",
  "branch_name",
  "unit_name",
  "donor_type",
  "donor_name",
  "donor_phone",
  "donor_email",
  "donor_tax_id",
  "donor_address",
  "donation_type",
  "donation_type_other",
  "campaign_name",
  "project_name",
  "amount",
  "currency",
  "amount_in_words",
  "payment_method",
  "payment_method_other",
  "purpose",
  "description",
  "collector_name",
  "collector_user_id",
  "collector_role",
  "accounting_officer_name",
  "approved_by_name",
  "created_by",
  "updated_by",
  "printed_count",
  "last_printed_at",
  "delivered_at",
  "signed_at",
  "archived_at",
  "cancelled_at",
  "cancelled_by",
  "cancelled_reason",
  "file_bucket",
  "file_path",
  "file_mime_type",
  "file_size_bytes",
  "file_sha256",
  "generated_at",
  "metadata",
  "created_at",
  "updated_at"
].join(", ");

export const manualReceiptEventColumns = [
  "id",
  "manual_receipt_id",
  "event_type",
  "old_status",
  "new_status",
  "actor_id",
  "actor_role",
  "note",
  "metadata",
  "created_at"
].join(", ");

function parseNumber(value: number | string | null | undefined) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function maskTaxId(value: string | null | undefined) {
  if (!value) return undefined;
  const cleaned = value.replace(/\s+/g, "");
  if (cleaned.length <= 4) return "***";
  return `${cleaned.slice(0, 2)}${"*".repeat(Math.max(cleaned.length - 4, 3))}${cleaned.slice(-2)}`;
}

export function mapManualReceipt(row: ManualReceiptRow): ManualReceipt {
  return {
    id: row.id,
    receiptNo: row.receipt_no,
    serialNo: row.serial_no ?? undefined,
    sequenceNo: row.sequence_no ?? undefined,
    bookletNo: row.booklet_no ?? undefined,
    outputType: row.output_type,
    outputTypeLabel: manualReceiptOutputTypeLabels[row.output_type],
    status: row.status,
    statusLabel: manualReceiptStatusLabels[row.status],
    receiptDate: row.receipt_date ?? "Tarih güncellenecek",
    branchName: row.branch_name ?? undefined,
    unitName: row.unit_name ?? undefined,
    donorType: row.donor_type ?? undefined,
    donorName: row.donor_name ?? "Bağışçı",
    donorPhone: row.donor_phone ?? undefined,
    donorEmail: row.donor_email ?? undefined,
    donorTaxIdMasked: maskTaxId(row.donor_tax_id),
    donorAddress: row.donor_address ?? undefined,
    donationType: row.donation_type,
    donationTypeLabel: manualReceiptDonationTypeLabels[row.donation_type],
    donationTypeOther: row.donation_type_other ?? undefined,
    campaignName: row.campaign_name ?? undefined,
    projectName: row.project_name ?? undefined,
    amount: parseNumber(row.amount),
    currency: row.currency ?? "TRY",
    amountInWords: row.amount_in_words ?? undefined,
    paymentMethod: row.payment_method,
    paymentMethodLabel: manualReceiptPaymentMethodLabels[row.payment_method],
    paymentMethodOther: row.payment_method_other ?? undefined,
    purpose: row.purpose ?? undefined,
    description: row.description ?? undefined,
    collectorName: row.collector_name ?? undefined,
    accountingOfficerName: row.accounting_officer_name ?? undefined,
    approvedByName: row.approved_by_name ?? undefined,
    printedCount: row.printed_count ?? 0,
    lastPrintedAt: row.last_printed_at ?? undefined,
    deliveredAt: row.delivered_at ?? undefined,
    signedAt: row.signed_at ?? undefined,
    archivedAt: row.archived_at ?? undefined,
    cancelledAt: row.cancelled_at ?? undefined,
    cancelledReason: row.cancelled_reason ?? undefined,
    fileBucket: row.file_bucket ?? undefined,
    filePath: row.file_path ?? undefined,
    fileSizeBytes: row.file_size_bytes ? parseNumber(row.file_size_bytes) : undefined,
    fileSha256: row.file_sha256 ?? undefined,
    generatedAt: row.generated_at ?? undefined,
    createdAt: row.created_at ?? "Tarih güncellenecek",
    updatedAt: row.updated_at ?? "Tarih güncellenecek"
  };
}

function mapManualReceiptEvent(row: ManualReceiptEventRow): ManualReceiptEvent {
  return {
    id: row.id,
    manualReceiptId: row.manual_receipt_id,
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

function logManualReceiptReadFallback(scope: string, error?: { code?: string; message?: string; details?: string; hint?: string } | null) {
  console.warn("[manual-receipts:read]", "fallback_to_demo", {
    scope,
    code: error?.code ?? null,
    message: error?.message ?? null,
    details: error?.details ?? null,
    hint: error?.hint ?? null
  });
}

function isMissingManualReceiptTableError(error?: { code?: string; message?: string; details?: string; hint?: string } | null) {
  const message = [error?.code, error?.message, error?.details, error?.hint].filter(Boolean).join(" ");
  return /manual_receipts|does not exist|schema cache|PGRST205|42P01/i.test(message);
}

export async function getAdminManualReceiptsWithSource(): Promise<RepositoryResult<ManualReceipt[]>> {
  const db = getAdminDb();
  if (!db) return { data: mockManualReceipts, source: "demo" };

  const { data, error } = await db
    .from<ManualReceiptRow>("manual_receipts")
    .select(manualReceiptColumns)
    .order("receipt_date", { ascending: false });

  if (error || !data) {
    logManualReceiptReadFallback("admin_list", error);
    return { data: mockManualReceipts, source: "demo" };
  }
  return { data: data.map((row) => mapManualReceipt(row)), source: "supabase" };
}

export async function getAdminManualReceipts() {
  const result = await getAdminManualReceiptsWithSource();
  return result.data;
}

export async function getManualReceiptByIdWithSource(id: string): Promise<RepositoryResult<ManualReceipt | null>> {
  const db = getAdminDb();
  if (!db) return { data: mockManualReceipts.find((receipt) => receipt.id === id) ?? null, source: "demo" };

  const { data, error } = await db
    .from<ManualReceiptRow>("manual_receipts")
    .select(manualReceiptColumns)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    logManualReceiptReadFallback("detail_by_id", error);
    return { data: mockManualReceipts.find((receipt) => receipt.id === id) ?? null, source: "demo" };
  }

  if (!data) return { data: null, source: "supabase" };
  return { data: mapManualReceipt(data), source: "supabase" };
}

export async function getManualReceiptById(id: string) {
  const result = await getManualReceiptByIdWithSource(id);
  return result.data;
}

export async function getSupabaseManualReceiptById(id: string) {
  const db = getAdminDb();
  if (!db) return null;
  const { data, error } = await db
    .from<ManualReceiptRow>("manual_receipts")
    .select(manualReceiptColumns)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    logManualReceiptReadFallback("supabase_by_id", error);
    if (isMissingManualReceiptTableError(error)) {
      throw new Error("manual_receipts tablosu bulunamadı. 018_manual_physical_receipts.sql uygulanmalı.");
    }
    return null;
  }
  if (!data) return null;
  return mapManualReceipt(data);
}

export async function getManualReceiptByNo(receiptNo: string) {
  const db = getAdminDb();
  if (!db) return mockManualReceipts.find((receipt) => receipt.receiptNo === receiptNo) ?? null;

  const { data, error } = await db
    .from<ManualReceiptRow>("manual_receipts")
    .select(manualReceiptColumns)
    .eq("receipt_no", receiptNo)
    .maybeSingle();

  if (error || !data) return mockManualReceipts.find((receipt) => receipt.receiptNo === receiptNo) ?? null;
  return mapManualReceipt(data);
}

export async function getManualReceiptEvents(id: string) {
  const db = getAdminDb();
  if (!db) return mockManualReceiptEvents.filter((event) => event.manualReceiptId === id);

  const { data, error } = await db
    .from<ManualReceiptEventRow>("manual_receipt_events")
    .select(manualReceiptEventColumns)
    .eq("manual_receipt_id", id)
    .order("created_at", { ascending: false });

  if (error || !data) return mockManualReceiptEvents.filter((event) => event.manualReceiptId === id);
  return data.map((row) => mapManualReceiptEvent(row));
}
