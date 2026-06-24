import type { MockUserDonation } from "@/data/portalMock";
import { formatCurrency } from "@/lib/format";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";

export function DonationHistoryTable({ donations }: { donations: MockUserDonation[] }) {
  return (
    <AdminTable headers={["Tarih", "Tutar", "Bağış türü", "İlgili proje", "Ödeme", "Makbuz", "İşlem"]} recordCount={donations.length} empty={!donations.length}>
      {donations.map((donation) => (
        <tr key={donation.id}>
          <td className="px-4 py-3 text-ink-muted">{donation.date}</td>
          <td className="px-4 py-3 font-bold text-dark-navy">{formatCurrency(donation.amount)}</td>
          <td className="px-4 py-3 text-ink-muted">{donation.donationType}</td>
          <td className="px-4 py-3 text-ink-muted">{donation.projectTitle}</td>
          <td className="px-4 py-3"><AdminStatusBadge status={donation.paymentStatus} /></td>
          <td className="px-4 py-3"><AdminStatusBadge status={donation.receiptStatus} /></td>
          <td className="px-4 py-3"><div className="flex gap-2"><AdminActionButton>Makbuzu Gör</AdminActionButton><AdminActionButton>Tekrar Bağış Yap</AdminActionButton></div></td>
        </tr>
      ))}
    </AdminTable>
  );
}
