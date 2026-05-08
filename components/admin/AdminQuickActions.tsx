import Link from "next/link";
import type { QuickAction } from "@/data/adminAnalyticsMock";
import { adminIconMap } from "@/data/adminAnalyticsMock";

export function AdminQuickActions({ actions }: { actions: QuickAction[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {actions.map((action) => {
        const Icon = adminIconMap[action.iconName];
        return (
          <Link
            key={action.label}
            href={action.href}
            className="focus-ring rounded-2xl border border-border-soft bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-soft"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-soft-blue text-deep-blue">
              <Icon aria-hidden className="h-5 w-5" />
            </span>
            <p className="mt-4 font-bold text-dark-navy">{action.label}</p>
            <p className="mt-1 text-sm leading-6 text-ink-muted">{action.description}</p>
          </Link>
        );
      })}
    </div>
  );
}
