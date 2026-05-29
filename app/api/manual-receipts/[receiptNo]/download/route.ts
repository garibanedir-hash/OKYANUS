import { logAdminAction } from "@/lib/audit/auditLogger";
import { normalizeRole } from "@/lib/auth/roleRedirect";
import { asAdminWriteClient } from "@/lib/data/adminWriteClient";
import { getManualReceiptByNo } from "@/lib/data/manualReceiptRepository";
import { downloadManualReceiptPdf } from "@/lib/receipts/manualReceiptStorage";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ receiptNo: string }>;
};

type ProfileAccessRow = {
  id: string;
  role: string | null;
  status: string | null;
};

function textResponse(body: string, status: number) {
  return new Response(body, {
    status,
    headers: { "content-type": "text/plain; charset=utf-8" }
  });
}

function safeFileName(receiptNo: string) {
  return `${receiptNo.replace(/[^a-zA-Z0-9-]/g, "-")}.pdf`;
}

async function isAdminViewer(userId: string) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return false;
  const db = asAdminWriteClient(supabase);
  const { data } = await db.from<ProfileAccessRow>("profiles").select("id, role, status").eq("id", userId).maybeSingle();
  const role = normalizeRole(data?.role ?? "");
  return data?.status === "active" && (role === "admin" || role === "super_admin");
}

async function auditManualReceiptDownload(input: { actorId: string; receiptId: string; receiptNo: string }) {
  try {
    await logAdminAction({
      actorId: input.actorId,
      action: "manual_receipt.download.admin",
      entityType: "manual_receipts",
      entityId: input.receiptId,
      summary: `Manuel makbuz PDF görüntülendi: ${input.receiptNo}`,
      metadata: { receiptNo: input.receiptNo }
    });
  } catch {
    // Best-effort audit; authorization and storage read already succeeded.
  }
}

export async function GET(_request: Request, context: RouteContext) {
  const { receiptNo } = await context.params;
  const supabase = await createSupabaseServerClient();
  if (!supabase) return textResponse("AUTH REQUIRED", 401);

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) return textResponse("AUTH REQUIRED", 401);
  const isAdmin = await isAdminViewer(user.id);
  if (!isAdmin) return textResponse("FORBIDDEN", 403);

  const receipt = await getManualReceiptByNo(receiptNo);
  if (!receipt) return textResponse("NOT FOUND", 404);
  if (!receipt.filePath) return textResponse("Manuel makbuz PDF'i henüz oluşturulmamış.", 404);

  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await downloadManualReceiptPdf(receipt);
  } catch {
    return textResponse("Dosya kaydı var ama private storage dosyası bulunamadı. PDF oluşturma işlemini tekrar çalıştırın.", 404);
  }

  await auditManualReceiptDownload({
    actorId: user.id,
    receiptId: receipt.id,
    receiptNo: receipt.receiptNo
  });

  return new Response(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `inline; filename="${safeFileName(receipt.receiptNo)}"`,
      "cache-control": "private, no-store"
    }
  });
}
