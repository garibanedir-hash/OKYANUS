import { cn } from "@/lib/utils";

export function AdminChartCard({
  title,
  description,
  actions,
  children,
  className
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-brand border border-border-soft bg-white p-5 shadow-card", className)}>
      <div className="mb-4 h-1 w-20 rounded-full bg-gradient-to-r from-deep-blue to-ocean-green" />
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-dark-navy">{title}</h2>
          {description ? <p className="mt-1 text-sm leading-6 text-ink-muted">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}
