import type { LucideIcon } from "lucide-react";

export function InfoBlock({
  icon: Icon,
  title,
  children
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-soft-blue text-deep-blue">
          <Icon aria-hidden className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-xl font-bold text-dark-navy">{title}</h2>
          <div className="mt-3 text-sm leading-7 text-ink-muted">{children}</div>
        </div>
      </div>
    </section>
  );
}
