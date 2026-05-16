import { cn } from "@/lib/utils";

export function AdminStatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const tone = normalized.includes("tamam") || normalized.includes("yayında") || normalized.includes("yanıtlandı")
    ? "bg-mint-green text-ocean-green ring-ocean-green/15"
    : normalized.includes("bekle") || normalized.includes("yeni") || normalized.includes("demo")
      ? "bg-soft-blue text-deep-blue ring-primary-blue/15"
      : normalized.includes("iptal") || normalized.includes("arşiv")
        ? "bg-warm-accent/15 text-dark-navy ring-warm-accent/20"
        : "bg-soft-gray text-ink-muted ring-border-soft";

  return (
    <span className={cn("inline-flex whitespace-nowrap rounded px-2 py-0.5 text-[0.68rem] font-extrabold ring-1", tone)}>
      {status}
    </span>
  );
}
