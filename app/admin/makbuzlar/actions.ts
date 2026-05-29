"use server";

import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import { AdminAuthorizationError, requireAdminUser } from "@/lib/auth/requireAdmin";
import { logAdminAction } from "@/lib/audit/auditLogger";
import { asAdminWriteClient, type DbError } from "@/lib/data/adminWriteClient";
import {
  getSupabaseReceiptWithPayment,
  getSupabaseReceiptWithPaymentById,
  type ReceiptWithPayment
} from "@/lib/data/paymentRepository";
import { diagnoseReceiptPdfState, toSafeReceiptDiagnosticLog } from "@/lib/receipts/receiptDiagnostics";
import { buildReceiptPdfData, generateReceiptPdfBuffer } from "@/lib/receipts/receiptPdfGenerator";
import {
  getNextReceiptVersion,
  repairReceiptPdfMetadata,
  updateReceiptFileMetadata,
  uploadReceiptPdf
} from "@/lib/receipts/receiptStorage";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type ReceiptActionRow = {
  id: string;
  receipt_no: string;
  status: string;
  issued_at: string | null;
  issued_by: string | null;
  cancelled_at: string | null;
  cancelled_by?: string | null;
  cancelled_reason: string | null;
  updated_at: string | null;
};

type ReceiptMetadataRow = {
  metadata: Record<string, unknown> | null;
};

const CANCELLABLE_RECEIPT_STATUSES = ["pending", "prepared", "issued"];

function redirectWithStatus(durum: string, mesaj?: string) {
  const params = new URLSearchParams({ durum });
  if (mesaj) params.set("mesaj", mesaj);
  redirect(`/admin/makbuzlar?${params.toString()}`);
}

function revalidateReceiptViews() {
  revalidatePath("/admin/makbuzlar");
  revalidatePath("/admin/odeme-kayitlari");
  revalidatePath("/panel/bagislarim");
  revalidatePath("/panel/kurbanlarim");
  revalidatePath("/panel/yetim-sponsorluk");
}

function friendlyActionError(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return "Makbuz işlemi tamamlanamadı.";
}

function readFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readReceiptReference(formData: FormData) {
  return {
    receiptId: readFormString(formData, "receipt_id") || readFormString(formData, "receiptId"),
    receiptNo: readFormString(formData, "receipt_no") || readFormString(formData, "receiptNo")
  };
}

function formDataKeys(formData: FormData) {
  return Array.from(new Set(Array.from(formData.keys()).map((key) => String(key)))).sort();
}

function logReceiptActionStart(
  action: string,
  formData: FormData,
  input: {
    adminUserId?: string | null;
    adminRole?: string | null;
    receiptId?: string | null;
    receiptNo?: string | null;
    reasonProvided?: boolean;
  }
) {
  console.info("[receipt-action]", "start", {
    action,
    receiptId: input.receiptId ?? null,
    receiptNo: input.receiptNo ?? null,
    adminUserId: input.adminUserId ?? null,
    adminRole: input.adminRole ?? null,
    reasonProvided: input.reasonProvided ?? null,
    formKeys: formDataKeys(formData)
  });
}

async function getSupabaseReceiptByReference(reference: { receiptId: string; receiptNo: string }): Promise<ReceiptWithPayment | null> {
  if (reference.receiptId) {
    const receipt = await getSupabaseReceiptWithPaymentById(reference.receiptId);
    if (receipt) return receipt;
    console.warn("[receipt-pdf]", "receipt_lookup_by_id_returned_empty", {
      receiptId: reference.receiptId,
      receiptNo: reference.receiptNo || null
    });
  }

  if (reference.receiptNo) {
    return getSupabaseReceiptWithPayment(reference.receiptNo);
  }

  return null;
}

async function logDiagnostic(receiptNo: string, phase: string) {
  const diagnostic = await diagnoseReceiptPdfState(receiptNo);
  console.info("[receipt-pdf]", phase, toSafeReceiptDiagnosticLog(diagnostic));
  return diagnostic;
}

function receiptProjectOrCampaignLabel(receipt: ReceiptWithPayment) {
  const metadata = receipt.paymentMetadata;
  if (!metadata) return null;

  for (const key of ["campaignTitle", "projectTitle", "campaignName", "projectName", "orderNo", "sponsorshipNo", "donationType", "summary"]) {
    const value = metadata[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  return null;
}

function getAdminWriteDb() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    throw new Error("Service role env eksik olduğu için makbuz işlemi tamamlanamadı.");
  }

  return asAdminWriteClient(supabase);
}

