import "server-only";

import crypto from "node:crypto";
import type { ReceiptStatus } from "@/data/paymentMock";
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

type RepairableReceipt = {
  id: string;
  receiptNo: string;
  status: ReceiptStatus;
  version?: number | null;
  generatedAt?: string | null;
  fileBucket?: string | null;
  filePath?: string | null;
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

type StorageBucketInfo = {
  id: string;
  name: string;
  public: boolean;
};

type StorageObjectRow = {
  id: string;
  bucket_id: string;
  name: string;
  metadata: Record<string, unknown> | null;
  created_at: string | null;
  updated_at: string | null;
  last_accessed_at: string | null;
};

type StorageObjectQuery<T> = {
  select: (columns?: string) => StorageObjectQuery<T>;
  eq: (column: string, value: string) => StorageObjectQuery<T>;
  ilike: (column: string, pattern: string) => StorageObjectQuery<T>;
  order: (column: string, options?: { ascending?: boolean; nullsFirst?: boolean }) => StorageObjectQuery<T>;
  limit: (count: number) => StorageObjectQuery<T>;
  maybeSingle: () => Promise<{ data: T | null; error: DbError | null }>;
  then: Promise<{ data: T[] | null; error: DbError | null }>["then"];
};

type StorageSchemaClient = {
  schema: (schemaName: "storage") => {
    from: <T>(table: "objects") => StorageObjectQuery<T>;
  };
};

function getAdminStorageClient() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    throw new Error("Service role env eksik olduğu için makbuz dosya/metadata işlemi yapılamadı.");
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

function safeDbError(error: DbError | null) {
  if (!error) return null;
  return {
    code: error.code ?? null,
    message: error.message ?? null,
    details: error.details ?? null,
    hint: error.hint ?? null
  };
}

function logReceiptMetadataIssue(
  phase: string,
  payload: {
    receiptId?: string;
    receiptNo?: string | null;
    filter?: Record<string, string>;
    filePath?: string;
    status?: string | null;
    error?: DbError | null;
    note?: string;
  }
) {
  console.error("[receipt-pdf:metadata]", phase, {
    receiptId: payload.receiptId ?? null,
    receiptNo: payload.receiptNo ?? null,
    filter: payload.filter ?? null,
    filePath: payload.filePath ?? null,
    status: payload.status ?? null,
    note: payload.note ?? null,
    error: safeDbError(payload.error ?? null)
  });
}

function friendlyReceiptUpdateError(error: DbError | null, fallback: string) {
  const message = [error?.code, error?.message, error?.details, error?.hint].filter(Boolean).join(" ");
  if (/permission|42501|row-level|not authorized/i.test(message)) return "Makbuz metadata güncellemesi için server yetkisi doğrulanamadı.";
  if (/invalid input value for enum|22P02|check constraint|23514/i.test(message)) return "PDF dosyası hazırlandı ancak makbuz durum etiketi güncellenemedi.";
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

function getStorageObjectsClient() {
  const supabase = getAdminStorageClient();
  return (supabase as unknown as StorageSchemaClient).schema("storage").from<StorageObjectRow>("objects");
}

function storageObjectColumns() {
  return "id, bucket_id, name, metadata, created_at, updated_at, last_accessed_at";
}

function parseObjectSize(metadata: Record<string, unknown> | null | undefined) {
  const size = metadata?.size;
  if (typeof size === "number" && Number.isFinite(size)) return size;
  if (typeof size === "string") {
    const parsed = Number(size);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function versionFromPath(path: string, fallback: number) {
  const match = path.match(/\/v(\d+)\.pdf$/i);
  if (!match) return fallback;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function uniqueSearchTerms(receiptNo: string) {
  const safeNo = safeReceiptPathSegment(receiptNo);
  return Array.from(new Set([receiptNo, safeNo].filter(Boolean)));
}

export async function ensureReceiptBucketExists(): Promise<StorageBucketInfo> {
  const supabase = getAdminStorageClient();
  const { data, error } = await supabase.storage.getBucket(RECEIPT_PRIVATE_BUCKET);

  if (error || !data) {
    throw new Error("receipts-private bucket bulunamadı. 017 migration uygulanmalı.");
  }

  const bucket = data as StorageBucketInfo;
  if (bucket.public) {
    throw new Error("receipts-private bucket public görünüyor. Makbuz PDF üretimi güvenlik nedeniyle durduruldu.");
  }

  return bucket;
}

export async function getReceiptStorageObjectByPath(path: string) {
  await ensureReceiptBucketExists();
  const { data, error } = await getStorageObjectsClient()
    .select(storageObjectColumns())
    .eq("bucket_id", RECEIPT_PRIVATE_BUCKET)
    .eq("name", path)
    .maybeSingle();

  if (error) return null;
  return data;
}

export async function findReceiptStorageObject(receiptNo: string, expectedPath: string) {
  const exact = await getReceiptStorageObjectByPath(expectedPath);
  if (exact) return { object: exact, matchedBy: "expected_path" as const };

  for (const term of uniqueSearchTerms(receiptNo)) {
    const { data, error } = await getStorageObjectsClient()
      .select(storageObjectColumns())
      .eq("bucket_id", RECEIPT_PRIVATE_BUCKET)
      .ilike("name", `%${term}%`)
      .order("updated_at", { ascending: false, nullsFirst: false })
      .limit(5);

    if (!error && data?.length) {
      return { object: data[0], matchedBy: "receipt_no_search" as const };
    }
  }

  return null;
}

export async function uploadReceiptPdf({
  receiptNo,
  version,
  pdfBuffer,
  metadata = {},
  upsert = false
}: {
  receiptNo: string;
  version: number;
  pdfBuffer: Buffer;
  metadata?: Record<string, string>;
  upsert?: boolean;
}): Promise<ReceiptFileInfo> {
  await ensureReceiptBucketExists();
  const supabase = getAdminStorageClient();
  const path = getReceiptFilePath(receiptNo, version);
  const sha256 = calculateSha256(pdfBuffer);

  const { error } = await supabase.storage.from(RECEIPT_PRIVATE_BUCKET).upload(path, new Uint8Array(pdfBuffer), {
    contentType: "application/pdf",
    upsert,
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

export async function deleteOrphanedReceiptFile(filePath: string): Promise<void> {
  const supabase = getAdminStorageClient();
  const { error } = await supabase.storage.from(RECEIPT_PRIVATE_BUCKET).remove([filePath]);
  if (error) {
    throw new Error(friendlyStorageError(error, "Orphan makbuz dosyası temizlenemedi."));
  }
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
    generatedAt?: string | null;
    status?: Extract<ReceiptStatus, "pending" | "prepared" | "issued">;
  } = {}
) {
  const supabase = getAdminStorageClient();
  const db = asAdminWriteClient(supabase);

  const now = new Date().toISOString();
  const metadataUpdate: Record<string, unknown> = {
    file_bucket: fileInfo.bucket,
    file_path: fileInfo.path,
    file_mime_type: fileInfo.mimeType,
    file_size_bytes: fileInfo.sizeBytes,
    file_sha256: fileInfo.sha256,
    generated_at: options.generatedAt ?? now,
    version: fileInfo.version,
    updated_at: now
  };

  if (options.generatedBy !== undefined) {
    metadataUpdate.generated_by = options.generatedBy;
  }

  console.info("[receipt-pdf:metadata]", "metadata_update_start", {
    receiptId,
    filter: { id: receiptId },
    filePath: fileInfo.path,
    version: fileInfo.version
  });

  const { data, error } = await db
    .from<ReceiptMetadataRow>("receipts")
    .update(metadataUpdate)
    .eq("id", receiptId)
    .select("id, receipt_no, status, file_bucket, file_path, file_mime_type, file_size_bytes, file_sha256, generated_at, version")
    .maybeSingle();

  if (error) {
    logReceiptMetadataIssue("metadata_update_error", {
      receiptId,
      filter: { id: receiptId },
      filePath: fileInfo.path,
      error
    });
    throw new Error(friendlyReceiptUpdateError(error, "Makbuz dosya metadata bilgileri güncellenemedi."));
  }

  if (!data) {
    logReceiptMetadataIssue("metadata_update_no_row", {
      receiptId,
      filter: { id: receiptId },
      filePath: fileInfo.path,
      note: "update returned no row"
    });
    throw new Error("Makbuz kaydı bulunamadı veya güncellenemedi.");
  }

  if (!data.file_path) {
    logReceiptMetadataIssue("metadata_verification_failed", {
      receiptId,
      receiptNo: data.receipt_no,
      filter: { id: receiptId },
      filePath: fileInfo.path,
      status: data.status,
      note: "file_path empty after update"
    });
    throw new Error("Makbuz dosyası yüklendi ancak dosya yolu kayda yazılamadı.");
  }

  console.info("[receipt-pdf:metadata]", "metadata_update_verified", {
    receiptId: data.id,
    receiptNo: data.receipt_no,
    filePath: data.file_path,
    status: data.status,
    version: data.version
  });

  if (data.status === "pending" && options.status === "prepared") {
    const { data: statusData, error: statusError } = await db
      .from<ReceiptMetadataRow>("receipts")
      .update({ status: "prepared", updated_at: new Date().toISOString() })
      .eq("id", receiptId)
      .select("id, receipt_no, status, file_bucket, file_path, file_mime_type, file_size_bytes, file_sha256, generated_at, version")
      .maybeSingle();

    if (statusError) {
      logReceiptMetadataIssue("status_update_error", {
        receiptId: data.id,
        receiptNo: data.receipt_no,
        filter: { id: receiptId },
        filePath: data.file_path,
        status: data.status,
        error: statusError,
        note: "PDF metadata yazıldı ama status prepared yapılamadı."
      });
      return data;
    }

    if (!statusData) {
      logReceiptMetadataIssue("status_update_no_row", {
        receiptId: data.id,
        receiptNo: data.receipt_no,
        filter: { id: receiptId },
        filePath: data.file_path,
        status: data.status,
        note: "PDF metadata yazıldı ama status update no row döndü."
      });
      return data;
    }

    console.info("[receipt-pdf:metadata]", "status_update_verified", {
      receiptId: statusData.id,
      receiptNo: statusData.receipt_no,
      status: statusData.status,
      filePath: statusData.file_path
    });

    return statusData;
  }

  return data;
}

export async function repairReceiptPdfMetadata(receipt: RepairableReceipt): Promise<
  | { status: "already_ready"; filePath: string }
  | { status: "not_eligible"; reason: string }
  | { status: "not_found"; expectedPath: string }
  | { status: "repaired"; filePath: string; matchedBy: "expected_path" | "receipt_no_search" }
> {
  if (receipt.filePath) return { status: "already_ready", filePath: receipt.filePath };
  if (receipt.status === "cancelled") return { status: "not_eligible", reason: "receipt_cancelled" };

  const version = receipt.version && receipt.version > 0 ? receipt.version : 1;
  const expectedPath = getReceiptFilePath(receipt.receiptNo, version);
  const match = await findReceiptStorageObject(receipt.receiptNo, expectedPath);
  if (!match) return { status: "not_found", expectedPath };

  const pdfBuffer = await downloadReceiptPdf({
    file_bucket: RECEIPT_PRIVATE_BUCKET,
    file_path: match.object.name
  });
  const resolvedVersion = versionFromPath(match.object.name, version);
  const metadataSize = parseObjectSize(match.object.metadata);
  const fileInfo: ReceiptFileInfo = {
    bucket: RECEIPT_PRIVATE_BUCKET,
    path: match.object.name,
    mimeType: "application/pdf",
    sizeBytes: metadataSize ?? pdfBuffer.byteLength,
    sha256: calculateSha256(pdfBuffer),
    version: resolvedVersion
  };

  const nextStatus = receipt.status === "pending" ? "prepared" : receipt.status === "issued" ? "issued" : "prepared";
  const updated = await updateReceiptFileMetadata(receipt.id, fileInfo, {
    generatedAt: receipt.generatedAt ?? new Date().toISOString(),
    status: nextStatus
  });
  const repairedPath = updated.file_path;
  if (!repairedPath) {
    throw new Error("Makbuz metadata onarımı sonrası file_path boş döndü.");
  }

  return {
    status: "repaired",
    filePath: repairedPath,
    matchedBy: match.matchedBy
  };
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
