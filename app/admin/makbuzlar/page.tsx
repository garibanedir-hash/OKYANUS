import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminPanelNotice } from "@/components/admin/AdminPanelNotice";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { paymentContextTypeLabels, receiptStatusLabels } from "@/data/paymentMock";
import { getAdminReceiptsWithSource } from "@/lib/data/paymentRepository";
import { formatDate } from "@/lib/format";
import { cancelReceiptAction, generateReceiptPdfAction, markReceiptIssuedAction, regenerateReceiptPdfAction } from "./actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type AdminReceiptsPageProps = {
  searchParams?: Promise<{ context_type?: string; status?: string; date_from?: string; date_to?: string; durum?: string; mesaj?: string }>;
};

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <article className="rounded-lg border border-border-soft bg-white p-5 shadow-sm">
      <p className="text-xs font-extrabold uppercase text-ink-muted">{label}</p>
      <p className="mt-2 text-2xl font-black text-dark-navy">{value}</p>
    </article>
  );
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(amount);
}

function matchesDateRange(createdAt: string, dateFrom?: string, dateTo?: string) {
  if (!dateFrom && !dateTo) return true;
  const date = new Date(createdAt);
  if (Number.isNaN(date.valueOf())) return true;

  if (dateFrom && date < new Date(`${dateFrom}T00:00:00.000Z`)) return false;
  if (dateTo && date > new Date(`${dateTo}T23:59:59.999Z`)) return false;

  return true;
}

function DisabledDemoButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      disabled
      className="inline-flex min-h-8 cursor-not-allowed items-center justify-center rounded-md border border-border-soft bg-soft-gray px-2.5 py-1 text-[0.72rem] font-extrabold text-ink-muted"
    >
      {children}
    </button>
  );
}

function PdfGenerateButton({ receiptId, receiptNo, disabled }: { receiptId: string; receiptNo: string; disabled: boolean }) {
  return (
    <form action={generateReceiptPdfAction}>
      <input type="hidden" name="receipt_id" value={receiptId} />
      <input type="hidden" name="receipt_no" value={receiptNo} />
      <button
        type="submit"
        disabled={disabled}
        className="inline-flex min-h-8 items-center justify-center rounded-md border border-border-soft bg-white px-2.5 py-1 text-[0.72rem] font-extrabold text-deep-blue disabled:cursor-not-allowed disabled:bg-soft-gray disabled:text-ink-muted"
      >
        PDF Hazırla
      </button>
    </form>
  );
}

function PdfViewLink({ receiptNo }: { receiptNo: string }) {
  return (
    <a
      href={`/api/receipts/${receiptNo}/download`}
      className="focus-ring inline-flex min-h-8 items-center justify-center rounded-md bg-deep-blue px-2.5 py-1 text-[0.72rem] font-extrabold text-white"
    >
      PDF Görüntüle
    </a>
  );
}

function PdfRegenerateForm({ receiptId, receiptNo, issued }: { receiptId: string; receiptNo: string; issued: boolean }) {
  return (
    <form action={regenerateReceiptPdfAction} className="grid gap-1">
      <input type="hidden" name="receipt_id" value={receiptId} />
      <input type="hidden" name="receipt_no" value={receiptNo} />
      {issued ? (
        <input
          name="reason"
          required
          placeholder="Yeniden oluşturma gerekçesi"
          className="h-8 w-40 rounded-md border border-border-soft px-2 text-[0.72rem] font-bold text-dark-navy"
        />
      ) : null}
      <button
        type="submit"
        className="inline-flex min-h-8 items-center justify-center rounded-md border border-border-soft bg-white px-2.5 py-1 text-[0.72rem] font-extrabold text-deep-blue"
      >
        PDF Yeniden Oluştur
      </button>
    </form>
  );
}

function MarkIssuedForm({ receiptId, receiptNo }: { receiptId: string; receiptNo: string }) {
  return (
    <form action={markReceiptIssuedAction}>
      <input type="hidden" name="receipt_id" value={receiptId} />
      <input type="hidden" name="receipt_no" value={receiptNo} />
      <button
        type="submit"
        className="inline-flex min-h-8 items-center justify-center rounded-md bg-ocean-green px-2.5 py-1 text-[0.72rem] font-extrabold text-white"
      >
        Makbuzu Onayla
      </button>
    </form>
  );
}

function CancelReceiptForm({ receiptId, receiptNo }: { receiptId: string; receiptNo: string }) {
  return (
    <form action={cancelReceiptAction} className="grid gap-1">
      <input type="hidden" name="receipt_id" value={receiptId} />
      <input type="hidden" name="receipt_no" value={receiptNo} />
      <input
        name="reason"
        required
        minLength={5}
        placeholder="İptal gerekçesi"
        className="h-8 w-40 rounded-md border border-border-soft px-2 text-[0.72rem] font-bold text-dark-navy"
      />
      <button
        type="submit"
        className="inline-flex min-h-8 items-center justify-center rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-[0.72rem] font-extrabold text-red-700"
      >
        Makbuzu İptal Et
      </button>
    </form>
  );
}

