import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export function NewsCard({
  title,
  date,
  summary,
  slug,
  category = "Duyuru"
}: {
  title: string;
  date: string;
  summary: string;
  slug: string;
  category?: string;
}) {
  return (
    <article className="rounded-brand border border-slate-200/80 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-soft">
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="blue">{category}</Badge>
        <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
          <CalendarDays aria-hidden className="h-4 w-4 text-ocean-green" />
          {date}
        </div>
      </div>
      <h3 className="mt-4 text-xl font-bold leading-snug text-dark-navy">{title}</h3>
      <p className="mt-3 min-h-20 text-[0.95rem] leading-7 text-slate-600">{summary}</p>
      <Link
        href={`/haberler/${slug}`}
        className="focus-ring mt-5 inline-flex items-center gap-2 rounded-full text-sm font-semibold text-ocean-green"
      >
        Devamını Oku
        <ArrowRight aria-hidden className="h-4 w-4" />
      </Link>
    </article>
  );
}
