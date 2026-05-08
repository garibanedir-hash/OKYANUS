import type { LucideIcon } from "lucide-react";

export function AdminStatCard({
  title,
  value,
  description,
  icon: Icon
}: {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
}) {
  return (
    <article className="rounded-brand border border-border-soft bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-ink-muted">{title}</p>
          <p className="mt-2 text-3xl font-extrabold text-dark-navy">{value}</p>
        </div>
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-soft-blue text-deep-blue">
          <Icon aria-hidden className="h-5 w-5" />
        </span>
      </div>
      {description ? <p className="mt-3 text-xs font-semibold leading-5 text-ink-muted">{description}</p> : null}
    </article>
  );
}
