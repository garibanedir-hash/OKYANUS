"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AdminAuthorizationError, requireAdminUser } from "@/lib/auth/requireAdmin";
import { logAdminAction } from "@/lib/audit/auditLogger";
import {
  getSupabaseReceiptWithPayment,
  getSupabaseReceiptWithPaymentById,
  type ReceiptWithPayment
} from "@/lib/data/paymentRepository";
import { diagnoseReceiptPdfState, toSafeReceiptDiagnosticLog } from "@/lib/receipts/receiptDiagnostics";
import { buildReceiptPdfData, generateReceiptPdfBuffer } from "@/lib/receipts/receiptPdfGenerator";
import {
  repairReceiptPdfMetadata,
  updateReceiptFileMetadata,
  uploadReceiptPdf
} from "@/lib/receipts/receiptStorage";

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
  return "Makbuz PDF işlemi tamamlanamadı.";
}

function readFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readReceiptReference(formData: FormData) {
  return {
    receiptId: readFormString(formData, "receipt_id"),
    receiptNo: readFormString(formData, "receipt_no")
  };
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

export async function generateReceiptPdfAction(formData: FormData) {
  let uploadedFilePath: string | null = null;
  let outcome: { durum: string; mesaj?: string } | null = null;
  let receiptNoForDiagnostics: string | null = null;

  try {
    const admin = await requireAdminUser();
    const receiptReference = readReceiptReference(formData);
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
        const pdfData = buildReceiptPdfData({
          receiptNo: receipt.receiptNo,
          paymentIntentNo: receipt.paymentIntentNo,
          contextType: receipt.contextType,
          donorName: receipt.donorName ?? receipt.paymentDonorName,
          donorEmail: receipt.donorEmail ?? receipt.paymentDonorEmail,
          donorPhone: receipt.paymentDonorPhone,
          amount: receipt.amount,
          currency: receipt.currency,
          receiptStatus: "prepared",
          paymentStatus: receipt.paymentIntentStatus,
          paymentProvider: receipt.paymentProvider,
          issuedAt: receipt.issuedAt,
          generatedAt: new Date().toISOString(),
          createdAt: receipt.createdAt,
          description: `${receipt.receiptNo} numaralı makbuz, ${receipt.paymentIntentNo ?? "ödeme kaydı"} için hazırlanmıştır.`
        });
        const pdfBuffer = generateReceiptPdfBuffer(pdfData);
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
