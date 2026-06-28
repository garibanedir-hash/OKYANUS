import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

export function ActivityCard({
  title,
  description,
  icon: Icon,
  slug,
  supportTypes
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  slug?: string;
  supportTypes?: string[];
}) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-slate-200/70 bg-white shadow-card transition hover:-translate-y-1 hover:shadow-soft">
      {/* Top accent line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-ocean-green via-deep-blue/60 to-transparent" />

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-soft-blue text-deep-blue ring-1 ring-ocean-green/10">
          <Icon aria-hidden className="h-6 w-6" />
        </div>

        <h3 className="text-xl font-bold text-dark-navy">{title}</h3>
        <p className="mt-3 flex-1 text-[0.95rem] leading-7 text-slate-600">{description}</p>

        {supportTypes && supportTypes.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {supportTypes.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-soft-gray px-2.5 py-1 text-xs font-semibold text-slate-500"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <Link
          href={slug ? `/faaliyetler#${slug}` : "/faaliyetler"}
          className="focus-ring mt-5 inline-flex items-center gap-2 self-start rounded-full text-sm font-semibold text-ocean-green"
        >
          Detaylı İncele
          <ArrowRight aria-hidden className="h-4 w-4 transition group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}
