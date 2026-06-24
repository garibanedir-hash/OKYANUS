import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { sanitizeAdminUiText } from "@/components/admin/adminUiText";

export function AdminSectionHeader({
  eyebrow,
  title,
  description,
  actionLabel,
  actionHref
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border-soft bg-white px-4 py-3 shadow-sm md:flex-row md:items-center md:justify-between">
      <div>
        {eyebrow ? <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-ocean-green">{eyebrow}</p> : null}
        <h1 className="mt-1 text-2xl font-extrabold text-dark-navy">{title}</h1>
        {description ? <p className="mt-1 max-w-4xl text-sm leading-6 text-ink-muted">{sanitizeAdminUiText(description)}</p> : null}
      </div>
      {actionLabel ? <AdminActionButton href={actionHref} variant="primary">{sanitizeAdminUiText(actionLabel)}</AdminActionButton> : null}
    </div>
  );
}
