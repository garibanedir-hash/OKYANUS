"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AdminAuthorizationError, requireAdminUser } from "@/lib/auth/requireAdmin";
import { logAdminAction } from "@/lib/audit/auditLogger";
import { getSupabaseReceiptWithPayment } from "@/lib/data/paymentRepository";
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

function readReceiptNo(formData: FormData) {
  const value = formData.get("receipt_no");
  return typeof value === "string" ? value.trim() : "";
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
    const receiptNo = readReceiptNo(formData);
    receiptNoForDiagnostics = receiptNo;
    if (!receiptNo) throw new Error("Makbuz numarası zorunludur.");

    await logDiagnostic(receiptNo, "before_generate");

    const receipt = await getSupabaseReceiptWithPayment(receiptNo);
    if (!receipt) throw new Error("Makbuz kaydı bulunamadı.");
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
        await logDiagnostic(receiptNo, "after_repair");
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
          donorName: receipt.donorName,
          donorEmail: receipt.donorEmail,
          amount: receipt.amount,
          currency: receipt.currency,
          receiptStatus: "prepared",
          paymentStatus: receipt.paymentIntentStatus,
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

        const updatedReceipt = await getSupabaseReceiptWithPayment(receiptNo);
        if (!updatedReceipt?.filePath) {
          throw new Error("PDF yüklendi ancak makbuz kaydı güncellenemedi.");
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
            version,
            fileSha256: fileInfo.sha256
          }
        });

        await logDiagnostic(receiptNo, "after_generate");
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
