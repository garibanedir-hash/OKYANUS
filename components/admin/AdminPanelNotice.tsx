export function AdminPanelNotice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-brand border border-primary-blue/20 bg-soft-blue p-5 text-deep-blue shadow-card">
      <p className="font-extrabold">{title}</p>
      <div className="mt-2 text-sm font-semibold leading-7">{children}</div>
    </div>
  );
}
