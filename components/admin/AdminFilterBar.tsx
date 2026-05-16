import { Search, SlidersHorizontal } from "lucide-react";

export function AdminFilterBar({ children, showActions = false }: { children: React.ReactNode; showActions?: boolean }) {
  return (
    <div className="rounded-lg border border-border-soft bg-white p-3 shadow-sm">
      <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-6 [&_input]:h-8 [&_select]:h-8 [&_input]:rounded-md [&_select]:rounded-md [&_input]:border-border-soft [&_select]:border-border-soft [&_input]:text-xs [&_select]:text-xs [&_label]:text-xs [&_label]:font-extrabold [&_label]:text-dark-navy">
        {children}
        {showActions ? (
          <div className="flex items-end gap-2">
            <button type="button" className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-md bg-ocean-green px-3 text-xs font-extrabold text-white">
              <Search aria-hidden className="h-3.5 w-3.5" />
              Ara
            </button>
            <button type="button" className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-md border border-border-soft bg-white px-3 text-xs font-extrabold text-deep-blue">
              <SlidersHorizontal aria-hidden className="h-3.5 w-3.5" />
              Filtre
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
