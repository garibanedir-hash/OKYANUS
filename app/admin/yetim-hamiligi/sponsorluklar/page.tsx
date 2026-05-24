import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { getAdminPaymentIntents } from "@/lib/data/paymentRepository";
import { getAdminSponsorships } from "@/lib/data/orphanSponsorshipRepository";
import { formatDate } from "@/lib/format";
import { formatSponsorshipMoney, PrivacyNotice, SponsorshipStatusCell } from "@/app/admin/yetim-hamiligi/_components/OrphanAdminShared";

export default async function AdminSponsorshipsPage() {
  const [sponsorships, paymentIntents] = await Promise.all([getAdminSponsorships(), getAdminPaymentIntents()]);
  const sponsorshipPaymentIntents = new Map(
    paymentIntents.filter((payment) => payment.contextType === "orphan_sponsorship" && payment.contextId).map((payment) => [payment.contextId, payment])
  );

  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="Yetim Hamiliği"
        title="Sponsorluklar"
        description="Sponsor, yetim güvenli özeti, ortak ödeme hazırlığı ve sponsorluk durumları maskeli/read-only olarak izlenir."
      />
      <PrivacyNotice />
      <AdminFilterBar>
        <label>Sponsorluk No<input disabled placeholder="Demo filtre" /></label>
        <label>Ödeme<select disabled><option>Tümü</option><option>Ödeme bekliyor</option><option>Ödendi</option></select></label>
        <label>Durum<select disabled><option>Tümü</option><option>Aktif</option><option>Bekliyor</option></select></label>
      </AdminFilterBar>
      <AdminTable headers={["Sponsorluk No", "Sponsor maskeli", "Yetim kodu/güvenli ad", "Program", "Aylık destek", "Ödeme No", "Ödeme durumu", "Sponsorluk durumu", "Başlangıç", "Son ödeme", "İşlem"]} recordCount={sponsorships.length} empty={!sponsorships.length}>
        {sponsorships.map((item) => {
          const paymentIntent = sponsorshipPaymentIntents.get(item.id);

          return (
            <tr key={item.id}>
              <td className="font-bold text-dark-navy">{item.sponsorshipNo}</td>
              <td>{item.sponsorDisplayName}<span className="block text-xs text-ink-muted">{item.sponsorEmailMasked}</span><span className="block text-xs text-ink-muted">{item.sponsorPhoneMasked}</span></td>
              <td>{item.orphanCode}<span className="block text-xs text-ink-muted">{item.orphanSafeName}</span></td>
              <td>{item.programTitle}</td>
              <td>{formatSponsorshipMoney(item.monthlyAmount, item.currency)}</td>
              <td>
                {paymentIntent?.intentNo ?? "Henüz yok"}
                <span className="block text-xs text-ink-muted">{paymentIntent?.statusLabel ?? "İlk ödeme hazırlığı"}</span>
                {paymentIntent?.provider === "paytr" ? (
                  <span className="block text-xs font-bold text-deep-blue">PayTR test / callback bekleniyor</span>
                ) : null}
              </td>
              <td><SponsorshipStatusCell status={item.paymentStatusLabel} /></td>
              <td><SponsorshipStatusCell status={item.statusLabel} /></td>
              <td>{formatDate(item.startDate)}</td>
              <td>{item.lastPaymentDate ? formatDate(item.lastPaymentDate) : "Bekliyor"}</td>
              <td><AdminActionButton>Detay demo</AdminActionButton></td>
            </tr>
          );
        })}
      </AdminTable>
      <div className="rounded-lg border border-ocean-green/15 bg-mint-green/35 p-4 text-sm font-semibold leading-6 text-ink-muted shadow-sm">
        10A PayTR test callback doğrulaması hazırlandığında payment paid olduğunda `sponsorships.payment_status = paid`, `sponsorships.status = active` ve `next_payment_date`
        periyoda göre server-side hesaplanarak güncellenecektir.
      </div>
    </div>
  );
}
