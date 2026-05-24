import "server-only";

import { getSupabaseReceiptWithPayment } from "@/lib/data/paymentRepository";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  RECEIPT_PRIVATE_BUCKET,
  findReceiptStorageObject,
  getReceiptFilePath,
  getReceiptStorageObjectByPath
} from "@/lib/receipts/receiptStorage";

export type ReceiptPdfDiagnostic = {
  receiptNo: string;
  receiptExists: boolean;
  receiptStatus: string | null;
  hasFileBucket: boolean;
  hasFilePath: boolean;
  hasFileSha256: boolean;
  hasGeneratedAt: boolean;
  paymentIntentExists: boolean;
  paymentIntentStatus: string | null;
  expectedPath: string | null;
  expectedStorageObjectExists: boolean;
  receiptNoStorageObjectExists: boolean;
  matchedStoragePath: string | null;
  storageMatchedBy: "expected_path" | "receipt_no_search" | null;
  bucketExists: boolean;
  bucketIsPublic: boolean | null;
  summary:
    | "receipt_missing"
    | "bucket_missing"
    | "bucket_public"
    | "payment_not_paid"
    | "receipt_cancelled"
    | "db_metadata_ready"
    | "storage_object_exists_db_metadata_missing"
    | "pdf_missing_generate_allowed"
    | "payment_missing"
    | "diagnostic_error";
};

async function getBucketState() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return { exists: false, isPublic: null };

  const { data, error } = await supabase.storage.getBucket(RECEIPT_PRIVATE_BUCKET);
  if (error || !data) return { exists: false, isPublic: null };
  return { exists: true, isPublic: Boolean((data as { public?: boolean }).public) };
}

function diagnosticSummary(input: {
  receiptExists: boolean;
  receiptStatus: string | null;
  paymentIntentExists: boolean;
  paymentIntentStatus: string | null;
  hasFilePath: boolean;
  bucketExists: boolean;
  bucketIsPublic: boolean | null;
  receiptNoStorageObjectExists: boolean;
}): ReceiptPdfDiagnostic["summary"] {
  if (!input.receiptExists) return "receipt_missing";
  if (!input.bucketExists) return "bucket_missing";
  if (input.bucketIsPublic) return "bucket_public";
  if (!input.paymentIntentExists) return "payment_missing";
  if (input.paymentIntentStatus !== "paid") return "payment_not_paid";
  if (input.receiptStatus === "cancelled") return "receipt_cancelled";
  if (input.hasFilePath) return "db_metadata_ready";
  if (input.receiptNoStorageObjectExists) return "storage_object_exists_db_metadata_missing";
  return "pdf_missing_generate_allowed";
}

export async function diagnoseReceiptPdfState(receiptNo: string): Promise<ReceiptPdfDiagnostic> {
  try {
    const receipt = await getSupabaseReceiptWithPayment(receiptNo);
    const bucket = await getBucketState();
    const expectedPath = receipt ? getReceiptFilePath(receipt.receiptNo, receipt.version || 1) : null;
    const expectedObject = expectedPath ? await getReceiptStorageObjectByPath(expectedPath).catch(() => null) : null;
    const matchedObject = receipt && expectedPath ? await findReceiptStorageObject(receipt.receiptNo, expectedPath).catch(() => null) : null;

    const result = {
      receiptNo,
      receiptExists: Boolean(receipt),
      receiptStatus: receipt?.status ?? null,
      hasFileBucket: Boolean(receipt?.fileBucket),
      hasFilePath: Boolean(receipt?.filePath),
      hasFileSha256: Boolean(receipt?.fileSha256),
      hasGeneratedAt: Boolean(receipt?.generatedAt),
      paymentIntentExists: Boolean(receipt?.paymentIntentId),
      paymentIntentStatus: receipt?.paymentIntentStatus ?? null,
      expectedPath,
      expectedStorageObjectExists: Boolean(expectedObject),
      receiptNoStorageObjectExists: Boolean(matchedObject?.object),
      matchedStoragePath: matchedObject?.object.name ?? null,
      storageMatchedBy: matchedObject?.matchedBy ?? null,
      bucketExists: bucket.exists,
      bucketIsPublic: bucket.isPublic
    };

    return {
      ...result,
      summary: diagnosticSummary(result)
    };
  } catch {
    return {
      receiptNo,
      receiptExists: false,
      receiptStatus: null,
      hasFileBucket: false,
      hasFilePath: false,
      hasFileSha256: false,
      hasGeneratedAt: false,
      paymentIntentExists: false,
      paymentIntentStatus: null,
      expectedPath: null,
      expectedStorageObjectExists: false,
      receiptNoStorageObjectExists: false,
      matchedStoragePath: null,
      storageMatchedBy: null,
      bucketExists: false,
      bucketIsPublic: null,
      summary: "diagnostic_error"
    };
  }
}

export function toSafeReceiptDiagnosticLog(diagnostic: ReceiptPdfDiagnostic) {
  return {
    receiptNo: diagnostic.receiptNo,
    summary: diagnostic.summary,
    receiptExists: diagnostic.receiptExists,
    receiptStatus: diagnostic.receiptStatus,
    hasFileBucket: diagnostic.hasFileBucket,
    hasFilePath: diagnostic.hasFilePath,
    hasFileSha256: diagnostic.hasFileSha256,
    hasGeneratedAt: diagnostic.hasGeneratedAt,
    paymentIntentExists: diagnostic.paymentIntentExists,
    paymentIntentStatus: diagnostic.paymentIntentStatus,
    expectedStorageObjectExists: diagnostic.expectedStorageObjectExists,
    receiptNoStorageObjectExists: diagnostic.receiptNoStorageObjectExists,
    storageMatchedBy: diagnostic.storageMatchedBy,
    bucketExists: diagnostic.bucketExists,
    bucketIsPublic: diagnostic.bucketIsPublic
  };
}
