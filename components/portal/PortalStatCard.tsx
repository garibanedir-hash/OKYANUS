export function PortalStatCard({ label, value, helper }: { label: string; value: string | number; helper?: string }) {
  return (
    <article className="rounded-lg border border-border-soft bg-white p-4 shadow-sm">
      <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-ink-muted">{label}</p>
      <p className="mt-1 text-2xl font-black text-deep-blue">{value}</p>
      {helper ? <p className="mt-1 text-xs leading-5 text-ink-muted">{helper}</p> : null}
    </article>
  );
}
