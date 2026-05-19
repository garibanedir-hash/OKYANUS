import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { mockQurbanDelegations } from "@/data/qurbanMock";
import { formatDate } from "@/lib/format";
import { QurbanStatusCell } from "@/app/admin/kurban/_components/QurbanAdminShared";

export default function AdminQurbanDelegationsPage() {
  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="Kurban Çalışmaları"
        title="Vekaletler"
        description="Vekalet kayıtları bu aşamada demo veriyle gösterilir. Production metni onaylanmadan gerçek vekalet akışı açılmamalıdır."
      />
      <div className="w-fit rounded bg-soft-blue px-3 py-1 text-xs font-extrabold text-deep-blue">Veri kaynağı: Demo fallback</div>
      <AdminFilterBar>
        <label className="text-sm font-bold text-dark-navy">Vekalet No<input className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2" placeholder="VKLT-2026..." /></label>
        <label className="text-sm font-bold text-dark-navy">Durum<select className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2"><option>Tümü</option><option>Bekliyor</option><option>Kabul edildi</option><option>Geri alındı</option></select></label>
        <label className="text-sm font-bold text-dark-navy">Kampanya<input className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2" placeholder="Kampanya adı" /></label>
      </AdminFilterBar>
      <AdminTable headers={["Vekalet No", "Bağışçı", "Kampanya", "Vekalet durumu", "Onay tarihi", "İlgili sipariş", "İşlem"]} recordCount={mockQurbanDelegations.length} empty={!mockQurbanDelegations.length}>
        {mockQurbanDelegations.map((delegation) => (
          <tr key={delegation.id}>
            <td className="font-bold text-dark-navy">{delegation.delegationNo}</td>
            <td>{delegation.donorDisplayName}<span className="block text-xs text-ink-muted">{delegation.donorEmailMasked}</span></td>
            <td>{delegation.campaignTitle}</td>
            <td><QurbanStatusCell status={delegation.statusLabel} /></td>
            <td>{delegation.acceptedAt ? formatDate(delegation.acceptedAt) : "Bekliyor"}</td>
            <td>{delegation.orderNo}</td>
            <td><AdminActionButton>Vekalet demo</AdminActionButton></td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
