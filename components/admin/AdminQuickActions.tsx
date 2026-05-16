import Link from "next/link";
import type { QuickAction } from "@/data/adminAnalyticsMock";
import { adminIconMap } from "@/data/adminAnalyticsMock";

export function AdminQuickActions({ actions }: { actions: QuickAction[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
      {actions.map((action) => {
        const Icon = adminIconMap[action.iconName];
        return (
          <Link
            key={action.label}
            href={action.href}
            className="focus-ring rounded-lg border border-border-soft bg-white p-3 transition hover:bg-soft-gray"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-soft-blue text-deep-blue">
              <Icon aria-hidden className="h-4 w-4" />
            </span>
            <p className="mt-3 text-sm font-extrabold text-dark-navy">{action.label}</p>
            <p className="mt-1 text-xs leading-5 text-ink-muted">{action.description}</p>
          </Link>
        );
      })}
    </div>
  );
}
