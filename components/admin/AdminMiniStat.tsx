export function AdminMiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-soft-gray p-4">
      <p className="text-2xl font-extrabold text-deep-blue">{value}</p>
      <p className="mt-1 text-xs font-bold text-ink-muted">{label}</p>
    </div>
  );
}
