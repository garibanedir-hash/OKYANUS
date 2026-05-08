export function AdminFilterBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-3 rounded-brand border border-border-soft bg-white p-4 shadow-card md:grid-cols-3">
      {children}
    </div>
  );
}
