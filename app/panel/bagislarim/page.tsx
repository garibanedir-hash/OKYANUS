import { getUserDonations } from "@/lib/data/portalRepository";
import { DonationHistoryTable } from "@/components/portal/DonationHistoryTable";
import { AdminTable } from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/Button";
import { getCurrentAccount } from "@/lib/auth/routeGuard";
import { getDonorPayments, getDonorReceipts } from "@/lib/data/paymentRepository";
import { formatDate } from "@/lib/format";

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(amount);
}

export default async function MyDonationsPage() {
  const account = await getCurrentAccount();
  const accountId = account?.status === "active" ? account.id : "demo-donor-account";
  const [payments, receipts] = await Promise.all([
    getDonorPayments(accountId),
    getDonorReceipts(accountId)
  ]);
  const receiptsByPaymentIntent = new Map(receipts.filter((receipt) => receipt.paymentIntentId).map((receipt) => [receipt.paymentIntentId, receipt]));

  return (
    <div className="grid gap-6">
      <section className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ocean-green">Bağış geçmişi</p>
        <h1 className="mt-2 text-3xl font-extrabold text-dark-navy">Bağışlarım</h1>
        <p className="mt-2 leading-7 text-ink-muted">Bu alan bağış, ödeme ve makbuz durumunu takip etmek içindir. Gerçek sistemde kullanıcı yalnızca kendi bağış geçmişini Supabase RLS ile görebilecektir.</p>
      </section>
      <section className="rounded-lg border border-ocean-green/15 bg-mint-green/35 p-4 text-sm font-semibold leading-6 text-ink-muted shadow-sm">
        Genel bağış ödemeleri ortak payment intent üzerinden izlenir. 10D ile hazırlanmış PDF makbuzlar yetki kontrollü indirme endpoint&apos;i üzerinden açılır; canlı ödeme, kart bilgisi toplama ve gerçek bildirim gönderimi yapılmaz.
      </section>
      <AdminTable headers={["Ödeme No", "Bağış türü", "Tutar", "Ödeme", "Makbuz", "Tarih"]} recordCount={payments.length} empty={!payments.length}>
        {payments.map((payment) => {
          const receipt = receiptsByPaymentIntent.get(payment.id);

          return (
            <tr key={payment.id}>
              <td className="font-bold text-dark-navy">{payment.intentNo}</td>
              <td>{payment.contextTypeLabel}</td>
              <td>{formatMoney(payment.amount, payment.currency)}</td>
              <td>{payment.statusLabel}</td>
              <td>
                {receipt ? (
                  receipt.hasPdf ? (
                    <Button href={`/api/receipts/${receipt.receiptNo}/download`} variant="ghost" className="min-h-8 rounded-md px-3 py-1 text-xs">
                      Makbuzu Görüntüle
                    </Button>
                  ) : (
                    <span className="text-xs font-semibold text-ink-muted">{receipt.statusLabel}</span>
                  )
                ) : payment.status === "paid" ? (
                  <span className="text-xs font-semibold text-ink-muted">Makbuz bekliyor</span>
                ) : (
                  <span className="text-xs text-ink-muted">Ödeme bekleniyor</span>
                )}
              </td>
              <td>{formatDate(payment.createdAt)}</td>
            </tr>
          );
        })}
      </AdminTable>
      <DonationHistoryTable donations={getUserDonations()} />
    </div>
  );
}
