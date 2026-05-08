export function AdminTable({
  headers,
  children
}: {
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-brand border border-border-soft bg-white shadow-card">
      <table className="min-w-full divide-y divide-border-soft text-sm">
        <thead className="bg-soft-gray">
          <tr>
            {headers.map((header) => (
              <th key={header} scope="col" className="whitespace-nowrap px-4 py-3 text-left text-xs font-extrabold uppercase tracking-[0.12em] text-ink-muted">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-soft">{children}</tbody>
      </table>
    </div>
  );
}
