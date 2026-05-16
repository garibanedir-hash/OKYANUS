export function AdminMiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border-soft bg-soft-gray/80 p-3">
      <p className="text-xl font-black text-deep-blue">{value}</p>
      <p className="mt-1 text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-ink-muted">{label}</p>
    </div>
  );
}
