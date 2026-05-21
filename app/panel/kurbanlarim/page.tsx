import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/Button";
import { getCurrentDonorQurbanOrdersWithSource } from "@/lib/data/qurbanRepository";
import { formatDate } from "@/lib/format";
import { formatQurbanMoney, QurbanStatusCell } from "@/app/admin/kurban/_components/QurbanAdminShared";

const timelineSteps = [
  "Başvuru alındı",
  "Vekalet kaydedildi",
  "Ödeme bekleniyor/tamamlandı",
  "Kesim planlandı",
  "Kesim tamamlandı",
  "Dağıtım yapıldı",
  "Bilgilendirme tamamlandı"
];

export default async function PanelQurbanOrdersPage() {
  const { data: orders, source } = await getCurrentDonorQurbanOrdersWithSource();

  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="Bağışçı Paneli"
        title="Kurbanlarım"
        description="Kurban bağışlarınızın vekalet, ödeme, kesim, dağıtım, makbuz ve bilgilendirme durumu bu alanda izlenir. Girişsiz oluşturulan kayıtlar bağışçı hesabıyla eşleşmediği için otomatik görünmez."
        actionLabel="Kurban Bağışı"
        actionHref="/kurban/bagis"
      />
      <div className="w-fit rounded bg-soft-blue px-3 py-1 text-xs font-extrabold text-deep-blue">
        {source === "supabase" ? "Hesabınıza bağlı kayıtlar" : "Demo takip görünümü"}
      </div>
      <div className="rounded-lg border border-border-soft bg-white p-4 text-sm font-semibold leading-6 text-ink-muted shadow-sm">
        Güvenlik nedeniyle e-posta adresi tek başına hesap eşleştirme için kullanılmaz. Girişsiz başvurular admin kayıtlarında görünür; panelde otomatik görünmesi için sonraki aşamada güvenli eşleştirme akışı gerekir.
      </div>
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border-soft bg-white p-5 shadow-sm">
          <p className="text-xs font-extrabold uppercase text-ink-muted">Kurban bağışlarım</p>
          <p className="mt-2 text-3xl font-black text-deep-blue">{orders.length}</p>
        </div>
        <div className="rounded-lg border border-border-soft bg-white p-5 shadow-sm">
          <p className="text-xs font-extrabold uppercase text-ink-muted">Toplam hisse/adet</p>
          <p className="mt-2 text-3xl font-black text-deep-blue">{orders.reduce((sum, order) => sum + order.shareCount, 0)}</p>
        </div>
        <div className="rounded-lg border border-border-soft bg-white p-5 shadow-sm">
          <p className="text-xs font-extrabold uppercase text-ink-muted">Bilgilendirme</p>
          <p className="mt-2 text-lg font-black text-dark-navy">Ödeme sonrası aktifleşir</p>
        </div>
      </section>
      <AdminTable headers={["Sipariş No", "Kurban türü", "Kampanya", "Hisse/adet", "Durum", "Ödeme", "Vekalet", "Makbuz", "Tarih", "Detay"]} recordCount={orders.length} empty={!orders.length}>
        {orders.map((order) => (
          <tr key={order.id}>
            <td className="font-bold text-dark-navy">{order.orderNo}</td>
            <td>{order.qurbanTypeLabel}</td>
            <td>{order.campaignTitle}</td>
            <td>{order.shareCount} · {formatQurbanMoney(order.totalAmount, order.currency)}</td>
            <td><QurbanStatusCell status={order.orderStatusLabel} /></td>
            <td><QurbanStatusCell status={order.paymentStatusLabel} /></td>
            <td><QurbanStatusCell status={order.delegationStatusLabel} /></td>
            <td>{order.receiptStatus}</td>
            <td>{formatDate(order.createdAt)}</td>
            <td><Button href="/kurban" variant="ghost" className="min-h-8 rounded-md px-3 py-1 text-xs">İncele</Button></td>
          </tr>
        ))}
      </AdminTable>
      <section className="rounded-lg border border-border-soft bg-white p-5 shadow-sm">
        <h2 className="text-xl font-extrabold text-dark-navy">Durum zaman çizelgesi</h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-ink-muted">
          Bu çizelge bağışçıya gerekli durum bilgisini verir; saha operasyonuna ait hassas detaylar panelde açılmaz.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {timelineSteps.map((step, index) => (
            <div key={step} className="rounded-lg bg-soft-gray p-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mint-green text-xs font-black text-ocean-green">{index + 1}</span>
              <p className="mt-3 text-sm font-extrabold text-dark-navy">{step}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