function receiptHasPdf(receipt: { hasPdf?: boolean; filePath?: string; file_path?: string }) {
  return Boolean(receipt.hasPdf || receipt.filePath || receipt.file_path);
}

function getPdfStatusLabel(receipt: { hasPdf?: boolean; filePath?: string; file_path?: string; status: string }) {
  if (!receiptHasPdf(receipt)) return "PDF Yok";
  if (receipt.status === "issued") return "Kesildi";
  if (receipt.status === "cancelled") return "İptal";
  return "Hazırlandı";
}

function statusMessage(durum?: string, mesaj?: string) {
  if (durum === "pdf-hazirlandi") return "Makbuz PDF private storage içinde hazırlandı.";
  if (durum === "pdf-yeniden-olusturuldu") return "Makbuz PDF yeni versiyon olarak yeniden oluşturuldu.";
  if (durum === "pdf-onarildi") return "Makbuz PDF dosyası bulundu ve DB metadata kaydı onarıldı.";
  if (durum === "pdf-zaten-hazir") return "Makbuz PDF zaten hazır.";
  if (durum === "makbuz-onaylandi") return "Makbuz kesildi olarak işaretlendi.";
  if (durum === "makbuz-zaten-onayli") return "Makbuz zaten kesildi olarak işaretli.";
  if (durum === "makbuz-iptal-edildi") return "Makbuz iptal edildi ve gerekçe kaydedildi.";
  if (durum === "makbuz-zaten-iptal") return "Makbuz zaten iptal edilmiş.";
  return mesaj ?? "Makbuz işlemi tamamlanamadı.";
}

