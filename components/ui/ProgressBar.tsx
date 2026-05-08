import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  label,
  className
}: {
  value: number;
  label?: string;
  className?: string;
}) {
  const safeValue = Math.max(0, Math.min(value, 100));

  return (
    <div className={className}>
      {label ? <p className="mb-2 text-xs font-bold text-deep-blue">{label}</p> : null}
      <div
        className="h-3 overflow-hidden rounded-full bg-soft-gray ring-1 ring-border-soft"
        role="progressbar"
        aria-valuenow={safeValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? `Tamamlanma oranı yüzde ${safeValue}`}
      >
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r from-ocean-green to-primary-blue transition-all duration-500"
          )}
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}
