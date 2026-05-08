export function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border-soft bg-white p-5 shadow-card">
      <p className="text-2xl font-extrabold text-deep-blue">{value}</p>
      <p className="mt-1 text-sm font-bold text-ink-muted">{label}</p>
    </div>
  );
}
