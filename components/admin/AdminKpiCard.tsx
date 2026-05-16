import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import type { DashboardStat } from "@/data/adminAnalyticsMock";
import { adminIconMap } from "@/data/adminAnalyticsMock";

export function AdminKpiCard({ stat }: { stat: DashboardStat }) {
  const Icon = adminIconMap[stat.iconName];
  const TrendIcon = stat.trendDirection === "up" ? ArrowUpRight : stat.trendDirection === "down" ? ArrowDownRight : ArrowRight;

  return (
    <article className="rounded-lg border border-border-soft bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-ink-muted">{stat.title}</p>
          <p className="mt-1 text-2xl font-black text-dark-navy">{stat.value}</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-soft-blue text-deep-blue">
          <Icon aria-hidden className="h-[18px] w-[18px]" />
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold leading-5 text-ink-muted">{stat.description}</p>
        <span className="inline-flex items-center gap-1 rounded bg-mint-green px-2 py-1 text-[0.68rem] font-extrabold text-ocean-green">
          <TrendIcon aria-hidden className="h-3.5 w-3.5" />
          {stat.trend}
        </span>
      </div>
    </article>
  );
}
