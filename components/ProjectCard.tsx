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
  visualTone
}: {
  slug?: string;
  title: string;
  category: string;
  description: string;
  goal: number;
  raised: number;
  visualTone: string;
}) {
  const progress = Math.min(Math.round((raised / goal) * 100), 100);

  return (
    <article className="overflow-hidden rounded-brand border border-slate-200/80 bg-white shadow-card transition hover:-translate-y-1 hover:shadow-soft">
      <VisualPlaceholder label={category} className={`h-48 bg-gradient-to-br ${visualTone}`} />
      <div className="p-6">
        <h3 className="text-xl font-bold text-dark-navy">{title}</h3>
        <p className="mt-3 min-h-20 text-sm leading-6 text-slate-600">{description}</p>
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
        <Button href={slug ? `/bagis-yap?proje=${slug}` : "/bagis-yap"} className="mt-3 w-full" showIcon>
          Projeye Destek Ol
        </Button>
      </div>
    </article>
  );
}