function friendlyDbActionError(error: DbError | null, fallback: string) {
  const message = [error?.code, error?.message, error?.details, error?.hint].filter(Boolean).join(" ");
  if (/permission|42501|row-level|not authorized/i.test(message)) return "Makbuz işlemi için server yetkisi doğrulanamadı.";
  if (/invalid input value for enum|22P02|check constraint|23514/i.test(message)) return "Makbuz durum değeri veritabanı tarafından kabul edilmedi. Receipt status enum/policy kontrol edilmeli.";
  return fallback;
}

function isMissingColumnError(error: DbError | null, columnName: string) {
  const message = [error?.code, error?.message, error?.details, error?.hint].filter(Boolean).join(" ");
  return new RegExp(`${columnName}|column .* does not exist|schema cache|PGRST204|42703`, "i").test(message);
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

function logReceiptDbActionIssue(
  phase: string,
  payload: {
    action: string;
    receiptId?: string;
    receiptNo?: string | null;
    filter?: Record<string, string>;
    error?: DbError | null;
    note?: string;
  }
) {
  console.error("[receipt-action:db]", phase, {
    action: payload.action,
    receiptId: payload.receiptId ?? null,
    receiptNo: payload.receiptNo ?? null,
    filter: payload.filter ?? null,
    note: payload.note ?? null,
    error: safeDbError(payload.error ?? null)
  });
}

function buildReceiptPdfInput(receipt: ReceiptWithPayment, receiptStatus: ReceiptWithPayment["status"], generatedAt: string) {
  return buildReceiptPdfData({
    receiptNo: receipt.receiptNo,
    paymentIntentNo: receipt.paymentIntentNo,
    contextType: receipt.contextType,
    donorName: receipt.donorName ?? receipt.paymentDonorName,
    donorEmail: receipt.donorEmail ?? receipt.paymentDonorEmail,
    donorPhone: receipt.paymentDonorPhone,
    amount: receipt.amount,
    currency: receipt.currency,
    receiptStatus,
    paymentStatus: receipt.paymentIntentStatus,
    paymentProvider: receipt.paymentProvider,
    projectOrCampaign: receiptProjectOrCampaignLabel(receipt),
    issuedAt: receipt.issuedAt,
    generatedAt,
    createdAt: receipt.createdAt,
    description: `${receipt.receiptNo} numaralı makbuz, ${receipt.paymentIntentNo ?? "ödeme kaydı"} için hazırlanmıştır.`
  });
}

async function readReceiptMetadataForCancel(receiptId: string) {
  const db = getAdminWriteDb();
  const { data, error } = await db
    .from<ReceiptMetadataRow>("receipts")
    .select("metadata")
    .eq("id", receiptId)
    .maybeSingle();

  if (error) {
    logReceiptDbActionIssue("cancel_metadata_read_error", {
      action: "cancelReceiptAction",
      receiptId,
      filter: { id: receiptId },
      error
    });
    return {};
  }

  return data?.metadata ?? {};
}

async function updateReceiptCancelled(input: {
  receipt: ReceiptWithPayment;
  adminUserId: string;
  reason: string;
  now: string;
}) {
  const db = getAdminWriteDb();
  const basePayload: Record<string, unknown> = {
    status: "cancelled",
    cancelled_at: input.now,
    cancelled_reason: input.reason,
    updated_at: input.now
  };
  const selectColumnsWithCancelledBy = "id, receipt_no, status, issued_at, issued_by, cancelled_at, cancelled_by, cancelled_reason, updated_at";
  const selectColumns = "id, receipt_no, status, issued_at, issued_by, cancelled_at, cancelled_reason, updated_at";
  const filter = { id: input.receipt.id };

  const withCancelledBy = await db
    .from<ReceiptActionRow>("receipts")
    .update({
      ...basePayload,
      cancelled_by: input.adminUserId
    })
    .eq("id", input.receipt.id)
    .select(selectColumnsWithCancelledBy)
    .maybeSingle();

  if (!withCancelledBy.error || !isMissingColumnError(withCancelledBy.error, "cancelled_by")) {
    return withCancelledBy;
  }

  logReceiptDbActionIssue("cancelled_by_column_missing_fallback", {
    action: "cancelReceiptAction",
    receiptId: input.receipt.id,
    receiptNo: input.receipt.receiptNo,
    filter,
    error: withCancelledBy.error,
    note: "cancelled_by column missing; writing cancellation actor into metadata"
  });

  const existingMetadata = await readReceiptMetadataForCancel(input.receipt.id);
  const metadata = {
    ...existingMetadata,
    cancelledAt: input.now,
    cancelledBy: input.adminUserId,
    cancelledReason: input.reason
  };

  return db
    .from<ReceiptActionRow>("receipts")
    .update({
      ...basePayload,
      metadata
    })
    .eq("id", input.receipt.id)
    .select(selectColumns)
    .maybeSingle();
}

export async function generateReceiptPdfAction(formData: FormData) {
  let uploadedFilePath: string | null = null;
  let outcome: { durum: string; mesaj?: string } | null = null;
  let receiptNoForDiagnostics: string | null = null;

  try {
    const admin = await requireAdminUser();
    const receiptReference = readReceiptReference(formData);
    logReceiptActionStart("generateReceiptPdfAction", formData, {
      adminRole: admin.role,
      receiptId: receiptReference.receiptId || null,
      receiptNo: receiptReference.receiptNo || null
    });
    receiptNoForDiagnostics = receiptReference.receiptNo || null;
    if (!receiptReference.receiptId && !receiptReference.receiptNo) throw new Error("Makbuz kimliği veya numarası zorunludur.");

    console.info("[receipt-pdf]", "action_input", {
      receiptId: receiptReference.receiptId || null,
      receiptNo: receiptReference.receiptNo || null
    });

    const receipt = await getSupabaseReceiptByReference(receiptReference);
    if (!receipt) throw new Error("Makbuz kaydı bulunamadı.");
    if (receiptReference.receiptNo && receipt.receiptNo !== receiptReference.receiptNo) {
      console.warn("[receipt-pdf]", "receipt_reference_mismatch", {
        submittedReceiptId: receiptReference.receiptId || null,
        submittedReceiptNo: receiptReference.receiptNo,
        loadedReceiptId: receipt.id,
        loadedReceiptNo: receipt.receiptNo
      });
    }

    receiptNoForDiagnostics = receipt.receiptNo;
    console.info("[receipt-pdf]", "loaded_receipt_for_pdf", {
      receiptId: receipt.id,
      receiptNo: receipt.receiptNo,
      paymentIntentStatus: receipt.paymentIntentStatus ?? null,
      hasFilePath: Boolean(receipt.filePath)
    });
    await logDiagnostic(receipt.receiptNo, "before_generate");

    if (!receipt.paymentIntentId || !receipt.paymentIntentStatus) throw new Error("Makbuza bağlı ödeme bilgisi okunamadı.");
    if (receipt.paymentIntentStatus !== "paid") throw new Error("Ödeme tamamlanmadan makbuz PDF'i üretilemez.");
    if (receipt.status === "cancelled") throw new Error("İptal edilmiş makbuz için PDF üretilemez.");

    if (receipt.filePath) {
      revalidateReceiptViews();
      outcome = { durum: "pdf-zaten-hazir" };
    } else {
      const repair = await repairReceiptPdfMetadata(receipt);
      if (repair.status === "repaired" || repair.status === "already_ready") {
        await logAdminAction({
          actorId: admin.user.id,
          action: "receipt.pdf.generate",
          entityType: "receipts",
          entityId: receipt.id,
          summary: `Makbuz PDF metadata onarıldı: ${receipt.receiptNo}`,
          metadata: {
            receiptNo: receipt.receiptNo,
            repairStatus: repair.status,
            matchedBy: "matchedBy" in repair ? repair.matchedBy : "db_metadata"
          }
        });
        await logDiagnostic(receipt.receiptNo, "after_repair");
        revalidateReceiptViews();
        outcome = { durum: repair.status === "repaired" ? "pdf-onarildi" : "pdf-zaten-hazir" };
      } else {
        if (repair.status === "not_eligible") {
          throw new Error("Bu makbuz PDF üretimi için uygun değil.");
        }

        const version = receipt.version || 1;
        const generatedAt = new Date().toISOString();
        const pdfData = buildReceiptPdfInput(receipt, "prepared", generatedAt);
        const pdfBuffer = await generateReceiptPdfBuffer(pdfData);
        const fileInfo = await uploadReceiptPdf({
          receiptNo: receipt.receiptNo,
          version,
          pdfBuffer,
          metadata: {
            generatedBy: admin.user.id,
            paymentIntentNo: receipt.paymentIntentNo ?? ""
          },
          upsert: true
        });

        uploadedFilePath = fileInfo.path;

        await updateReceiptFileMetadata(receipt.id, fileInfo, {
          generatedBy: admin.user.id,
          generatedAt: new Date().toISOString(),
          status: "prepared"
        });

        const updatedReceipt = await getSupabaseReceiptWithPaymentById(receipt.id);
        if (!updatedReceipt?.filePath) {
          throw new Error("Makbuz dosyası yüklendi ancak dosya yolu kayda yazılamadı.");
        }

        uploadedFilePath = null;

        await logAdminAction({
          actorId: admin.user.id,
          action: "receipt.pdf.generate",
          entityType: "receipts",
          entityId: receipt.id,
          summary: `Makbuz PDF hazırlandı: ${receipt.receiptNo}`,
          metadata: {
            receiptNo: receipt.receiptNo,
            version
          }
        });

        await logDiagnostic(receipt.receiptNo, "after_generate");
        revalidateReceiptViews();
        outcome = { durum: "pdf-hazirlandi" };
      }
    }
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (uploadedFilePath) {
      try {
        if (receiptNoForDiagnostics) await logDiagnostic(receiptNoForDiagnostics, "after_failed_upload_or_update");
      } catch {
        // Best-effort diagnostic; subsequent attempts can repair existing storage objects.
      }
    }

    if (error instanceof AdminAuthorizationError) {
      redirectWithStatus("yetkisiz", error.message);
    }

    redirectWithStatus("hata", friendlyActionError(error));
  }

  if (outcome) {
    redirectWithStatus(outcome.durum, outcome.mesaj);
  }
}

export async function regenerateReceiptPdfAction(formData: FormData) {
  let outcome: { durum: string; mesaj?: string } | null = null;
  let receiptNoForDiagnostics: string | null = null;

  try {
    const admin = await requireAdminUser();
    const receiptReference = readReceiptReference(formData);
    const reason = readFormString(formData, "reason");
    logReceiptActionStart("regenerateReceiptPdfAction", formData, {
      adminRole: admin.role,
      receiptId: receiptReference.receiptId || null,
      receiptNo: receiptReference.receiptNo || null,
      reasonProvided: Boolean(reason)
    });
    receiptNoForDiagnostics = receiptReference.receiptNo || null;

    if (!receiptReference.receiptId && !receiptReference.receiptNo) throw new Error("Makbuz kimliği veya numarası zorunludur.");

    const receipt = await getSupabaseReceiptByReference(receiptReference);
    if (!receipt) throw new Error("Makbuz kaydı bulunamadı.");

    receiptNoForDiagnostics = receipt.receiptNo;
    if (!receipt.paymentIntentId || !receipt.paymentIntentStatus) throw new Error("Makbuza bağlı ödeme bilgisi okunamadı.");
    if (receipt.paymentIntentStatus !== "paid") throw new Error("Ödeme tamamlanmadan makbuz PDF'i yeniden oluşturulamaz.");
    if (!receipt.filePath) throw new Error("İlk PDF oluşturulmadan yeniden oluşturma yapılamaz.");
    if (receipt.status === "cancelled") throw new Error("İptal edilmiş makbuz için PDF yeniden oluşturulamaz.");
    if (receipt.status === "failed" || receipt.status === "not_required") throw new Error("Bu makbuz durumu için PDF yeniden oluşturma kapalıdır.");
    if (receipt.status === "issued" && !reason) throw new Error("Kesilmiş makbuz için yeniden oluşturma gerekçesi zorunludur.");

    await logDiagnostic(receipt.receiptNo, "before_regenerate");

    let nextVersion = await getNextReceiptVersion(receipt);
    let fileInfo = null;
    const generatedAt = new Date().toISOString();
    const nextStatus = receipt.status === "pending" ? "prepared" : receipt.status;
    const pdfData = buildReceiptPdfInput(receipt, nextStatus, generatedAt);
    const pdfBuffer = await generateReceiptPdfBuffer(pdfData);

    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        fileInfo = await uploadReceiptPdf({
          receiptNo: receipt.receiptNo,
          version: nextVersion,
          pdfBuffer,
          metadata: {
            generatedBy: admin.user.id,
            paymentIntentNo: receipt.paymentIntentNo ?? "",
            regenerationReason: reason || "admin_regenerate"
          },
          upsert: false
        });
        break;
      } catch (error) {
        if (attempt === 0 && error instanceof Error && /zaten oluşturulmuş|already exists|duplicate/i.test(error.message)) {
          nextVersion += 1;
          continue;
        }
        throw error;
      }
    }

    if (!fileInfo) throw new Error("Yeni makbuz PDF versiyonu oluşturulamadı.");

    await updateReceiptFileMetadata(receipt.id, fileInfo, {
      generatedBy: admin.user.id,
      generatedAt,
      status: nextStatus === "issued" ? "issued" : "prepared"
    });

    const updatedReceipt = await getSupabaseReceiptWithPaymentById(receipt.id);
    if (!updatedReceipt?.filePath || updatedReceipt.version !== fileInfo.version) {
      throw new Error("Makbuz PDF yeni versiyonu yüklendi ancak aktif metadata güncellenemedi.");
    }

    await logAdminAction({
      actorId: admin.user.id,
      action: "receipt.pdf.regenerate",
      entityType: "receipts",
      entityId: receipt.id,
      summary: `Makbuz PDF yeniden oluşturuldu: ${receipt.receiptNo}`,
      metadata: {
        receiptNo: receipt.receiptNo,
        previousVersion: receipt.version,
        version: fileInfo.version,
        reason: reason || null
      }
    });

    await logDiagnostic(receipt.receiptNo, "after_regenerate");
    revalidateReceiptViews();
    outcome = { durum: "pdf-yeniden-olusturuldu" };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (receiptNoForDiagnostics) {
      try {
        await logDiagnostic(receiptNoForDiagnostics, "after_failed_regenerate");
      } catch {
        // Best-effort diagnostic.
      }
    }

    if (error instanceof AdminAuthorizationError) {
      redirectWithStatus("yetkisiz", error.message);
    }

    redirectWithStatus("hata", friendlyActionError(error));
  }

  if (outcome) {
    redirectWithStatus(outcome.durum, outcome.mesaj);
  }
}

