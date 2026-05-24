"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AdminAuthorizationError, requireAdminUser } from "@/lib/auth/requireAdmin";
import { logAdminAction } from "@/lib/audit/auditLogger";
import { getReceiptWithPayment } from "@/lib/data/paymentRepository";
import { buildReceiptPdfData, generateReceiptPdfBuffer } from "@/lib/receipts/receiptPdfGenerator";
import { updateReceiptFileMetadata, uploadReceiptPdf } from "@/lib/receipts/receiptStorage";

function redirectWithStatus(durum: string, mesaj?: string) {
  const params = new URLSearchParams({ durum });
  if (mesaj) params.set("mesaj", mesaj);
  redirect(`/admin/makbuzlar?${params.toString()}`);
}

function friendlyActionError(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return "Makbuz PDF işlemi tamamlanamadı.";
}

function readReceiptNo(formData: FormData) {
  const value = formData.get("receipt_no");
  return typeof value === "string" ? value.trim() : "";
}

export async function generateReceiptPdfAction(formData: FormData) {
  let success = false;

  try {
    const admin = await requireAdminUser();
    const receiptNo = readReceiptNo(formData);
    if (!receiptNo) throw new Error("Makbuz numarası zorunludur.");

    const receipt = await getReceiptWithPayment(receiptNo);
    if (!receipt) throw new Error("Makbuz kaydı bulunamadı.");
    if (receipt.status === "cancelled") throw new Error("İptal edilmiş makbuz için PDF üretilemez.");
    if (receipt.paymentIntentStatus !== "paid") throw new Error("Ödeme tamamlanmadan makbuz PDF'i üretilemez.");

    const nextVersion = receipt.filePath ? receipt.version + 1 : receipt.version || 1;
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
      version: nextVersion,
      pdfBuffer,
      metadata: {
        generatedBy: admin.user.id,
        paymentIntentNo: receipt.paymentIntentNo ?? ""
      }
    });

    await updateReceiptFileMetadata(receipt.id, fileInfo, {
      generatedBy: admin.user.id,
      status: "prepared"
    });

    await logAdminAction({
      actorId: admin.user.id,
      action: "receipt.pdf.generate",
      entityType: "receipts",
      entityId: receipt.id,
      summary: `Makbuz PDF hazırlandı: ${receipt.receiptNo}`,
      metadata: {
        receiptNo: receipt.receiptNo,
        version: nextVersion,
        fileSha256: fileInfo.sha256
      }
    });

    revalidatePath("/admin/makbuzlar");
    revalidatePath("/admin/odeme-kayitlari");
    revalidatePath("/panel/bagislarim");
    revalidatePath("/panel/kurbanlarim");
    revalidatePath("/panel/yetim-sponsorluk");
    success = true;
  } catch (error) {
    if (error instanceof AdminAuthorizationError) {
      redirectWithStatus("yetkisiz", error.message);
    }

    redirectWithStatus("hata", friendlyActionError(error));
  }

  if (success) redirectWithStatus("pdf-hazirlandi");
}
