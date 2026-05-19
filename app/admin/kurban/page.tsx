import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminChartCard } from "@/components/admin/AdminChartCard";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { mockQurbanDelegations } from "@/data/qurbanMock";
import {
  getAdminQurbanOperationsWithSource,
  getAdminQurbanOrdersWithSource,
  getQurbanStats
} from "@/lib/data/qurbanRepository";
import { formatDate } from "@/lib/format";
import { formatQurbanMoney, QurbanDataSourceBadge, QurbanProgress, QurbanStatGrid, QurbanStatusCell } from "@/app/admin/kurban/_components/QurbanAdminShared";

export default async function AdminQurbanPage() {
  const stats = await getQurbanStats();
  const { data: orders, source: ordersSource } = await getAdminQurbanOrdersWithSource();
  const { data: operations, source: operationsSource } = await getAdminQurbanOperationsWithSource();
  const pendingDelegations = mockQurbanDelegations.filter((delegation) => delegation.status === "pending");

  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="Kurban Çalışmaları"
        title="Kurban Operasyon Merkezi"
        description="Vekalet, ödeme durumu, kesim planı, dağıtım ve bilgilendirme akışları bu modülde demo/read-only olarak izlenir. Gerçek kayıt ve ödeme işlemleri kapalıdır."
      />
      <div className="flex flex-wrap gap-2">
        <QurbanDataSourceBadge source={ordersSource} />
        <QurbanDataSourceBadge source={operationsSource} />
      </div>
      <QurbanStatGrid
        items={[
          { label: "Toplam kurban bağışı", value: stats.totalOrders },
          { label: "Toplam hisse/adet", value: stats.totalShares },
          { label: "Vekalet bekleyen", value: stats.delegationPending },
          { label: "Ödeme bekleyen", value: stats.paymentPending },
          { label: "Kesim planlanan", value: stats.scheduled },
          { label: "Kesimi tamamlanan", value: stats.slaughtered },
          { label: "Dağıtımı tamamlanan", value: stats.distributed },
          { label: "Bilgilendirme bekleyen", value: stats.notificationPending }
        ]}
      />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <AdminTable headers={["Sipariş No", "Bağışçı", "Kurban", "Tutar", "Ödeme", "Vekalet", "Durum", "Tarih"]} recordCount={orders.slice(0, 5).length}>
          {orders.slice(0, 5).map((order) => (
            <tr key={order.id}>
              <td className="font-bold text-dark-navy">{order.orderNo}</td>
              <td>{order.donorDisplayName}</td>
              <td>{order.qurbanTypeLabel} · {order.shareCount}</td>
              <td>{formatQurbanMoney(order.totalAmount, order.currency)}</td>
              <td><QurbanStatusCell status={order.paymentStatusLabel} /></td>
              <td><QurbanStatusCell status={order.delegationStatusLabel} /></td>
              <td><QurbanStatusCell status={order.orderStatusLabel} /></td>
              <td>{formatDate(order.createdAt)}</td>
            </tr>
          ))}
        </AdminTable>

        <AdminChartCard title="Bekleyen vekaletler" description="Demo vekalet kayıtları gerçek kişisel veri içermez.">
          <div className="grid gap-3">
            {pendingDelegations.length ? pendingDelegations.map((delegation) => (
              <div key={delegation.id} className="rounded-lg border border-border-soft bg-soft-gray p-4">
                <p className="text-xs font-extrabold uppercase text-ocean-green">{delegation.delegationNo}</p>
                <h2 className="mt-1 font-extrabold text-dark-navy">{delegation.donorDisplayName}</h2>
                <p className="mt-1 text-sm text-ink-muted">{delegation.campaignTitle}</p>
              </div>
            )) : (
              <p className="text-sm font-semibold text-ink-muted">Bekleyen vekalet bulunmuyor.</p>
            )}
          </div>
        </AdminChartCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <AdminChartCard title="Kesim planı" description="Sorumlu koordinatör ve personel atamaları demo kapsamındadır.">
          <div className="grid gap-3">
            {operations.slice(0, 4).map((operation) => (
              <div key={operation.id} className="rounded-lg border border-border-soft bg-soft-gray p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-extrabold uppercase text-ocean-green">{operation.operationNo}</p>
                    <h2 className="mt-1 font-extrabold text-dark-navy">{operation.country} · {operation.cityOrRegion}</h2>
                  </div>
                  <QurbanStatusCell status={operation.statusLabel} />
                </div>
                <div className="mt-3">
                  <QurbanProgress completed={operation.completedShares} total={operation.totalShares} />
                </div>
              </div>
            ))}
          </div>
        </AdminChartCard>

        <AdminChartCard title="Bölge/ülke dağılımı" description="Raporlama için hazırlık göstergesi.">
          <div className="grid gap-3">
            {stats.regionBreakdown.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-lg bg-soft-gray p-4">
                <span className="font-extrabold text-dark-navy">{item.label}</span>
                <span className="text-sm font-black text-deep-blue">{item.value} hisse/adet</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <AdminActionButton href="/admin/kurban/raporlar">Raporları Aç</AdminActionButton>
            <AdminActionButton href="/admin/kurban/export">Export Hazırlığı</AdminActionButton>
          </div>
        </AdminChartCard>
      </section>
    </div>
  );
}
