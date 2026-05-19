import Link from "next/link";

export function AdminFormShell({
  eyebrow,
  title,
  description,
  statusMessage,
  children,
  aside
}: {
  eyebrow: string;
  title: string;
  description: string;
  statusMessage?: string | null;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <div className="grid gap-5">
      <div className="rounded-lg border border-border-soft bg-white px-4 py-3 shadow-sm">
        <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-ocean-green">{eyebrow}</p>
        <h1 className="mt-1 text-2xl font-extrabold text-dark-navy">{title}</h1>
        <p className="mt-1 max-w-4xl text-sm leading-6 text-ink-muted">{description}</p>
      </div>
      {statusMessage ? (
        <div className="rounded-lg border border-primary-blue/20 bg-soft-blue px-4 py-3 text-sm font-bold leading-6 text-deep-blue">
          {statusMessage}
        </div>
      ) : null}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="rounded-lg border border-border-soft bg-white p-4 shadow-sm">
          {children}
        </div>
        {aside ? (
          <aside className="grid gap-4 self-start rounded-lg border border-border-soft bg-white p-4 shadow-sm">
            {aside}
          </aside>
        ) : null}
      </div>
    </div>
  );
}

export function AdminFormActions({
  cancelHref,
  submitLabel
}: {
  cancelHref: string;
  submitLabel: string;
}) {
  return (
    <div className="flex flex-col-reverse gap-2 border-t border-border-soft pt-4 sm:flex-row sm:justify-end">
      <Link href={cancelHref} className="focus-ring inline-flex min-h-10 items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-extrabold text-deep-blue ring-1 ring-border-soft hover:bg-soft-blue">
        Vazgeç
      </Link>
      <button type="submit" className="focus-ring inline-flex min-h-10 items-center justify-center rounded-md bg-deep-blue px-4 py-2 text-sm font-extrabold text-white hover:bg-dark-navy">
        {submitLabel}
      </button>
    </div>
  );
}
