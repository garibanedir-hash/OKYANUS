import "server-only";

import type {
  ManualReceiptDonationType,
  ManualReceiptOutputType,
  ManualReceiptPaymentMethod,
  ManualReceiptStatus
} from "@/data/manualReceiptMock";
import { asAdminWriteClient, type DbError } from "@/lib/data/adminWriteClient";
import {
  manualReceiptColumns,
  mapManualReceipt,
  type ManualReceiptRow
} from "@/lib/data/manualReceiptRepository";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type ManualReceiptWriteInput = {
  serialNo?: string | null;
  sequenceNo?: number | null;
  bookletNo?: string | null;
  outputType: ManualReceiptOutputType;
  receiptDate: string;
  branchName?: string | null;
  unitName?: string | null;
  donorType?: string | null;
  donorName: string;
  donorPhone?: string | null;
  donorEmail?: string | null;
  donorTaxId?: string | null;
  donorAddress?: string | null;
  donationType: ManualReceiptDonationType;
  donationTypeOther?: string | null;
  campaignName?: string | null;
  projectName?: string | null;
  amount: number;
  currency: string;
  amountInWords?: string | null;
  paymentMethod: ManualReceiptPaymentMethod;
  paymentMethodOther?: string | null;
  purpose?: string | null;
  description?: string | null;
  collectorName?: string | null;
  collectorUserId?: string | null;
  collectorRole?: string | null;
  accountingOfficerName?: string | null;
  approvedByName?: string | null;
};

function getDb() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    throw new Error("Service role env eksik olduğu için manuel makbuz işlemi yapılamadı.");
  }

  return asAdminWriteClient(supabase);
}

function friendlyManualReceiptError(error: DbError | null, fallback: string) {
  const message = [error?.code, error?.message, error?.details, error?.hint].filter(Boolean).join(" ");
  if (/permission|42501|row-level|not authorized/i.test(message)) return "Manuel makbuz işlemi için server yetkisi doğrulanamadı.";
  if (/duplicate|23505/i.test(message)) return "Bu manuel makbuz numarası daha önce oluşturulmuş.";
  if (/check constraint|23514|invalid input|22P02/i.test(message)) return "Manuel makbuz alanları geçerli değil.";
  return fallback;
}

function toRow(input: Partial<ManualReceiptWriteInput>, actorId?: string) {
  const row: Record<string, unknown> = {};
  if (input.serialNo !== undefined) row.serial_no = input.serialNo || null;
  if (input.sequenceNo !== undefined) row.sequence_no = input.sequenceNo ?? null;
  if (input.bookletNo !== undefined) row.booklet_no = input.bookletNo || null;
  if (input.outputType !== undefined) row.output_type = input.outputType;
  if (input.receiptDate !== undefined) row.receipt_date = input.receiptDate;
  if (input.branchName !== undefined) row.branch_name = input.branchName || null;
  if (input.unitName !== undefined) row.unit_name = input.unitName || null;
  if (input.donorType !== undefined) row.donor_type = input.donorType || "individual";
  if (input.donorName !== undefined) row.donor_name = input.donorName;
  if (input.donorPhone !== undefined) row.donor_phone = input.donorPhone || null;
  if (input.donorEmail !== undefined) row.donor_email = input.donorEmail || null;
  if (input.donorTaxId !== undefined) row.donor_tax_id = input.donorTaxId || null;
  if (input.donorAddress !== undefined) row.donor_address = input.donorAddress || null;
  if (input.donationType !== undefined) row.donation_type = input.donationType;
  if (input.donationTypeOther !== undefined) row.donation_type_other = input.donationTypeOther || null;
  if (input.campaignName !== undefined) row.campaign_name = input.campaignName || null;
  if (input.projectName !== undefined) row.project_name = input.projectName || null;
  if (input.amount !== undefined) row.amount = input.amount;
  if (input.currency !== undefined) row.currency = input.currency || "TRY";
  if (input.amountInWords !== undefined) row.amount_in_words = input.amountInWords || null;
  if (input.paymentMethod !== undefined) row.payment_method = input.paymentMethod;
  if (input.paymentMethodOther !== undefined) row.payment_method_other = input.paymentMethodOther || null;
  if (input.purpose !== undefined) row.purpose = input.purpose || null;
  if (input.description !== undefined) row.description = input.description || null;
  if (input.collectorName !== undefined) row.collector_name = input.collectorName || null;
  if (input.collectorUserId !== undefined) row.collector_user_id = input.collectorUserId || null;
  if (input.collectorRole !== undefined) row.collector_role = input.collectorRole || null;
  if (input.accountingOfficerName !== undefined) row.accounting_officer_name = input.accountingOfficerName || null;
  if (input.approvedByName !== undefined) row.approved_by_name = input.approvedByName || null;
  if (actorId) row.updated_by = actorId;
  row.updated_at = new Date().toISOString();
  return row;
}

