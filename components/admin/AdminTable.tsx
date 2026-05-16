import { cn } from "@/lib/utils";

export function AdminTable({
  headers,
  children,
  recordCount,
  pagination = "1 / 1",
  empty = false,
  dense = true,
  zebra = true
}: {
  headers: string[];
  children: React.ReactNode;
  recordCount?: number;
  pagination?: string;
  empty?: boolean;
  dense?: boolean;
  zebra?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border-soft bg-white shadow-sm">
      {typeof recordCount === "number" ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-soft px-3 py-2 text-xs font-bold text-ink-muted">
          <span>{recordCount} kayıt listeleniyor</span>
          <span>Sayfa {pagination}</span>
        </div>
      ) : null}
      <div className="overflow-x-auto">
        <table className={cn("min-w-full divide-y divide-border-soft", dense ? "text-[0.8rem]" : "text-sm")}>
          <thead className="sticky top-0 z-10 bg-[#f5f7fa]">
            <tr>
              {headers.map((header) => (
                <th key={header} scope="col" className="whitespace-nowrap px-3 py-2 text-left text-[0.66rem] font-extrabold uppercase tracking-[0.1em] text-deep-blue">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={cn("divide-y divide-border-soft [&_td]:px-3 [&_td]:py-2 [&_td]:align-middle [&_td]:whitespace-nowrap [&_td]:text-ink-muted [&_td]:max-w-[18rem] [&_td]:truncate [&_tr:hover]:bg-soft-gray/60", zebra && "[&_tr:nth-child(even)]:bg-slate-50/45")}>
            {empty ? (
              <tr>
                <td colSpan={headers.length} className="px-3 py-8 text-center text-sm font-semibold text-ink-muted">
                  Kayıt bulunmamaktadır.
                </td>
              </tr>
            ) : children}
          </tbody>
        </table>
      </div>
    </div>
  );
}
