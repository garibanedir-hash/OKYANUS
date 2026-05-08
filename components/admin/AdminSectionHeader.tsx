import { AdminActionButton } from "@/components/admin/AdminActionButton";

export function AdminSectionHeader({
  eyebrow,
  title,
  description,
  actionLabel
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? <p className="text-xs font-bold uppercase tracking-[0.16em] text-ocean-green">{eyebrow}</p> : null}
        <h1 className="mt-2 text-3xl font-extrabold text-dark-navy">{title}</h1>
        {description ? <p className="mt-2 max-w-3xl leading-7 text-ink-muted">{description}</p> : null}
      </div>
      {actionLabel ? <AdminActionButton variant="primary">{actionLabel}</AdminActionButton> : null}
    </div>
  );
}