export async function markReceiptIssuedAction(formData: FormData) {
  let outcome: { durum: string; mesaj?: string } | null = null;

  try {
    const admin = await requireAdminUser();
    const receiptReference = readReceiptReference(formData);
    logReceiptActionStart("markReceiptIssuedAction", formData, {
      adminRole: admin.role,
      receiptId: receiptReference.receiptId || null,
      receiptNo: receiptReference.receiptNo || null
    });
    if (!receiptReference.receiptId && !receiptReference.receiptNo) throw new Error("Makbuz kimliği veya numarası zorunludur.");

    const receipt = await getSupabaseReceiptByReference(receiptReference);
    if (!receipt) throw new Error("Makbuz kaydı bulunamadı.");
    if (!receipt.filePath) throw new Error("PDF oluşturulmadan makbuz kesildi olarak işaretlenemez.");
    if (receipt.status === "issued") {
      revalidateReceiptViews();
      outcome = { durum: "makbuz-zaten-onayli" };
    } else {
      if (receipt.status !== "prepared") throw new Error("Yalnızca hazırlanmış makbuzlar kesildi olarak işaretlenebilir.");

      const now = new Date().toISOString();
      const db = getAdminWriteDb();
      const { data, error } = await db
        .from<ReceiptActionRow>("receipts")
        .update({
          status: "issued",
          issued_at: now,
          issued_by: admin.user.id,
          updated_at: now
        })
        .eq("id", receipt.id)
        .select("id, receipt_no, status, issued_at, issued_by, cancelled_at, cancelled_reason, updated_at")
        .maybeSingle();

      if (error) {
        logReceiptDbActionIssue("issue_update_error", {
          action: "markReceiptIssuedAction",
          receiptId: receipt.id,
          receiptNo: receipt.receiptNo,
          filter: { id: receipt.id },
          error
        });
        throw new Error(friendlyDbActionError(error, "Makbuz kesildi olarak işaretlenemedi."));
      }
      if (!data) {
        logReceiptDbActionIssue("issue_update_no_row", {
          action: "markReceiptIssuedAction",
          receiptId: receipt.id,
          receiptNo: receipt.receiptNo,
          filter: { id: receipt.id },
          note: "update returned no row"
        });
        throw new Error("Makbuz kaydı bulunamadı veya kesildi olarak işaretlenemedi.");
      }

      await logAdminAction({
        actorId: admin.user.id,
        action: "receipt.issue",
        entityType: "receipts",
        entityId: receipt.id,
        summary: `Makbuz kesildi olarak işaretlendi: ${receipt.receiptNo}`,
        metadata: {
          receiptNo: receipt.receiptNo,
          version: receipt.version,
          issuedAt: data.issued_at
        }
      });

      revalidateReceiptViews();
      outcome = { durum: "makbuz-onaylandi" };
    }
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (error instanceof AdminAuthorizationError) {
      redirectWithStatus("yetkisiz", error.message);
    }

    redirectWithStatus("hata", friendlyActionError(error));
  }

  if (outcome) {
    redirectWithStatus(outcome.durum, outcome.mesaj);
  }
}

