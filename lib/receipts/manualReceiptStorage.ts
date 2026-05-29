import "server-only";

import crypto from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const MANUAL_RECEIPT_PRIVATE_BUCKET = "manual-receipts-private";

export type ManualReceiptFileInfo = {
  bucket: string;
  path: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
};

function getAdminStorageClient() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) throw new Error("Service role env eksik olduğu için manuel makbuz dosya işlemi yapılamadı.");
  return supabase;
}

function yearFromReceiptNo(receiptNo: string) {
  const match = receiptNo.match(/\b(20\d{2})\b/);
  return match?.[1] ?? String(new Date().getFullYear());
}

function safePathSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9-]/g, "-").replace(/-+/g, "-").slice(0, 80);
}

function friendlyStorageError(error: { message?: string } | null, fallback: string) {
  const message = error?.message ?? "";
  if (/bucket|not found/i.test(message)) return "Manuel makbuz private storage bucket bulunamadı.";
  if (/duplicate|already exists|resource already exists/i.test(message)) return "Bu manuel makbuz PDF dosyası zaten oluşturulmuş.";
  if (/permission|not authorized|row-level/i.test(message)) return "Manuel makbuz storage yetkisi doğrulanamadı.";
  return fallback;
}

export function getManualReceiptFilePath(receiptNo: string, version = 1) {
  return `manual-receipts/${yearFromReceiptNo(receiptNo)}/${safePathSegment(receiptNo)}/v${Math.max(1, Math.floor(version))}.pdf`;
}

export function calculateManualReceiptSha256(buffer: Buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

export async function ensureManualReceiptBucketExists() {
  const supabase = getAdminStorageClient();
  const { data, error } = await supabase.storage.getBucket(MANUAL_RECEIPT_PRIVATE_BUCKET);
  if (error || !data) throw new Error("manual-receipts-private bucket bulunamadı. 018 migration uygulanmalı.");
  if ((data as { public?: boolean }).public) {
    throw new Error("manual-receipts-private bucket public görünüyor. İşlem güvenlik nedeniyle durduruldu.");
  }
}

export async function uploadManualReceiptPdf({
  receiptNo,
  pdfBuffer,
  version = 1
}: {
  receiptNo: string;
  pdfBuffer: Buffer;
  version?: number;
}): Promise<ManualReceiptFileInfo> {
  await ensureManualReceiptBucketExists();
  const supabase = getAdminStorageClient();
  const path = getManualReceiptFilePath(receiptNo, version);
  const sha256 = calculateManualReceiptSha256(pdfBuffer);
  const { error } = await supabase.storage.from(MANUAL_RECEIPT_PRIVATE_BUCKET).upload(path, new Uint8Array(pdfBuffer), {
    contentType: "application/pdf",
    upsert: false,
    metadata: {
      receiptNo,
      version: String(version),
      sha256
    }
  });

  if (error) throw new Error(friendlyStorageError(error, "Manuel makbuz PDF private storage alanına yüklenemedi."));

  return {
    bucket: MANUAL_RECEIPT_PRIVATE_BUCKET,
    path,
    mimeType: "application/pdf",
    sizeBytes: pdfBuffer.byteLength,
    sha256
  };
}

export async function downloadManualReceiptPdf(receipt: { fileBucket?: string | null; filePath?: string | null }) {
  if (!receipt.filePath) throw new Error("Manuel makbuz PDF dosyası bulunamadı.");
  const supabase = getAdminStorageClient();
  const bucket = receipt.fileBucket || MANUAL_RECEIPT_PRIVATE_BUCKET;
  const { data, error } = await supabase.storage.from(bucket).download(receipt.filePath);
  if (error || !data) throw new Error(friendlyStorageError(error, "Manuel makbuz PDF dosyası okunamadı."));
  return Buffer.from(await data.arrayBuffer());
}
