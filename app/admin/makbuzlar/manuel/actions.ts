"use server";

import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import { AdminAuthorizationError, requireAdminUser } from "@/lib/auth/requireAdmin";
import { logAdminAction } from "@/lib/audit/auditLogger";
import { getSupabaseManualReceiptById } from "@/lib/data/manualReceiptRepository";
import {
  appendManualReceiptEvent,
  createManualReceipt,
  updateManualReceipt,
  updateManualReceiptPdfMetadata,
  updateManualReceiptStatus,
  type ManualReceiptWriteInput
} from "@/lib/data/manualReceiptWriteRepository";
import { generateManualReceiptPdfBuffer } from "@/lib/receipts/manualReceiptPdfGenerator";
import { uploadManualReceiptPdf } from "@/lib/receipts/manualReceiptStorage";
import type {
  ManualReceiptDonationType,
  ManualReceiptOutputType,
  ManualReceiptPaymentMethod,
  ManualReceiptStatus
} from "@/data/manualReceiptMock";

const TERMINAL_MANUAL_RECEIPT_STATUSES: ManualReceiptStatus[] = ["cancelled", "archived"];
const PRINTABLE_MANUAL_RECEIPT_STATUSES: ManualReceiptStatus[] = ["prepared", "printed"];
const ARCHIVABLE_MANUAL_RECEIPT_STATUSES: ManualReceiptStatus[] = ["prepared", "printed", "delivered", "signed"];

function redirectWithStatus(status: string, message?: string) {
  const params = new URLSearchParams({ durum: status });
  if (message) params.set("mesaj", message);
  redirect(`/admin/makbuzlar/manuel?${params.toString()}`);
}

function revalidateManualReceiptViews(id?: string) {
  revalidatePath("/admin/makbuzlar/manuel");
  if (id) {
    revalidatePath(`/admin/makbuzlar/manuel/${id}`);
    revalidatePath(`/admin/makbuzlar/manuel/${id}/duzenle`);
    revalidatePath(`/admin/makbuzlar/manuel/${id}/yazdir`);
  }
}

