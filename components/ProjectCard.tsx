import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatCurrency } from "@/lib/format";

export function ProjectCard({
  slug,
  title,
  category,
  description,
  goal,
  raised,
  visualTone,
  regionName,
  status,
  activityCount,
  compact = false
}: {
  slug?: string;
  title: string;
  category: string;
  description: string;
  goal: number;
  raised: number;
  visualTone: string;
  regionName?: string;
  status?: string;
  activityCount?: number;
  compact?: boolean;
}) {
  const progress = goal > 0 ? Math.min(Math.round((raised / goal) * 100), 100) : 0;

  return (
    <article className="overflow-hidden rounded-brand border border-border-soft bg-white shadow-card transition hover:-translate-y-1 hover:shadow-soft">
      <div className={`${compact ? "h-32" : "h-44"} relative overflow-hidden border-b border-[#D7E0E7] bg-[#EEF4F6]`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${visualTone} opacity-80`} />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(15,37,71,0.12)_0%,rgba(15,37,71,0.02)_46%,rgba(255,255,255,0.46)_100%)]" />
        <div className="absolute inset-x-5 bottom-5">
          <div className="h-px bg-white/70" />
          <p className="mt-3 text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-[#0F2547]/75">
            {regionName ? `${regionName} / ${category}` : category}
          </p>
        </div>
      </div>
      <div className="h-1 bg-[#1F8083]" />
      <div className={compact ? "p-4" : "p-6"}>
        <div className="mb-3 flex flex-wrap gap-2">
          {regionName ? (
            <span className="rounded-md bg-[#EEF4F6] px-2.5 py-1 text-[0.68rem] font-extrabold text-[#0F2547]">
              {regionName}
            </span>
          ) : null}
          {status ? (
            <span className="rounded-md border border-[#D7E0E7] bg-white px-2.5 py-1 text-[0.68rem] font-extrabold text-[#526574]">
              {status}
            </span>
          ) : null}
          {activityCount ? (
            <span className="rounded-md bg-[#F4F7F8] px-2.5 py-1 text-[0.68rem] font-extrabold text-[#526574]">
              {activityCount} faaliyet
            </span>
          ) : null}
        </div>
        <h3 className="text-xl font-bold text-dark-navy">{title}</h3>
        <p className={`${compact ? "min-h-16" : "min-h-20"} mt-3 text-sm leading-6 text-slate-600`}>{description}</p>
        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between gap-3 text-xs font-bold text-slate-500">
            <span>{formatCurrency(raised)} ulaşıldı</span>
            <span>{formatCurrency(goal)} hedef</span>
          </div>
          <ProgressBar value={progress} label={`${progress}% tamamlandı`} />
        </div>
        <Button href={slug ? `/projeler/${slug}` : "/projeler"} variant="ghost" className="mt-6 w-full rounded-md" showIcon>
          Projeyi İncele
        </Button>
        {compact ? null : (
          <Button href={slug ? `/bagis-yap?proje=${slug}` : "/bagis-yap"} className="mt-3 w-full rounded-md" showIcon>
            Projeye Destek Ol
          </Button>
        )}
      </div>
    </article>
  );
}
