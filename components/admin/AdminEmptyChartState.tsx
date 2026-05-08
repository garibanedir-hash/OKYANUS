import { BarChart3 } from "lucide-react";

export function AdminEmptyChartState() {
  return (
    <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border-soft bg-soft-gray text-center">
      <div>
        <BarChart3 aria-hidden className="mx-auto h-8 w-8 text-deep-blue" />
        <p className="mt-3 text-sm font-bold text-ink-muted">Grafik verisi henüz bağlı değil.</p>
      </div>
    </div>
  );
}
