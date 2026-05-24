import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminPanelNotice } from "@/components/admin/AdminPanelNotice";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import {
  paymentContextTypeLabels,
  paymentIntentStatusLabels,
  paymentProviderLabels
} from "@/data/paymentMock";
import { getAdminPaymentIntentsWithSource, getAdminReceipts } from "@/lib/data/paymentRepository";
import { formatDate } from "@/lib/format";

type AdminPaymentRecordsPageProps = {
  searchParams?: Promise<{
    context_type?: string;
    status?: string;
    provider?: string;
    date_from?: string;
    date_to?: string;
  }>;
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

function PaymentAction({ intentNo, canOpen }: { intentNo: string; canOpen: boolean }) {
  if (canOpen) {
    return (
      <a
        href={`/odeme/paytr/${intentNo}`}
        className="focus-ring inline-flex min-h-8 items-center justify-center rounded-md bg-deep-blue px-2.5 py-1 text-[0.72rem] font-extrabold text-white"
      >
        Ödeme sayfasını aç
      </a>
    );
  }

  return <DisabledDemoButton>Manuel ödendi demo</DisabledDemoButton>;
}

function getFinalizationStatus(payment: {
  status: string;
  paidAt?: string | null;
  failedAt?: string | null;
  cancelledAt?: string | null;
}) {
  if (payment.status === "paid" && payment.paidAt) return "Tamamlandı";
  if (["failed", "cancelled", "refunded"].includes(payment.status)) return "İşlendi";
  if (["pending", "initiated", "requires_action"].includes(payment.status)) return "Bekliyor";
  return "İşlenmedi";
}

function getResultDate(payment: {
  status: string;
  paidAt?: string | null;
  failedAt?: string | null;
  cancelledAt?: string | null;
}) {
  if (payment.status === "paid") return payment.paidAt;
  if (payment.status === "failed") return payment.failedAt;
  if (payment.status === "cancelled") return payment.cancelledAt;
  return null;
}

export default async function AdminPaymentRecordsPage({ searchParams }: AdminPaymentRecordsPageProps) {
  const params = await searchParams;
  const [{ data: paymentIntents, source }, receipts] = await Promise.all([
    getAdminPaymentIntentsWithSource(),
    getAdminReceipts()
  ]);
  const receiptsByPaymentIntent = new Map(receipts.filter((receipt) => receipt.paymentIntentId).map((receipt) => [receipt.paymentIntentId, receipt]));
  const filteredPayments = paymentIntents.filter((payment) => {
    const contextMatch = !params?.context_type || params.context_type === "all" || payment.contextType === params.context_type;
    const statusMatch = !params?.status || params.status === "all" || payment.status === params.status;
    const providerMatch = !params?.provider || params.provider === "all" || payment.provider === params.provider;
    const dateMatch = matchesDateRange(payment.createdAt, params?.date_from, params?.date_to);

    return contextMatch && statusMatch && providerMatch && dateMatch;
  });

  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="Bağış ve destek"
        title="Ödeme Kayıtları"
        description="Genel bağış, kurban ve yetim hamiliği için payment intent kayıtları read-only izlenir. 10C ile PayTR callback sonucu, provider referansı ve bağlam finalizasyon özeti görünür; canlı ödeme alma kapalıdır."
      />
      <div className="w-fit rounded bg-soft-blue px-3 py-1 text-xs font-extrabold text-deep-blue">
        {source === "supabase" ? "Supabase payment_intents" : "Demo/mock fallback"}
      </div>
      <section className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Toplam ödeme niyeti" value={paymentIntents.length} />
        <SummaryCard label="Ödeme bekliyor" value={paymentIntents.filter((item) => ["draft", "pending", "initiated", "requires_action"].includes(item.status)).length} />
        <SummaryCard label="Ödendi" value={paymentIntents.filter((item) => item.status === "paid").length} />
        <SummaryCard label="Başarısız" value={paymentIntents.filter((item) => item.status === "failed").length} />
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
              {Object.entries(paymentIntentStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Sağlayıcı
            <select name="provider" defaultValue={params?.provider ?? "all"}>
              <option value="all">Tümü</option>
              {Object.entries(paymentProviderLabels).map(([value, label]) => (
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
            <a href="/admin/odeme-kayitlari" className="focus-ring inline-flex h-8 items-center rounded-md border border-border-soft bg-white px-3 text-xs font-extrabold text-deep-blue">
              Temizle
            </a>
          </div>
        </AdminFilterBar>
      </form>
      <AdminTable
        headers={["Ödeme No", "Bağışçı maskeli", "Bağlam", "Tutar", "Para birimi", "Sağlayıcı", "Durum", "Finalizasyon", "Makbuz", "Tarih", "İşlem"]}
        recordCount={filteredPayments.length}
        empty={!filteredPayments.length}
      >
        {filteredPayments.map((payment) => {
          const canOpenPaymentPage = payment.provider === "paytr" && ["pending", "initiated", "requires_action"].includes(payment.status);
          const resultDate = getResultDate(payment);
          const receipt = receiptsByPaymentIntent.get(payment.id);

          return (
            <tr key={payment.id}>
              <td className="font-bold text-dark-navy">{payment.intentNo}</td>
              <td>
                {payment.donorDisplayName}
                <span className="block text-xs text-ink-muted">{payment.donorEmailMasked}</span>
                <span className="block text-xs text-ink-muted">{payment.donorPhoneMasked}</span>
              </td>
              <td>
                {payment.contextTypeLabel}
                {payment.contextId ? <span className="block text-xs text-ink-muted">{payment.contextId.slice(0, 8)}</span> : null}
                <span className="block text-xs text-ink-muted">{payment.metadataSummary}</span>
              </td>
              <td>{formatMoney(payment.amount, payment.currency)}</td>
              <td>{payment.currency}</td>
              <td>
                {payment.providerLabel}
                {payment.providerReferenceMasked ? <span className="block text-xs text-ink-muted">Ref: {payment.providerReferenceMasked}</span> : null}
                {payment.provider === "paytr" && payment.status === "initiated" ? (
                  <span className="block text-xs font-bold text-deep-blue">PayTR callback bekleniyor</span>
                ) : null}
              </td>
              <td>
                <AdminStatusBadge status={payment.statusLabel} />
              </td>
              <td>
                <AdminStatusBadge status={getFinalizationStatus(payment)} />
                {resultDate ? <span className="mt-1 block text-xs text-ink-muted">Sonuç: {formatDate(resultDate)}</span> : null}
              </td>
              <td>
                {receipt ? (
                  <>
                    <AdminStatusBadge status={receipt.statusLabel} />
                    <a href="/admin/makbuzlar" className="mt-1 block text-xs font-bold text-deep-blue">
                      {receipt.hasPdf ? "PDF hazır" : "PDF bekliyor"}
                    </a>
                  </>
                ) : payment.status === "paid" ? (
                  <span className="text-xs font-bold text-ink-muted">Makbuz bekliyor</span>
                ) : (
                  <span className="text-xs text-ink-muted">Ödeme bekleniyor</span>
                )}
              </td>
              <td>{formatDate(payment.createdAt)}</td>
              <td>
                <PaymentAction intentNo={payment.intentNo} canOpen={canOpenPaymentPage} />
              </td>
            </tr>
          );
        })}
      </AdminTable>
      <AdminPanelNotice title="10C callback finalizasyonu">
        Bu ekran `payment_intents` tablosuna göre hazırlanmıştır. PayTR test entegrasyonunda kesin onay yalnızca `/api/paytr/callback`
        hash doğrulaması, tutar kontrolü ve idempotent finalization RPC akışıyla işlenir; manuel aksiyonlar pasif demo kontrol olarak kalır.
      </AdminPanelNotice>
    </div>
  );
}
