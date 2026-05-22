import { AdminActionButton } from "@/components/admin/AdminActionButton";
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
import { getAdminPaymentIntentsWithSource } from "@/lib/data/paymentRepository";
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

export default async function AdminPaymentRecordsPage({ searchParams }: AdminPaymentRecordsPageProps) {
  const params = await searchParams;
  const { data: paymentIntents, source } = await getAdminPaymentIntentsWithSource();
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
        description="Genel bağış, kurban ve yetim hamiliği için provider-bağımsız payment intent kayıtları read-only izlenir. Gerçek ödeme alma veya provider API çağrısı bu aşamada yoktur."
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
        headers={["Ödeme No", "Bağışçı maskeli", "Bağlam", "Tutar", "Para birimi", "Sağlayıcı", "Durum", "Tarih", "İşlem"]}
        recordCount={filteredPayments.length}
        empty={!filteredPayments.length}
      >
        {filteredPayments.map((payment) => (
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
            </td>
            <td>{formatMoney(payment.amount, payment.currency)}</td>
            <td>{payment.currency}</td>
            <td>
              {payment.providerLabel}
              {payment.providerReferenceMasked ? <span className="block text-xs text-ink-muted">{payment.providerReferenceMasked}</span> : null}
            </td>
            <td><AdminStatusBadge status={payment.statusLabel} /></td>
            <td>{formatDate(payment.createdAt)}</td>
            <td><AdminActionButton>Manuel ödendi demo</AdminActionButton></td>
          </tr>
        ))}
      </AdminTable>
      <AdminPanelNotice title="9E ödeme altyapısı">
        Bu ekran `payment_intents` tablosuna göre hazırlanmıştır. Provider webhook, canlı ödeme doğrulama ve kart bilgisi saklama yoktur; manuel aksiyonlar gerçek veri değiştirmeyen demo kontrol olarak kalır.
      </AdminPanelNotice>
    </div>
  );
}