export default async function AdminReceiptsPage({ searchParams }: AdminReceiptsPageProps) {
  const params = await searchParams;
  const { data: receipts, source } = await getAdminReceiptsWithSource();
  const filteredReceipts = receipts.filter((receipt) => {
    const contextMatch = !params?.context_type || params.context_type === "all" || receipt.contextType === params.context_type;
    const statusMatch = !params?.status || params.status === "all" || receipt.status === params.status;
    const dateMatch = matchesDateRange(receipt.createdAt, params?.date_from, params?.date_to);

    return contextMatch && statusMatch && dateMatch;
  });

  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="Bağış ve destek"
        title="Makbuzlar"
        description="Makbuz hazırlık kayıtları ortak `receipts` tablosundan izlenir. Paid ödemeler için kurumsal PDF private storage içinde hazırlanır; görüntüleme yetki kontrollüdür."
      />
      {params?.durum ? (
        <div className="rounded-lg border border-ocean-green/20 bg-mint-green/35 p-4 text-sm font-bold text-dark-navy">
          {statusMessage(params.durum, params.mesaj)}
        </div>
      ) : null}
      <div className="w-fit rounded bg-soft-blue px-3 py-1 text-xs font-extrabold text-deep-blue">
        {source === "supabase" ? "Supabase receipts" : "Demo/mock fallback"}
      </div>
      <section className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Toplam makbuz" value={receipts.length} />
        <SummaryCard label="Bekleyen" value={receipts.filter((item) => item.status === "pending").length} />
        <SummaryCard label="Hazırlanan" value={receipts.filter((item) => item.status === "prepared").length} />
        <SummaryCard label="Kesilen" value={receipts.filter((item) => item.status === "issued").length} />
      </section>
      <form>
        <AdminFilterBar>
          <label>
            Bağlam
            <select name="context_type" defaultValue={params?.context_type ?? "all"}>
              <option value="all">Tümü</option>
              {Object.entries(paymentContextTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Durum
            <select name="status" defaultValue={params?.status ?? "all"}>
              <option value="all">Tümü</option>
              {Object.entries(receiptStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Başlangıç
            <input name="date_from" type="date" defaultValue={params?.date_from ?? ""} />
          </label>
          <label>
            Bitiş
            <input name="date_to" type="date" defaultValue={params?.date_to ?? ""} />
          </label>
          <div className="flex items-end gap-2">
            <button type="submit" className="focus-ring inline-flex h-8 items-center rounded-md bg-ocean-green px-3 text-xs font-extrabold text-white">
              Filtrele
            </button>
            <a href="/admin/makbuzlar" className="focus-ring inline-flex h-8 items-center rounded-md border border-border-soft bg-white px-3 text-xs font-extrabold text-deep-blue">
              Temizle
            </a>
          </div>
        </AdminFilterBar>
      </form>
      <AdminTable
        headers={["Makbuz No", "Ödeme No", "Bağışçı maskeli", "Bağlam", "Tutar", "Durum", "PDF", "Tarihler", "İşlem"]}
        recordCount={filteredReceipts.length}
        empty={!filteredReceipts.length}
      >
        {filteredReceipts.map((receipt) => {
          const paymentIsPaid = receipt.paymentIntentStatus === "paid";
          const hasPdf = receiptHasPdf(receipt);
          const canGeneratePdf = source === "supabase" && !hasPdf && paymentIsPaid && ["pending", "prepared"].includes(receipt.status);
          const canRegeneratePdf = source === "supabase" && hasPdf && ["prepared", "issued"].includes(receipt.status);
          const canMarkIssued = source === "supabase" && hasPdf && receipt.status === "prepared";
          const canCancel = source === "supabase" && ["pending", "prepared", "issued"].includes(receipt.status);

          return (
            <tr key={receipt.id}>
              <td className="font-bold text-dark-navy">
                {receipt.receiptNo}
                {receipt.version ? <span className="block text-xs text-ink-muted">v{receipt.version}</span> : null}
              </td>
              <td>
                {receipt.paymentIntentNo ?? "Ödeme bağlantısı yok"}
                <span className="block text-xs text-ink-muted">{receipt.paymentIntentStatusLabel ?? "Ödeme bilgisi okunamadı"}</span>
              </td>
              <td>
                {receipt.donorDisplayName}
                <span className="block text-xs text-ink-muted">{receipt.donorEmailMasked}</span>
              </td>
              <td>
                {receipt.contextTypeLabel}
                {receipt.contextId ? <span className="block text-xs text-ink-muted">{receipt.contextId.slice(0, 8)}</span> : null}
              </td>
              <td>{formatMoney(receipt.amount, receipt.currency)}</td>
              <td>
                <AdminStatusBadge status={receipt.statusLabel} />
              </td>
              <td>
                <AdminStatusBadge status={getPdfStatusLabel(receipt)} />
                <span className="mt-1 block text-xs font-bold text-ink-muted">v{receipt.version ?? 1}</span>
                {receipt.generatedAt ? <span className="mt-1 block text-xs text-ink-muted">{formatDate(receipt.generatedAt)}</span> : null}
                {receipt.fileSizeBytes ? <span className="block text-xs text-ink-muted">{Math.ceil(receipt.fileSizeBytes / 1024)} KB</span> : null}
                {receipt.fileSha256 ? <span className="block text-xs text-ink-muted">sha256 kayıtlı</span> : null}
              </td>
              <td>
                <span className="block text-xs text-ink-muted">Kayıt</span>
                <span className="block font-bold text-dark-navy">{formatDate(receipt.createdAt)}</span>
                {receipt.issuedAt ? (
                  <>
                    <span className="mt-2 block text-xs text-ink-muted">Kesildi</span>
                    <span className="block font-bold text-ocean-green">{formatDate(receipt.issuedAt)}</span>
                  </>
                ) : null}
                {receipt.cancelledAt ? (
                  <>
                    <span className="mt-2 block text-xs text-ink-muted">İptal</span>
                    <span className="block font-bold text-red-700">{formatDate(receipt.cancelledAt)}</span>
                  </>
                ) : null}
                {receipt.cancelledReason ? <span className="mt-1 block max-w-48 text-xs text-ink-muted">{receipt.cancelledReason}</span> : null}
              </td>
              <td>
                {source === "demo" ? (
                  <DisabledDemoButton>Supabase kaydı gerekir</DisabledDemoButton>
                ) : (
                  <div className="flex min-w-44 flex-wrap gap-2">
                    {hasPdf ? <PdfViewLink receiptNo={receipt.receiptNo} /> : null}
                    {canGeneratePdf ? <PdfGenerateButton receiptId={receipt.id} receiptNo={receipt.receiptNo} disabled={false} /> : null}
                    {!hasPdf && !canGeneratePdf && paymentIsPaid ? <DisabledDemoButton>PDF kapalı</DisabledDemoButton> : null}
                    {!hasPdf && !paymentIsPaid ? <PdfGenerateButton receiptId={receipt.id} receiptNo={receipt.receiptNo} disabled /> : null}
                    {canRegeneratePdf ? <PdfRegenerateForm receiptId={receipt.id} receiptNo={receipt.receiptNo} issued={receipt.status === "issued"} /> : null}
                    {canMarkIssued ? <MarkIssuedForm receiptId={receipt.id} receiptNo={receipt.receiptNo} /> : null}
                    {canCancel ? <CancelReceiptForm receiptId={receipt.id} receiptNo={receipt.receiptNo} /> : null}
                    {receipt.status === "cancelled" ? <DisabledDemoButton>İptal edildi</DisabledDemoButton> : null}
                  </div>
                )}
              </td>
            </tr>
          );
        })}
      </AdminTable>
      <AdminPanelNotice title="Makbuz hazırlık notu">
        PDF yalnızca paid ödeme ilişkili, iptal edilmemiş makbuzlar için hazırlanır. Yeniden oluşturma işlemi eski dosyayı silmeden v2/v3 olarak yeni dosya üretir ve aktif file_path son versiyonu gösterir. Kesildi/iptal workflow kaydı audit log sistemine yazılır; e-posta gönderimi ve muhasebe entegrasyonu sonraki aşamadadır.
      </AdminPanelNotice>
    </div>
  );
}
