import { cn } from "@/lib/utils";

export function AdminPriorityBadge({ priority }: { priority: string }) {
  const tone =
    priority === "Acil"
      ? "bg-warm-accent/25 text-dark-navy ring-warm-accent/30"
      : priority === "Yüksek"
        ? "bg-soft-blue text-deep-blue ring-primary-blue/20"
        : priority === "Orta"
          ? "bg-mint-green text-ocean-green ring-ocean-green/15"
          : "bg-soft-gray text-ink-muted ring-border-soft";

  return <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1", tone)}>{priority}</span>;
}
