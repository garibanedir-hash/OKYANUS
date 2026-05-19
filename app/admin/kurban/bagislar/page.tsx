import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { getAdminQurbanOrdersWithSource } from "@/lib/data/qurbanRepository";
import { formatDate } from "@/lib/format";
import { formatQurbanMoney, QurbanDataSourceBadge, QurbanStatusCell } from "@/app/admin/kurban/_components/QurbanAdminShared";

export default async function AdminQurbanOrdersPage() {
  const { data: orders, source } = await getAdminQurbanOrdersWithSource();

  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="Kurban Çalışmaları"
        title="Kurban Bağışları"
        description="Kurban bağışı kayıtları bu aşamada maskeli ve read-only gösterilir. Gerçek ödeme, makbuz ve kayıt işlemi yapılmaz."
      />
      <QurbanDataSourceBadge source={source} />
      <AdminFilterBar>
        <label className="text-sm font-bold text-dark-navy">Sipariş<input className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2" placeholder="KRB-2026..." /></label>
        <label className="text-sm font-bold text-dark-navy">Ödeme<select className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2"><option>Tümü</option><option>Bekliyor</option><option>Ödendi</option></select></label>
        <label className="text-sm font-bold text-dark-navy">Vekalet<select className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2"><option>Tümü</option><option>Bekliyor</option><option>Kabul edildi</option></select></label>
        <label className="text-sm font-bold text-dark-navy">Durum<select className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2"><option>Tümü</option><option>Kesim planlandı</option><option>Kesim tamamlandı</option></select></label>
      </AdminFilterBar>
      <AdminTable headers={["Sipariş No", "Bağışçı", "Kurban türü", "Hisse/adet", "Tutar", "Ödeme durumu", "Vekalet durumu", "Kurban durumu", "Tarih", "İşlem"]} recordCount={orders.length} empty={!orders.length}>
        {orders.map((order) => (
          <tr key={order.id}>
            <td className="font-bold text-dark-navy">{order.orderNo}</td>
            <td>{order.donorDisplayName}<span className="block text-xs text-ink-muted">{order.donorEmailMasked}</span></td>
            <td>{order.qurbanTypeLabel}</td>
            <td>{order.shareCount}</td>
            <td>{formatQurbanMoney(order.totalAmount, order.currency)}</td>
            <td><QurbanStatusCell status={order.paymentStatusLabel} /></td>
            <td><QurbanStatusCell status={order.delegationStatusLabel} /></td>
            <td><QurbanStatusCell status={order.orderStatusLabel} /></td>
            <td>{formatDate(order.createdAt)}</td>
            <td><AdminActionButton>Detay demo</AdminActionButton></td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
