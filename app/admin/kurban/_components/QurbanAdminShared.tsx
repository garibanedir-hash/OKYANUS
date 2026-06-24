import { AdminMiniStat } from "@/components/admin/AdminMiniStat";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { formatCurrency } from "@/lib/format";

export function QurbanDataSourceBadge({ source }: { source: "supabase" | "demo" }) {
  return (
    <div className="w-fit rounded bg-soft-blue px-3 py-1 text-xs font-extrabold text-deep-blue">
      {source === "supabase" ? "Gerçek kayıt" : "Kayıt yok"}
    </div>
  );
}

export function QurbanProgress({ completed, total }: { completed: number; total: number }) {
  const ratio = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;

  return (
    <div className="min-w-32">
      <div className="h-2 rounded-full bg-soft-gray">
        <div className="h-full rounded-full bg-ocean-green" style={{ width: `${ratio}%` }} />
      </div>
      <p className="mt-1 text-xs font-bold text-deep-blue">
        {completed}/{total} · %{ratio}
      </p>
    </div>
  );
}

export function QurbanStatGrid({
  items
}: {
  items: Array<{ label: string; value: string | number }>;
}) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <AdminMiniStat key={item.label} label={item.label} value={item.value} />
      ))}
    </section>
  );
}

export function QurbanStatusCell({ status }: { status: string }) {
  return <AdminStatusBadge status={status} />;
}

export function formatQurbanMoney(value: number, currency = "TRY") {
  if (currency === "TRY") {
    return formatCurrency(value);
  }

  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(value);
}
