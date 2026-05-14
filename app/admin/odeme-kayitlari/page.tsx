import { AdminPanelNotice } from "@/components/admin/AdminPanelNotice";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { mockPaymentRecords } from "@/data/adminOperationsMock";

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <article className="rounded-brand border border-border-soft bg-white p-5 shadow-card">
      <p className="text-sm font-bold text-ink-muted">{label}</p>
      <p className="mt-2 text-3xl font-extrabold text-dark-navy">{value}</p>
    </article>
  );
}

export default function AdminPaymentRecordsPage() {
  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="Bağış ve destek"
        title="Ödeme Kayıtları"
        description="Ödeme sağlayıcı entegrasyonu öncesi işlem kayıtlarının nasıl izleneceğini gösteren demo ekran."
      />
      <section className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Başarılı ödeme" value={1} />
        <SummaryCard label="Bekleyen ödeme" value={1} />
        <SummaryCard label="Başarısız ödeme" value={1} />
        <SummaryCard label="İade / iptal" value={0} />
      </section>
      <div className="grid gap-3 rounded-brand border border-border-soft bg-white p-4 shadow-card md:grid-cols-4">
        {["Ödeme durumu", "Ödeme yöntemi", "Tarih", "Proje"].map((label) => (
          <label key={label} className="text-sm font-bold text-dark-navy">
            {label}
            <input className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3" placeholder="Demo filtre" />
          </label>
        ))}
      </div>
      <AdminTable headers={["İşlem ID", "Bağışçı", "Tutar", "Yöntem", "Durum", "Tarih", "Referans"]}>
        {mockPaymentRecords.map((payment) => (
          <tr key={payment.id}>
            <td className="px-4 py-4 font-bold text-dark-navy">{payment.id}</td>
            <td className="px-4 py-4">{payment.donor}</td>
            <td className="px-4 py-4">{payment.amount}</td>
            <td className="px-4 py-4">{payment.method}</td>
            <td className="px-4 py-4"><AdminStatusBadge status={payment.status} /></td>
            <td className="px-4 py-4">{payment.date}</td>
            <td className="px-4 py-4 text-xs font-bold text-ink-muted">{payment.reference}</td>
          </tr>
        ))}
      </AdminTable>
      <AdminPanelNotice title="Güvenlik notu">
        Gerçek ödeme entegrasyonu yapılmadan bu alan demo verilerle çalışır; gerçek provider id ve webhook doğrulaması sonraki aşamada bağlanmalıdır.
      </AdminPanelNotice>
    </div>
  );
}
