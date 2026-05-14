import { AdminPanelNotice } from "@/components/admin/AdminPanelNotice";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { mockReceipts } from "@/data/adminOperationsMock";

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <article className="rounded-brand border border-border-soft bg-white p-5 shadow-card">
      <p className="text-sm font-bold text-ink-muted">{label}</p>
      <p className="mt-2 text-3xl font-extrabold text-dark-navy">{value}</p>
    </article>
  );
}

export default function AdminReceiptsPage() {
  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="Bağış ve destek"
        title="Makbuzlar"
        description="Bağış makbuzu süreçlerini izlemek için hazırlanmış demo yönetim ekranı."
        actionLabel="PDF Hazırla demo"
      />
      <section className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Toplam makbuz" value={mockReceipts.length} />
        <SummaryCard label="Bekleyen makbuz" value={1} />
        <SummaryCard label="Kesilen makbuz" value={1} />
        <SummaryCard label="Hatalı / iptal" value={0} />
      </section>
      <div className="grid gap-3 rounded-brand border border-border-soft bg-white p-4 shadow-card md:grid-cols-4">
        {["Tarih aralığı", "Proje", "Makbuz durumu", "Bağışçı"].map((label) => (
          <label key={label} className="text-sm font-bold text-dark-navy">
            {label}
            <input className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3" placeholder="Demo filtre" />
          </label>
        ))}
      </div>
      <AdminTable headers={["Makbuz No", "Bağışçı", "Tutar", "Proje", "Durum", "Tarih", "İşlem"]}>
        {mockReceipts.map((receipt) => (
          <tr key={receipt.receiptNo}>
            <td className="px-4 py-4 font-bold text-dark-navy">{receipt.receiptNo}</td>
            <td className="px-4 py-4">{receipt.donor}</td>
            <td className="px-4 py-4">{receipt.amount}</td>
            <td className="px-4 py-4">{receipt.project}</td>
            <td className="px-4 py-4"><AdminStatusBadge status={receipt.status} /></td>
            <td className="px-4 py-4">{receipt.date}</td>
            <td className="px-4 py-4 text-sm font-bold text-ocean-green">Makbuzu Gör / Demo</td>
          </tr>
        ))}
      </AdminTable>
      <AdminPanelNotice title="Demo makbuz alanı">
        Gerçek ödeme ve muhasebe entegrasyonu yapılmadan makbuz üretimi yalnızca arayüz önizlemesi olarak gösterilir.
      </AdminPanelNotice>
    </div>
  );
}
