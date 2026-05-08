import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

export function ActivityCard({
  title,
  description,
  icon: Icon
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <article className="group h-full rounded-brand border border-slate-200/80 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-soft">
      <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-soft-blue text-deep-blue ring-1 ring-primary-blue/10">
        <Icon aria-hidden className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-bold text-dark-navy">{title}</h3>
      <p className="mt-3 min-h-24 text-sm leading-6 text-slate-600">{description}</p>
      <Link
        href="/faaliyetler"
        className="focus-ring mt-5 inline-flex items-center gap-2 rounded-full text-sm font-semibold text-ocean-green"
      >
        Detaylı İncele
        <ArrowRight aria-hidden className="h-4 w-4 transition group-hover:translate-x-1" />
      </Link>
    </article>
  );
}
