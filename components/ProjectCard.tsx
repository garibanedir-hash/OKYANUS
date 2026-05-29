import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { VisualPlaceholder } from "@/components/VisualPlaceholder";
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
      <VisualPlaceholder label={regionName ? `${regionName} · ${category}` : category} className={`${compact ? "h-36" : "h-48"} bg-gradient-to-br ${visualTone}`} />
      <div className="h-1 bg-gradient-to-r from-deep-blue to-ocean-green" />
      <div className={compact ? "p-4" : "p-6"}>
        <div className="mb-3 flex flex-wrap gap-2">
          {regionName ? (
            <span className="rounded-full bg-soft-blue px-2.5 py-1 text-[0.68rem] font-extrabold text-deep-blue">
              {regionName}
            </span>
          ) : null}
          {status ? (
            <span className="rounded-full bg-mint-green px-2.5 py-1 text-[0.68rem] font-extrabold text-dark-navy">
              {status}
            </span>
          ) : null}
          {activityCount ? (
            <span className="rounded-full bg-soft-gray px-2.5 py-1 text-[0.68rem] font-extrabold text-ink-muted">
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
        <Button href={slug ? `/projeler/${slug}` : "/projeler"} variant="ghost" className="mt-6 w-full" showIcon>
          Projeyi İncele
        </Button>
        {compact ? null : (
          <Button href={slug ? `/bagis-yap?proje=${slug}` : "/bagis-yap"} className="mt-3 w-full" showIcon>
            Projeye Destek Ol
          </Button>
        )}
      </div>
    </article>
  );
}