function friendlyActionError(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return "Manuel makbuz işlemi tamamlanamadı.";
}

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readNumber(formData: FormData, key: string) {
  const value = readString(formData, key);
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeDateTime(value: string) {
  if (!value) return new Date().toISOString();
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return new Date().toISOString();
  return date.toISOString();
}

function parseManualReceiptInput(formData: FormData): ManualReceiptWriteInput {
  const donorType = readString(formData, "donorType") || "individual";
  const donorName = readString(formData, "donorName") || (donorType === "anonymous" ? "Anonim Bağışçı" : "");
  const amount = readNumber(formData, "amount");

  if (!donorName) throw new Error("Bağışçı adı zorunludur.");
  if (!amount || amount <= 0) throw new Error("Bağış tutarı sıfırdan büyük olmalıdır.");

  return {
    serialNo: readString(formData, "serialNo") || null,
    sequenceNo: readNumber(formData, "sequenceNo"),
    bookletNo: readString(formData, "bookletNo") || null,
    outputType: (readString(formData, "outputType") || "a4_landscape") as ManualReceiptOutputType,
    receiptDate: normalizeDateTime(readString(formData, "receiptDate")),
    branchName: readString(formData, "branchName") || null,
    unitName: readString(formData, "unitName") || null,
    donorType,
    donorName,
    donorPhone: readString(formData, "donorPhone") || null,
    donorEmail: readString(formData, "donorEmail") || null,
    donorTaxId: readString(formData, "donorTaxId") || null,
    donorAddress: readString(formData, "donorAddress") || null,
    donationType: (readString(formData, "donationType") || "general_donation") as ManualReceiptDonationType,
    donationTypeOther: readString(formData, "donationTypeOther") || null,
    campaignName: readString(formData, "campaignName") || null,
    projectName: readString(formData, "projectName") || null,
    amount,
    currency: readString(formData, "currency") || "TRY",
    amountInWords: readString(formData, "amountInWords") || null,
    paymentMethod: (readString(formData, "paymentMethod") || "cash") as ManualReceiptPaymentMethod,
    paymentMethodOther: readString(formData, "paymentMethodOther") || null,
    purpose: readString(formData, "purpose") || null,
    description: readString(formData, "description") || null,
    collectorName: readString(formData, "collectorName") || null,
    accountingOfficerName: readString(formData, "accountingOfficerName") || null,
    approvedByName: readString(formData, "approvedByName") || null
  };
}

function formDataKeys(formData: FormData) {
  return Array.from(new Set(Array.from(formData.keys()).map((key) => String(key)))).sort();
}

function logManualActionStart(
  action: string,
  formData: FormData,
  input: {
    adminUserId?: string | null;
    adminRole?: string | null;
    receiptId?: string | null;
    receiptNo?: string | null;
    reasonProvided?: boolean;
    targetStatus?: ManualReceiptStatus | null;
  } = {}
) {
  console.info("[manual-receipts:action]", "start", {
    action,
    receiptId: input.receiptId ?? null,
    receiptNo: input.receiptNo ?? null,
    adminUserId: input.adminUserId ?? null,
    adminRole: input.adminRole ?? null,
    targetStatus: input.targetStatus ?? null,
    reasonProvided: input.reasonProvided ?? null,
    formKeys: formDataKeys(formData)
  });
}

function assertNotTerminalStatus(status: ManualReceiptStatus, message: string) {
  if (TERMINAL_MANUAL_RECEIPT_STATUSES.includes(status)) {
    throw new Error(message);
  }
}

export async function createManualReceiptAction(formData: FormData) {
  try {
    const admin = await requireAdminUser();
    logManualActionStart("createManualReceiptAction", formData, { adminRole: admin.role, adminUserId: admin.user.id });
    const receipt = await createManualReceipt(parseManualReceiptInput(formData), admin.user.id);
    await logAdminAction({
      actorId: admin.user.id,
      action: "manual_receipt.create",
      entityType: "manual_receipts",
      entityId: receipt.id,
      summary: `Manuel makbuz oluşturuldu: ${receipt.receiptNo}`,
      metadata: { receiptNo: receipt.receiptNo }
    });
    revalidateManualReceiptViews(receipt.id);
    redirect(`/admin/makbuzlar/manuel/${receipt.id}?durum=olusturuldu`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (error instanceof AdminAuthorizationError) redirectWithStatus("yetkisiz", error.message);
    redirectWithStatus("hata", friendlyActionError(error));
  }
}

export async function updateManualReceiptAction(formData: FormData) {
  const id = readString(formData, "id");
  const receiptNo = readString(formData, "receiptNo");
  try {
    const admin = await requireAdminUser();
    logManualActionStart("updateManualReceiptAction", formData, { adminRole: admin.role, adminUserId: admin.user.id, receiptId: id, receiptNo });
    if (!id) throw new Error("Manuel makbuz kimliği zorunludur.");
    const existing = await getSupabaseManualReceiptById(id);
    if (!existing) throw new Error("Manuel makbuz bulunamadı.");
    if (["cancelled", "archived"].includes(existing.status)) throw new Error("İptal edilmiş veya arşivlenmiş makbuz düzenlenemez.");
    const receipt = await updateManualReceipt(id, parseManualReceiptInput(formData), admin.user.id);
    await logAdminAction({
      actorId: admin.user.id,
      action: "manual_receipt.update",
      entityType: "manual_receipts",
      entityId: receipt.id,
      summary: `Manuel makbuz güncellendi: ${receipt.receiptNo}`,
      metadata: { receiptNo: receipt.receiptNo }
    });
    revalidateManualReceiptViews(id);
    redirect(`/admin/makbuzlar/manuel/${id}?durum=guncellendi`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (error instanceof AdminAuthorizationError) redirectWithStatus("yetkisiz", error.message);
    redirect(`/admin/makbuzlar/manuel/${id || ""}?durum=hata&mesaj=${encodeURIComponent(friendlyActionError(error))}`);
  }
}

export async function markManualReceiptPreparedAction(formData: FormData) {
  const id = readString(formData, "id");
  const receiptNo = readString(formData, "receiptNo");
  try {
    const admin = await requireAdminUser();
    logManualActionStart("markManualReceiptPreparedAction", formData, { adminRole: admin.role, adminUserId: admin.user.id, receiptId: id, receiptNo, targetStatus: "prepared" });
    if (!id) throw new Error("Manuel makbuz kimliği zorunludur.");
    const existing = await getSupabaseManualReceiptById(id);
    if (!existing) throw new Error("Manuel makbuz bulunamadı.");
    if (existing.status !== "draft") throw new Error("Yalnızca taslak manuel makbuzlar hazırlanmış olarak işaretlenebilir.");
    const receipt = await updateManualReceiptStatus({
      id,
      status: "prepared",
      oldStatus: existing.status,
      actorId: admin.user.id,
      eventType: "manual_receipt.prepare",
      note: "Manuel makbuz hazırlandı."
    });
    await logAdminAction({
      actorId: admin.user.id,
      action: "manual_receipt.prepare",
      entityType: "manual_receipts",
      entityId: receipt.id,
      summary: `Manuel makbuz hazırlandı: ${receipt.receiptNo}`,
      metadata: { receiptNo: receipt.receiptNo }
    });
    revalidateManualReceiptViews(id);
    redirect(`/admin/makbuzlar/manuel/${id}?durum=durum-guncellendi`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (error instanceof AdminAuthorizationError) redirectWithStatus("yetkisiz", error.message);
    redirect(`/admin/makbuzlar/manuel/${id || ""}?durum=hata&mesaj=${encodeURIComponent(friendlyActionError(error))}`);
  }
}

export async function markManualReceiptPrintedAction(formData: FormData) {
  const id = readString(formData, "id");
  const receiptNo = readString(formData, "receiptNo");
  try {
    const admin = await requireAdminUser();
    logManualActionStart("markManualReceiptPrintedAction", formData, { adminRole: admin.role, adminUserId: admin.user.id, receiptId: id, receiptNo, targetStatus: "printed" });
    if (!id) throw new Error("Manuel makbuz kimliği zorunludur.");
    const existing = await getSupabaseManualReceiptById(id);
    if (!existing) throw new Error("Manuel makbuz bulunamadı.");
    if (TERMINAL_MANUAL_RECEIPT_STATUSES.includes(existing.status)) throw new Error("İptal edilmiş veya arşivlenmiş makbuz yazdırılamaz.");
    if (!PRINTABLE_MANUAL_RECEIPT_STATUSES.includes(existing.status)) throw new Error("Yazdırıldı işaretlemek için manuel makbuz önce hazırlanmış olmalıdır.");
    const now = new Date().toISOString();
    const receipt = await updateManualReceiptStatus({
      id,
      status: "printed",
      oldStatus: existing.status,
      actorId: admin.user.id,
      eventType: "manual_receipt.print",
      note: "Manuel makbuz yazdırıldı.",
      extra: {
        printed_count: existing.printedCount + 1,
        last_printed_at: now
      }
    });
    await logAdminAction({
      actorId: admin.user.id,
      action: "manual_receipt.print",
      entityType: "manual_receipts",
      entityId: receipt.id,
      summary: `Manuel makbuz yazdırıldı: ${receipt.receiptNo}`,
      metadata: { receiptNo: receipt.receiptNo, printedCount: receipt.printedCount }
    });
    revalidateManualReceiptViews(id);
    redirect(`/admin/makbuzlar/manuel/${id}/yazdir?durum=yazdirildi`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (error instanceof AdminAuthorizationError) redirectWithStatus("yetkisiz", error.message);
    redirect(`/admin/makbuzlar/manuel/${id || ""}/yazdir?durum=hata&mesaj=${encodeURIComponent(friendlyActionError(error))}`);
  }
}

export async function cancelManualReceiptAction(formData: FormData) {
  const id = readString(formData, "id");
  const receiptNo = readString(formData, "receiptNo");
  const reason = readString(formData, "reason");
  try {
    const admin = await requireAdminUser();
    logManualActionStart("cancelManualReceiptAction", formData, { adminRole: admin.role, adminUserId: admin.user.id, receiptId: id, receiptNo, reasonProvided: Boolean(reason), targetStatus: "cancelled" });
    if (!id) throw new Error("Manuel makbuz kimliği zorunludur.");
    if (!reason || reason.length < 5) throw new Error("İptal gerekçesi zorunludur.");
    const existing = await getSupabaseManualReceiptById(id);
    if (!existing) throw new Error("Manuel makbuz bulunamadı.");
    assertNotTerminalStatus(existing.status, "İptal edilmiş veya arşivlenmiş makbuz tekrar iptal edilemez.");
    const receipt = await updateManualReceiptStatus({
      id,
      status: "cancelled",
      oldStatus: existing.status,
      actorId: admin.user.id,
      eventType: "manual_receipt.cancel",
      note: reason,
      extra: {
        cancelled_at: new Date().toISOString(),
        cancelled_by: admin.user.id,
        cancelled_reason: reason
      }
    });
    await logAdminAction({
      actorId: admin.user.id,
      action: "manual_receipt.cancel",
      entityType: "manual_receipts",
      entityId: receipt.id,
      summary: `Manuel makbuz iptal edildi: ${receipt.receiptNo}`,
      metadata: { receiptNo: receipt.receiptNo, reason }
    });
    revalidateManualReceiptViews(id);
    redirect(`/admin/makbuzlar/manuel/${id}?durum=iptal-edildi`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (error instanceof AdminAuthorizationError) redirectWithStatus("yetkisiz", error.message);
    redirect(`/admin/makbuzlar/manuel/${id || ""}?durum=hata&mesaj=${encodeURIComponent(friendlyActionError(error))}`);
  }
}

export async function archiveManualReceiptAction(formData: FormData) {
  const id = readString(formData, "id");
  const receiptNo = readString(formData, "receiptNo");
  try {
    const admin = await requireAdminUser();
    logManualActionStart("archiveManualReceiptAction", formData, { adminRole: admin.role, adminUserId: admin.user.id, receiptId: id, receiptNo, targetStatus: "archived" });
    if (!id) throw new Error("Manuel makbuz kimliği zorunludur.");
    const existing = await getSupabaseManualReceiptById(id);
    if (!existing) throw new Error("Manuel makbuz bulunamadı.");
    if (!ARCHIVABLE_MANUAL_RECEIPT_STATUSES.includes(existing.status)) {
      throw new Error("Yalnızca hazırlanmış, yazdırılmış, teslim edilmiş veya imzalanmış makbuzlar arşivlenebilir.");
    }
    const receipt = await updateManualReceiptStatus({
      id,
      status: "archived",
      oldStatus: existing.status,
      actorId: admin.user.id,
      eventType: "manual_receipt.archive",
      note: "Manuel makbuz arşivlendi.",
      extra: { archived_at: new Date().toISOString() }
    });
    await logAdminAction({
      actorId: admin.user.id,
      action: "manual_receipt.archive",
      entityType: "manual_receipts",
      entityId: receipt.id,
      summary: `Manuel makbuz arşivlendi: ${receipt.receiptNo}`,
      metadata: { receiptNo: receipt.receiptNo }
    });
    revalidateManualReceiptViews(id);
    redirect(`/admin/makbuzlar/manuel/${id}?durum=arsivlendi`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (error instanceof AdminAuthorizationError) redirectWithStatus("yetkisiz", error.message);
    redirect(`/admin/makbuzlar/manuel/${id || ""}?durum=hata&mesaj=${encodeURIComponent(friendlyActionError(error))}`);
  }
}

export async function generateManualReceiptPdfAction(formData: FormData) {
  const id = readString(formData, "id");
  const receiptNo = readString(formData, "receiptNo");
  try {
    const admin = await requireAdminUser();
    logManualActionStart("generateManualReceiptPdfAction", formData, { adminRole: admin.role, adminUserId: admin.user.id, receiptId: id, receiptNo });
    if (!id) throw new Error("Manuel makbuz kimliği zorunludur.");
    const receipt = await getSupabaseManualReceiptById(id);
    if (!receipt) throw new Error("Manuel makbuz bulunamadı.");
    if (TERMINAL_MANUAL_RECEIPT_STATUSES.includes(receipt.status)) throw new Error("İptal edilmiş veya arşivlenmiş manuel makbuz için PDF üretilemez.");
    if (receipt.filePath) throw new Error("Manuel makbuz PDF dosyası zaten oluşturulmuş.");
    const pdfBuffer = await generateManualReceiptPdfBuffer(receipt);
    const fileInfo = await uploadManualReceiptPdf({ receiptNo: receipt.receiptNo, pdfBuffer, version: 1 });
    const nextStatus = receipt.status === "draft" ? "prepared" : undefined;
    const updated = await updateManualReceiptPdfMetadata(id, fileInfo, admin.user.id, nextStatus);
    await appendManualReceiptEvent({
      manualReceiptId: updated.id,
      eventType: "manual_receipt.pdf.generate",
      oldStatus: receipt.status,
      newStatus: updated.status,
      actorId: admin.user.id,
      actorRole: "admin",
      note: "Manuel makbuz PDF oluşturuldu.",
      metadata: { filePath: fileInfo.path, sha256: fileInfo.sha256 }
    });
    await logAdminAction({
      actorId: admin.user.id,
      action: "manual_receipt.pdf.generate",
      entityType: "manual_receipts",
      entityId: updated.id,
      summary: `Manuel makbuz PDF oluşturuldu: ${updated.receiptNo}`,
      metadata: { receiptNo: updated.receiptNo, filePath: fileInfo.path }
    });
    revalidateManualReceiptViews(id);
    redirect(`/admin/makbuzlar/manuel/${id}?durum=pdf-olusturuldu`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (error instanceof AdminAuthorizationError) redirectWithStatus("yetkisiz", error.message);
    redirect(`/admin/makbuzlar/manuel/${id || ""}?durum=hata&mesaj=${encodeURIComponent(friendlyActionError(error))}`);
  }
}
