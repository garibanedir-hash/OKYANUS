import { sanitizeAdminUiText } from "@/components/admin/adminUiText";
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
    <section className={cn("rounded-lg border border-border-soft bg-white p-4 shadow-sm", className)}>
      <div className="flex flex-col gap-3 border-b border-border-soft pb-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-base font-extrabold text-dark-navy">{title}</h2>
          {description ? <p className="mt-1 text-xs leading-5 text-ink-muted">{sanitizeAdminUiText(description)}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
