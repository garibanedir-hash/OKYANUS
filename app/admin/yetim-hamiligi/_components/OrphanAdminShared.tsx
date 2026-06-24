import { AdminMiniStat } from "@/components/admin/AdminMiniStat";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { formatCurrency } from "@/lib/format";

export function SponsorshipDataSourceBadge({ source = "demo" }: { source?: "supabase" | "demo" }) {
  return (
    <div className="w-fit rounded bg-soft-blue px-3 py-1 text-xs font-extrabold text-deep-blue">
      {source === "supabase" ? "Gerçek kayıt" : "Kayıt yok"}
    </div>
  );
}

export function SponsorshipStatusCell({ status }: { status: string }) {
  return <AdminStatusBadge status={status} />;
}

export function SponsorshipStatGrid({
  items
}: {
  items: Array<{ label: string; value: string | number }>;
}) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <AdminMiniStat key={item.label} label={item.label} value={item.value} />
      ))}
    </section>
  );
}

export function formatSponsorshipMoney(value: number, currency = "TRY") {
  if (currency === "TRY") return formatCurrency(value);

  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(value);
}

export function PrivacyNotice() {
  return (
    <div className="rounded-lg border border-border-soft bg-white p-4 text-sm font-semibold leading-6 text-ink-muted shadow-sm">
      Çocuk mahremiyeti gereği açık kimlik, açık adres, okul adı, telefon, aile detayı ve hassas sağlık bilgileri bu ekranda gösterilmez.
    </div>
  );
}
