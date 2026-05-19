import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { getQurbanCampaignsWithSource } from "@/lib/data/qurbanRepository";
import { formatDate } from "@/lib/format";
import { formatQurbanMoney, QurbanDataSourceBadge, QurbanProgress, QurbanStatusCell } from "@/app/admin/kurban/_components/QurbanAdminShared";

export default async function AdminQurbanCampaignsPage() {
  const { data: campaigns, source } = await getQurbanCampaignsWithSource();

  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="Kurban Çalışmaları"
        title="Kurban Kampanyaları"
        description="Kurban kampanyalarının tür, bölge, kontenjan ve yayın durumu read-only olarak izlenir. Oluşturma/düzenleme sonraki aşamaya bırakıldı."
      />
      <QurbanDataSourceBadge source={source} />
      <AdminFilterBar>
        <label className="text-sm font-bold text-dark-navy">Kampanya<input className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2" placeholder="Kampanya adı ara" /></label>
        <label className="text-sm font-bold text-dark-navy">Tür<select className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2"><option>Tümü</option><option>Vacip</option><option>Adak</option><option>Akika</option><option>Şükür</option><option>Nafile</option></select></label>
        <label className="text-sm font-bold text-dark-navy">Bölge<select className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2"><option>Tümü</option><option>Yurt içi</option><option>Yurt dışı</option></select></label>
        <label className="text-sm font-bold text-dark-navy">Durum<select className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2"><option>Tümü</option><option>Aktif</option><option>Taslak</option><option>Duraklatıldı</option></select></label>
      </AdminFilterBar>
      <AdminTable headers={["Kampanya", "Tür", "Bölge", "Birim bedel", "Kontenjan", "Tamamlanan", "Durum", "Başlangıç", "Bitiş", "İşlem"]} recordCount={campaigns.length} empty={!campaigns.length}>
        {campaigns.map((campaign) => (
          <tr key={campaign.id}>
            <td className="font-bold text-dark-navy">{campaign.title}</td>
            <td>{campaign.typeLabel}</td>
            <td>{campaign.regionLabel} · {campaign.country}</td>
            <td>{formatQurbanMoney(campaign.unitPrice, campaign.currency)}</td>
            <td>{campaign.quotaTotal}</td>
            <td><QurbanProgress completed={campaign.quotaCompleted} total={campaign.quotaTotal} /></td>
            <td><QurbanStatusCell status={campaign.statusLabel} /></td>
            <td>{formatDate(campaign.startDate)}</td>
            <td>{formatDate(campaign.endDate)}</td>
            <td><AdminActionButton href={`/kurban/${campaign.slug}`}>İncele</AdminActionButton></td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
