export function PortalStatCard({ label, value, helper }: { label: string; value: string | number; helper?: string }) {
  return (
    <article className="rounded-brand border border-border-soft bg-white p-5 shadow-card">
      <p className="text-sm font-bold text-ink-muted">{label}</p>
      <p className="mt-2 text-3xl font-extrabold text-deep-blue">{value}</p>
      {helper ? <p className="mt-2 text-sm leading-6 text-ink-muted">{helper}</p> : null}
    </article>
  );
}
