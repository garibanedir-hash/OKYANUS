import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { getAdminPaymentIntents } from "@/lib/data/paymentRepository";
import { getAdminQurbanOrdersWithSource } from "@/lib/data/qurbanRepository";
import { formatDate } from "@/lib/format";
import { formatQurbanMoney, QurbanDataSourceBadge, QurbanStatusCell } from "@/app/admin/kurban/_components/QurbanAdminShared";

function getPaymentLabel(status: string, label: string) {
  return status === "pending" ? "Ödeme bekliyor" : label;
}

function getDelegationLabel(status: string, label: string) {
  return status === "accepted" ? "Vekalet kabul edildi" : label;
}

export default async function AdminQurbanOrdersPage() {
  const [{ data: orders, source }, paymentIntents] = await Promise.all([
    getAdminQurbanOrdersWithSource(),
    getAdminPaymentIntents()
  ]);
  const qurbanPaymentIntents = new Map(
    paymentIntents.filter((payment) => payment.contextType === "qurban_order" && payment.contextId).map((payment) => [payment.contextId, payment])
  );

  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="Kurban Çalışmaları"
        title="Kurban Bağışları"
        description="Kurban bağış başvuruları maskeli/read-only gösterilir. İlgili ortak payment intent varsa PayTR test callback sonucu, ödeme hazırlığı ve finalizasyon durumu birlikte izlenebilir; canlı ödeme açılmaz."
      />
      <QurbanDataSourceBadge source={source} />
      <div className="rounded-lg border border-border-soft bg-white p-4 text-sm font-semibold leading-6 text-ink-muted shadow-sm">
        Filtre alanları gerçek kayıtlar geldiğinde listeyi daraltmak için kullanılır; kayıt yoksa güvenli boş durum gösterilir.
      </div>
      <AdminFilterBar>
        <label className="text-sm font-bold text-dark-navy">Sipariş<input disabled className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2 disabled:bg-soft-gray" placeholder="Filtre" /></label>
        <label className="text-sm font-bold text-dark-navy">Kampanya<input disabled className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2 disabled:bg-soft-gray" placeholder="Filtre" /></label>
        <label className="text-sm font-bold text-dark-navy">Ödeme<select disabled className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2 disabled:bg-soft-gray"><option>Tümü</option><option>Ödeme bekliyor</option><option>Ödendi</option></select></label>
        <label className="text-sm font-bold text-dark-navy">Vekalet<select disabled className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2 disabled:bg-soft-gray"><option>Tümü</option><option>Bekliyor</option><option>Kabul edildi</option></select></label>
        <label className="text-sm font-bold text-dark-navy">Durum<select disabled className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2 disabled:bg-soft-gray"><option>Tümü</option><option>Kesim planlandı</option><option>Kesim tamamlandı</option></select></label>
        <label className="text-sm font-bold text-dark-navy">Tarih aralığı<select disabled className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2 disabled:bg-soft-gray"><option>Tümü</option><option>Bugün</option><option>Bu hafta</option><option>Bu ay</option></select></label>
      </AdminFilterBar>
      <AdminTable headers={["Sipariş No", "Bağışçı", "Kampanya", "Kurban türü", "Hisse/adet", "Tutar", "Ödeme No", "Ödeme", "Vekalet", "Durum", "Tarih", "İşlem"]} recordCount={orders.length} empty={!orders.length}>
        {orders.map((order) => {
          const paymentIntent = qurbanPaymentIntents.get(order.id);

          return (
            <tr key={order.id}>
              <td className="font-bold text-dark-navy">{order.orderNo}</td>
              <td>{order.donorDisplayName}<span className="block text-xs text-ink-muted">{order.donorEmailMasked}</span><span className="block text-xs text-ink-muted">{order.donorPhoneMasked}</span></td>
              <td>{order.campaignTitle}</td>
              <td>{order.qurbanTypeLabel}</td>
              <td>{order.shareCount}</td>
              <td>{formatQurbanMoney(order.totalAmount, order.currency)}</td>
              <td>
                {paymentIntent?.intentNo ?? "Henüz yok"}
                <span className="block text-xs text-ink-muted">{paymentIntent?.statusLabel ?? "Manuel/demo hazırlanır"}</span>
                {paymentIntent?.provider === "paytr" ? (
                  <span className="block text-xs font-bold text-deep-blue">PayTR test / merchant_oid hazır</span>
                ) : null}
              </td>
              <td><QurbanStatusCell status={getPaymentLabel(order.paymentStatus, order.paymentStatusLabel)} /></td>
              <td><QurbanStatusCell status={getDelegationLabel(order.delegationStatus, order.delegationStatusLabel)} /></td>
              <td><QurbanStatusCell status={order.orderStatusLabel} /></td>
              <td>{formatDate(order.createdAt)}</td>
              <td><AdminActionButton>Detay</AdminActionButton></td>
            </tr>
          );
        })}
      </AdminTable>
      <div className="rounded-lg border border-ocean-green/15 bg-mint-green/35 p-4 text-sm font-semibold leading-6 text-ink-muted shadow-sm">
        10C finalization RPC akışıyla payment paid olduğunda `qurban_orders.payment_status = paid`, `qurban_orders.order_status = payment_confirmed`,
        `qurban_shares.status = payment_confirmed` olur; `quota_reserved` azaltılıp `quota_completed` idempotent şekilde artırılır. Failed/cancelled sonucu rezervasyonu serbest bırakır.
      </div>
    </div>
  );
}
