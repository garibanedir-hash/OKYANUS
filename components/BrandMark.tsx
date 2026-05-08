import Link from "next/link";
import { cn } from "@/lib/utils";

export function BrandMark({
  compact = false,
  inverse = false,
  onClick
}: {
  compact?: boolean;
  inverse?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link href="/" className="focus-ring flex items-center gap-3 rounded-full" onClick={onClick}>
      <span
        className={cn(
          "relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl shadow-card ring-1",
          inverse ? "bg-white/10 ring-white/15" : "bg-deep-blue ring-deep-blue/10"
        )}
        aria-hidden
      >
        <span className="absolute inset-x-2 bottom-3 h-4 rounded-[100%] border-2 border-mint-green/90 border-t-0" />
        <span className="absolute left-3 top-3 h-4 w-4 rounded-full bg-mint-green/90" />
        <span className="absolute right-3 top-4 h-5 w-2 rounded-full bg-white/80" />
      </span>
      <span className="leading-tight">
        <span className={cn("block font-extrabold", compact ? "text-base" : "text-lg", inverse ? "text-white" : "text-dark-navy")}>
          Okyanus
        </span>
        <span
          className={cn(
            "block text-xs font-bold uppercase tracking-[0.14em]",
            inverse ? "text-mint-green" : "text-ocean-green"
          )}
        >
          İnsani Yardım Derneği
        </span>
      </span>
    </Link>
  );
}