export async function appendManualReceiptEvent(input: {
  manualReceiptId: string;
  eventType: string;
  oldStatus?: ManualReceiptStatus | null;
  newStatus?: ManualReceiptStatus | null;
  actorId?: string | null;
  actorRole?: string | null;
  note?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const db = getDb();
  const { error } = await db.from("manual_receipt_events").insert({
    manual_receipt_id: input.manualReceiptId,
    event_type: input.eventType,
    old_status: input.oldStatus ?? null,
    new_status: input.newStatus ?? null,
    actor_id: input.actorId ?? null,
    actor_role: input.actorRole ?? null,
    note: input.note ?? null,
    metadata: input.metadata ?? {}
  });

  if (error) {
    console.warn("[manual-receipts] event_insert_failed", {
      eventType: input.eventType,
      code: error.code ?? null
    });
  }
}

export async function createManualReceipt(input: ManualReceiptWriteInput, actorId: string) {
  const db = getDb();
  const { data, error } = await db
    .from<ManualReceiptRow>("manual_receipts")
    .insert({
      ...toRow(input, actorId),
      created_by: actorId,
      updated_by: actorId,
      status: "draft"
    })
    .select(manualReceiptColumns)
    .single();

  if (error || !data) throw new Error(friendlyManualReceiptError(error, "Manuel makbuz oluşturulamadı."));
  const receipt = mapManualReceipt(data);
  await appendManualReceiptEvent({
    manualReceiptId: receipt.id,
    eventType: "manual_receipt.create",
    newStatus: receipt.status,
    actorId,
    actorRole: "admin",
    note: "Manuel makbuz oluşturuldu."
  });
  return receipt;
}

export async function updateManualReceipt(id: string, input: Partial<ManualReceiptWriteInput>, actorId: string) {
  const db = getDb();
  const { data, error } = await db
    .from<ManualReceiptRow>("manual_receipts")
    .update(toRow(input, actorId))
    .eq("id", id)
    .select(manualReceiptColumns)
    .maybeSingle();

  if (error || !data) throw new Error(friendlyManualReceiptError(error, "Manuel makbuz güncellenemedi."));
  const receipt = mapManualReceipt(data);
  await appendManualReceiptEvent({
    manualReceiptId: receipt.id,
    eventType: "manual_receipt.update",
    newStatus: receipt.status,
    actorId,
    actorRole: "admin",
    note: "Manuel makbuz bilgileri güncellendi."
  });
  return receipt;
}

export async function updateManualReceiptStatus(input: {
  id: string;
  status: ManualReceiptStatus;
  actorId: string;
  actorRole?: string;
  note?: string | null;
  extra?: Record<string, unknown>;
  eventType: string;
}) {
  const db = getDb();
  const now = new Date().toISOString();
  const updatePayload: Record<string, unknown> = {
    status: input.status,
    updated_by: input.actorId,
    updated_at: now,
    ...(input.extra ?? {})
  };

  const { data, error } = await db
    .from<ManualReceiptRow>("manual_receipts")
    .update(updatePayload)
    .eq("id", input.id)
    .select(manualReceiptColumns)
    .maybeSingle();

  if (error || !data) throw new Error(friendlyManualReceiptError(error, "Manuel makbuz durumu güncellenemedi."));
  const receipt = mapManualReceipt(data);
  await appendManualReceiptEvent({
    manualReceiptId: receipt.id,
    eventType: input.eventType,
    newStatus: receipt.status,
    actorId: input.actorId,
    actorRole: input.actorRole ?? "admin",
    note: input.note ?? null
  });
  return receipt;
}

export async function updateManualReceiptPdfMetadata(
  id: string,
  fileInfo: {
    bucket: string;
    path: string;
    mimeType: string;
    sizeBytes: number;
    sha256: string;
  },
  actorId: string,
  status?: ManualReceiptStatus
) {
  const db = getDb();
  const now = new Date().toISOString();
  const updatePayload: Record<string, unknown> = {
    file_bucket: fileInfo.bucket,
    file_path: fileInfo.path,
    file_mime_type: fileInfo.mimeType,
    file_size_bytes: fileInfo.sizeBytes,
    file_sha256: fileInfo.sha256,
    generated_at: now,
    updated_by: actorId,
    updated_at: now
  };
  if (status) updatePayload.status = status;

  const { data, error } = await db
    .from<ManualReceiptRow>("manual_receipts")
    .update(updatePayload)
    .eq("id", id)
    .select(manualReceiptColumns)
    .maybeSingle();

  if (error || !data) throw new Error(friendlyManualReceiptError(error, "Manuel makbuz PDF metadata güncellenemedi."));
  return mapManualReceipt(data);
}
