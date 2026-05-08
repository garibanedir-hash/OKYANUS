import { getUserDonations } from "@/lib/data/portalRepository";
import { DonationHistoryTable } from "@/components/portal/DonationHistoryTable";

export default function MyDonationsPage() {
  return (
    <div className="grid gap-6">
      <section className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ocean-green">Bağış geçmişi</p>
        <h1 className="mt-2 text-3xl font-extrabold text-dark-navy">Bağışlarım</h1>
        <p className="mt-2 leading-7 text-ink-muted">Bu tablo sadece demo kullanıcının kendi bağış geçmişini gösterir. Gerçek sistemde kayıtlar Supabase RLS ile sınırlandırılacaktır.</p>
      </section>
      <DonationHistoryTable donations={getUserDonations()} />
    </div>
  );
}
