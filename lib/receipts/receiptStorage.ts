import "server-only";

import crypto from "node:crypto";
import { asAdminWriteClient, type DbError } from "@/lib/data/adminWriteClient";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const RECEIPT_PRIVATE_BUCKET = "receipts-private";

export type ReceiptFileInfo = {
  bucket: string;
  path: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
  version: number;
};

type ReceiptFileRecord = {
  id: string;
  file_bucket?: string | null;
  file_path?: string | null;
  version?: number | null;
};

type ReceiptMetadataRow = {
  id: string;
  receipt_no: string;
  status: string;
  file_bucket: string | null;
  file_path: string | null;
  file_mime_type: string | null;
  file_size_bytes: number | string | null;
  file_sha256: string | null;
  generated_at: string | null;
  version: number | null;
};

function getAdminStorageClient() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    throw new Error("Makbuz dosya saklama servisi şu anda hazır değil.");
  }

  return supabase;
}

function friendlyStorageError(error: { message?: string } | null, fallback: string) {
  const message = error?.message ?? "";
  if (/bucket|not found/i.test(message)) return "Makbuz private storage bucket bulunamadı.";
  if (/duplicate|already exists|resource already exists/i.test(message)) return "Bu makbuz PDF versiyonu zaten oluşturulmuş.";
  if (/permission|not authorized|row-level/i.test(message)) return "Makbuz dosyası için storage yetkisi doğrulanamadı.";
  return fallback;
}

function friendlyReceiptUpdateError(error: DbError | null, fallback: string) {
  const message = error?.message ?? "";
  if (/permission|42501|row-level/i.test(message)) return "Makbuz metadata güncellemesi için yetki doğrulanamadı.";
  if (/not null|23502/i.test(message)) return "Makbuz dosya metadata bilgileri eksik.";
  return fallback;
}

function yearFromReceiptNo(receiptNo: string) {
  const match = receiptNo.match(/\b(20\d{2})\b/);
  return match?.[1] ?? String(new Date().getFullYear());
}

function safeReceiptPathSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9-]/g, "-").replace(/-+/g, "-").slice(0, 80);
}

export function getReceiptFilePath(receiptNo: string, version: number) {
  const safeNo = safeReceiptPathSegment(receiptNo);
  const safeVersion = Number.isFinite(version) && version > 0 ? Math.floor(version) : 1;
  return `receipts/${yearFromReceiptNo(receiptNo)}/${safeNo}/v${safeVersion}.pdf`;
}

export function calculateSha256(buffer: Buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

export async function uploadReceiptPdf({
  receiptNo,
  version,
  pdfBuffer,
  metadata = {}
}: {
  receiptNo: string;
  version: number;
  pdfBuffer: Buffer;
  metadata?: Record<string, string>;
}): Promise<ReceiptFileInfo> {
  const supabase = getAdminStorageClient();
  const path = getReceiptFilePath(receiptNo, version);
  const sha256 = calculateSha256(pdfBuffer);

  const { error } = await supabase.storage.from(RECEIPT_PRIVATE_BUCKET).upload(path, pdfBuffer as unknown as ArrayBuffer, {
    contentType: "application/pdf",
    upsert: false,
    metadata: {
      receiptNo,
      version: String(version),
      sha256,
      ...metadata
    }
  });

  if (error) {
    throw new Error(friendlyStorageError(error, "Makbuz PDF private storage alanına yüklenemedi."));
  }

  return {
    bucket: RECEIPT_PRIVATE_BUCKET,
    path,
    mimeType: "application/pdf",
    sizeBytes: pdfBuffer.byteLength,
    sha256,
    version
  };
}

export async function getReceiptSignedUrl(receipt: Pick<ReceiptFileRecord, "file_bucket" | "file_path">, expiresInSeconds = 60) {
  if (!receipt.file_path) throw new Error("Makbuz PDF dosyası bulunamadı.");
  const supabase = getAdminStorageClient();
  const bucket = receipt.file_bucket || RECEIPT_PRIVATE_BUCKET;
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(receipt.file_path, expiresInSeconds);

  if (error || !data?.signedUrl) {
    throw new Error(friendlyStorageError(error, "Makbuz PDF için güvenli bağlantı üretilemedi."));
  }

  return data.signedUrl;
}

export async function downloadReceiptPdf(receipt: Pick<ReceiptFileRecord, "file_bucket" | "file_path">) {
  if (!receipt.file_path) throw new Error("Makbuz PDF dosyası bulunamadı.");
  const supabase = getAdminStorageClient();
  const bucket = receipt.file_bucket || RECEIPT_PRIVATE_BUCKET;
  const { data, error } = await supabase.storage.from(bucket).download(receipt.file_path);

  if (error || !data) {
    throw new Error(friendlyStorageError(error, "Makbuz PDF dosyası okunamadı."));
  }

  return Buffer.from(await data.arrayBuffer());
}

export async function updateReceiptFileMetadata(
  receiptId: string,
  fileInfo: ReceiptFileInfo,
  options: {
    generatedBy?: string | null;
    status?: "pending" | "prepared" | "issued";
  } = {}
) {
  const supabase = getAdminStorageClient();
  const db = asAdminWriteClient(supabase);
  const { data, error } = await db
    .from<ReceiptMetadataRow>("receipts")
    .update({
      file_bucket: fileInfo.bucket,
      file_path: fileInfo.path,
      file_mime_type: fileInfo.mimeType,
      file_size_bytes: fileInfo.sizeBytes,
      file_sha256: fileInfo.sha256,
      generated_at: new Date().toISOString(),
      generated_by: options.generatedBy ?? null,
      version: fileInfo.version,
      status: options.status ?? "prepared",
      updated_at: new Date().toISOString()
    })
    .eq("id", receiptId)
    .select("id, receipt_no, status, file_bucket, file_path, file_mime_type, file_size_bytes, file_sha256, generated_at, version")
    .single();

  if (error || !data) {
    throw new Error(friendlyReceiptUpdateError(error, "Makbuz dosya metadata bilgileri güncellenemedi."));
  }

  return data;
}

export async function markReceiptDownloaded(receiptId: string) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return;

  const db = asAdminWriteClient(supabase);
  await db
    .from("receipts")
    .update({ last_downloaded_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", receiptId);
}
