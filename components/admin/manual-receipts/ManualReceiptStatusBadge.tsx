import { manualReceiptStatusLabels, type ManualReceiptStatus } from "@/data/manualReceiptMock";

const statusClasses: Record<ManualReceiptStatus, string> = {
  draft: "bg-slate-100 text-slate-700 ring-slate-200",
  prepared: "bg-cyan-50 text-cyan-800 ring-cyan-200",
  printed: "bg-blue-50 text-blue-800 ring-blue-200",
  delivered: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  signed: "bg-teal-50 text-teal-800 ring-teal-200",
  archived: "bg-zinc-100 text-zinc-700 ring-zinc-200",
  cancelled: "bg-red-50 text-red-800 ring-red-200"
};

export function ManualReceiptStatusBadge({ status }: { status: ManualReceiptStatus }) {
  return (
    <span className={`inline-flex min-h-6 items-center rounded-full px-2 py-0.5 text-[0.68rem] font-extrabold ring-1 ${statusClasses[status]}`}>
      {manualReceiptStatusLabels[status]}
    </span>
  );
}
