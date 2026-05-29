import { logAdminAction } from "@/lib/audit/auditLogger";
import { getSupabaseReceiptWithPayment } from "@/lib/data/paymentRepository";
import { asAdminWriteClient } from "@/lib/data/adminWriteClient";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeRole } from "@/lib/auth/roleRedirect";
import { downloadReceiptPdf, markReceiptDownloaded } from "@/lib/receipts/receiptStorage";

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

type AccountAccessRow = {
  id: string;
  auth_user_id: string;
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

async function resolveViewerContext(userId: string) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return { isAdmin: false, accountId: null };

  const db = asAdminWriteClient(supabase);
  const [{ data: profile }, { data: account }] = await Promise.all([
    db.from<ProfileAccessRow>("profiles").select("id, role, status").eq("id", userId).maybeSingle(),
    db.from<AccountAccessRow>("user_accounts").select("id, auth_user_id, status").eq("auth_user_id", userId).maybeSingle()
  ]);
  const role = normalizeRole(profile?.role ?? "");
  const isAdmin = profile?.status === "active" && (role === "admin" || role === "super_admin");
  const accountId = account?.status === "active" ? account.id : null;

  return { isAdmin, accountId };
}

async function auditDownload(input: {
  actorId: string;
  action: "receipt.download.admin" | "receipt.download.donor";
  receiptId: string;
  receiptNo: string;
}) {
  try {
    await logAdminAction({
      actorId: input.actorId,
      action: input.action,
      entityType: "receipts",
      entityId: input.receiptId,
      summary: `Makbuz PDF görüntülendi: ${input.receiptNo}`,
      metadata: { receiptNo: input.receiptNo }
    });
  } catch {
    // Best-effort audit; download authorization already succeeded.
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

  const receipt = await getSupabaseReceiptWithPayment(receiptNo);
  if (!receipt) return textResponse("NOT FOUND", 404);
  if (!receipt.filePath) return textResponse("Makbuz PDF'i henüz oluşturulmamış.", 404);

  const viewer = await resolveViewerContext(user.id);
  const allowedAsDonor = Boolean(viewer.accountId && receipt.donorAccountId && viewer.accountId === receipt.donorAccountId);
  if (!viewer.isAdmin && !allowedAsDonor) return textResponse("FORBIDDEN", 403);
  if (!viewer.isAdmin && receipt.status === "cancelled") return textResponse("Makbuz iptal edilmiş.", 403);

  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await downloadReceiptPdf({
      file_bucket: receipt.fileBucket,
      file_path: receipt.filePath
    });
  } catch {
    return textResponse(
      viewer.isAdmin ? "Dosya kaydı var ama storage dosyası bulunamadı. PDF hazırlama işlemini tekrar çalıştırın." : "PDF NOT FOUND",
      404
    );
  }

  await markReceiptDownloaded(receipt.id);
  await auditDownload({
    actorId: user.id,
    action: viewer.isAdmin ? "receipt.download.admin" : "receipt.download.donor",
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