export async function cancelReceiptAction(formData: FormData) {
  let outcome: { durum: string; mesaj?: string } | null = null;

  try {
    const admin = await requireAdminUser();
    const receiptReference = readReceiptReference(formData);
    const reason = readFormString(formData, "reason");
    logReceiptActionStart("cancelReceiptAction", formData, {
      adminUserId: admin.user.id,
      adminRole: admin.role,
      receiptId: receiptReference.receiptId || null,
      receiptNo: receiptReference.receiptNo || null,
      reasonProvided: Boolean(reason)
    });
    if (!receiptReference.receiptId && !receiptReference.receiptNo) throw new Error("Makbuz kimliği veya numarası zorunludur.");
    if (!reason) throw new Error("İptal gerekçesi zorunludur.");
    if (reason.length < 5) throw new Error("İptal gerekçesi en az 5 karakter olmalıdır.");

    const receipt = await getSupabaseReceiptByReference(receiptReference);
    if (!receipt) throw new Error("Makbuz kaydı bulunamadı.");
    if (receipt.status === "cancelled") {
      revalidateReceiptViews();
      outcome = { durum: "makbuz-zaten-iptal" };
    } else {
      if (!CANCELLABLE_RECEIPT_STATUSES.includes(receipt.status)) {
        throw new Error("Yalnızca bekleyen, hazırlanmış veya kesilmiş makbuzlar iptal edilebilir.");
      }
      const now = new Date().toISOString();
      const { data, error } = await updateReceiptCancelled({
        receipt,
        adminUserId: admin.user.id,
        reason,
        now
      });

      if (error) {
        logReceiptDbActionIssue("cancel_update_error", {
          action: "cancelReceiptAction",
          receiptId: receipt.id,
          receiptNo: receipt.receiptNo,
          filter: { id: receipt.id },
          error
        });
        throw new Error(friendlyDbActionError(error, "Makbuz iptal edilemedi."));
      }
      if (!data) {
        logReceiptDbActionIssue("cancel_update_no_row", {
          action: "cancelReceiptAction",
          receiptId: receipt.id,
          receiptNo: receipt.receiptNo,
          filter: { id: receipt.id },
          note: "update returned no row"
        });
        throw new Error("Makbuz kaydı bulunamadı veya iptal edilemedi.");
      }
      if (data.status !== "cancelled") {
        logReceiptDbActionIssue("cancel_update_verification_failed", {
          action: "cancelReceiptAction",
          receiptId: receipt.id,
          receiptNo: receipt.receiptNo,
          filter: { id: receipt.id },
          note: `expected cancelled, got ${data.status}`
        });
        throw new Error("Makbuz iptal güncellemesi doğrulanamadı.");
      }

      try {
        await logAdminAction({
          actorId: admin.user.id,
          action: "receipt.cancel",
          entityType: "receipts",
          entityId: receipt.id,
          summary: `Makbuz iptal edildi: ${receipt.receiptNo}`,
          metadata: {
            receiptNo: receipt.receiptNo,
            version: receipt.version,
            reason,
            previousStatus: receipt.status,
            newStatus: "cancelled",
            adminRole: admin.role
          }
        });
      } catch (auditError) {
        console.warn("[receipt-action:audit]", "receipt_cancel_audit_failed", {
          receiptId: receipt.id,
          receiptNo: receipt.receiptNo,
          error: auditError instanceof Error ? auditError.message : "unknown"
        });
      }

      revalidateReceiptViews();
      outcome = { durum: "makbuz-iptal-edildi" };
    }
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (error instanceof AdminAuthorizationError) {
      redirectWithStatus("yetkisiz", error.message);
    }

    redirectWithStatus("hata", friendlyActionError(error));
  }

  if (outcome) {
    redirectWithStatus(outcome.durum, outcome.mesaj);
  }
}
