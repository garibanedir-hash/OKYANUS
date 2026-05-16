"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { AdminActionButton } from "@/components/admin/AdminActionButton";

export function AdminRelatedRecordsModal({
  title,
  triggerLabel,
  headers,
  rows,
  showExpenseFilters = false
}: {
  title: string;
  triggerLabel: string;
  headers: string[];
  rows: string[][];
  showExpenseFilters?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AdminActionButton onClick={() => setOpen(true)}>{triggerLabel}</AdminActionButton>
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-deep-blue/55 p-4" role="dialog" aria-modal="true" aria-labelledby="related-records-title">
          <div className="w-full max-w-6xl rounded-lg border border-border-soft bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-border-soft px-4 py-3">
              <div>
                <h2 id="related-records-title" className="text-base font-extrabold text-dark-navy">{title}</h2>
                <p className="mt-1 text-xs font-semibold text-ink-muted">{rows.length} demo kayıt / sayfa 1</p>
              </div>
              <button type="button" className="focus-ring rounded-md p-2 text-ink-muted hover:bg-soft-gray hover:text-deep-blue" onClick={() => setOpen(false)} aria-label="Pencereyi kapat">
                <X aria-hidden className="h-4 w-4" />
              </button>
            </div>
            {showExpenseFilters ? (
              <div className="grid gap-2 border-b border-border-soft bg-soft-gray/60 p-3 md:grid-cols-5">
                <input className="focus-ring h-8 rounded-md border border-border-soft px-3 text-xs" placeholder="Harcama açıklaması" />
                <input className="focus-ring h-8 rounded-md border border-border-soft px-3 text-xs" placeholder="Tarih" />
                <select className="focus-ring h-8 rounded-md border border-border-soft px-3 text-xs"><option>Tür</option><option>Lojistik</option><option>Ulaşım</option></select>
                <select className="focus-ring h-8 rounded-md border border-border-soft px-3 text-xs"><option>Durum</option><option>Onaylı</option><option>Beklemede</option></select>
                <button type="button" className="focus-ring h-8 rounded-md bg-ocean-green px-3 text-xs font-extrabold text-white">Ara</button>
              </div>
            ) : null}
            <div className="overflow-x-auto p-4">
              <table className="min-w-full divide-y divide-border-soft text-xs">
                <thead className="bg-[#f5f7fa]">
                  <tr>
                    {headers.map((header) => (
                      <th key={header} scope="col" className="whitespace-nowrap px-3 py-2 text-left text-[0.68rem] font-extrabold uppercase tracking-[0.1em] text-deep-blue">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-soft">
                  {rows.map((row) => (
                    <tr key={row.join("-")} className="hover:bg-soft-gray/60">
                      {row.map((cell, index) => (
                        <td key={`${cell}-${index}`} className="whitespace-nowrap px-3 py-2 text-ink-muted">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
