import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminPanelNotice } from "@/components/admin/AdminPanelNotice";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { paymentContextTypeLabels, receiptStatusLabels } from "@/data/paymentMock";
import { getAdminReceiptsWithSource } from "@/lib/data/paymentRepository";
import { formatDate } from "@/lib/format";

type AdminReceiptsPageProps = {
  searchParams?: Promise<{ context_type?: string; status?: string; date_from?: string; date_to?: string }>;
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
        description="Makbuz hazırlık kayıtları ortak `receipts` tablosundan read-only izlenir. Bu aşamada gerçek PDF üretimi veya muhasebe entegrasyonu yoktur."
        actionLabel="PDF hazırla demo"
      />
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
        headers={["Makbuz No", "Ödeme No", "Bağışçı maskeli", "Bağlam", "Tutar", "Durum", "Tarih", "İşlem"]}
        recordCount={filteredReceipts.length}
        empty={!filteredReceipts.length}
      >
        {filteredReceipts.map((receipt) => (
          <tr key={receipt.id}>
            <td className="font-bold text-dark-navy">{receipt.receiptNo}</td>
            <td>{receipt.paymentIntentNo ?? "Ödeme bağlantısı yok"}</td>
            <td>
              {receipt.donorDisplayName}
              <span className="block text-xs text-ink-muted">{receipt.donorEmailMasked}</span>
            </td>
            <td>
              {receipt.contextTypeLabel}
              {receipt.contextId ? <span className="block text-xs text-ink-muted">{receipt.contextId.slice(0, 8)}</span> : null}
            </td>
            <td>{formatMoney(receipt.amount, receipt.currency)}</td>
            <td><AdminStatusBadge status={receipt.statusLabel} /></td>
            <td>{formatDate(receipt.createdAt)}</td>
            <td><AdminActionButton>PDF demo</AdminActionButton></td>
          </tr>
        ))}
      </AdminTable>
      <AdminPanelNotice title="Makbuz hazırlık notu">
        `receipts` kayıtları ödeme niyetiyle ilişkilendirilebilir, ancak PDF üretimi, dosya saklama ve e-posta gönderimi 9E kapsamında kapalıdır.
      </AdminPanelNotice>
    </div>
  );
}
