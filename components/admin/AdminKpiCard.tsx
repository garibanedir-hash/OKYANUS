import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import type { DashboardStat } from "@/data/adminAnalyticsMock";
import { adminIconMap } from "@/data/adminAnalyticsMock";

export function AdminKpiCard({ stat }: { stat: DashboardStat }) {
  const Icon = adminIconMap[stat.iconName];
  const TrendIcon = stat.trendDirection === "up" ? ArrowUpRight : stat.trendDirection === "down" ? ArrowDownRight : ArrowRight;

  return (
    <article className="rounded-brand border border-border-soft bg-white p-5 shadow-card">
      <div className="mb-4 h-1 w-16 rounded-full bg-ocean-green" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-ink-muted">{stat.title}</p>
          <p className="mt-2 text-3xl font-extrabold text-dark-navy">{stat.value}</p>
        </div>
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-soft-blue text-deep-blue">
          <Icon aria-hidden className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold leading-5 text-ink-muted">{stat.description}</p>
        <span className="inline-flex items-center gap-1 rounded-full bg-mint-green px-2.5 py-1 text-xs font-extrabold text-ocean-green">
          <TrendIcon aria-hidden className="h-3.5 w-3.5" />
          {stat.trend}
        </span>
      </div>
    </article>
  );
}
