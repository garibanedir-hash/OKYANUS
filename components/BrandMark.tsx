import Link from "next/link";
import { cn } from "@/lib/utils";

export function BrandMark({
  compact = false,
  large = false,
  inverse = false,
  onClick
}: {
  compact?: boolean;
  large?: boolean;
  inverse?: boolean;
  onClick?: () => void;
}) {
  if (large) {
    return (
      <Link href="/" className="focus-ring flex items-center gap-4 rounded-full" onClick={onClick}>
        <span
          className={cn(
            "relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full ring-2",
            inverse ? "bg-white ring-white/20" : "bg-white ring-border-soft"
          )}
          aria-hidden
        >
          <span className="absolute inset-1.5 rounded-full border-[3px] border-deep-blue/95" />
          <span className="absolute inset-x-3 bottom-5 h-8 rounded-[100%] border-[5px] border-ocean-green border-t-0" />
          <span className="absolute left-1/2 top-4 h-6 w-6 -translate-x-1/2 rounded-full bg-deep-blue" />
          <span className="absolute left-1/2 top-[2.2rem] h-7 w-4 -translate-x-1/2 rounded-full bg-ocean-green" />
        </span>
        <span className="leading-tight">
          <span className={cn("block text-3xl font-extrabold", inverse ? "text-white" : "text-dark-navy")}>
            Okyanus
          </span>
          <span className={cn("block text-sm font-bold uppercase tracking-[0.14em]", inverse ? "text-mint-green" : "text-ocean-green")}>
            İnsani Yardım Derneği
          </span>
        </span>
      </Link>
    );
  }

  return (
    <Link href="/" className="focus-ring flex items-center gap-3 rounded-full" onClick={onClick}>
      <span
        className={cn(
          "relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1",
          inverse ? "bg-white ring-white/20" : "bg-white ring-border-soft"
        )}
        aria-hidden
      >
        <span className="absolute inset-1 rounded-full border-2 border-deep-blue/95" />
        <span className="absolute inset-x-2 bottom-3 h-5 rounded-[100%] border-[3px] border-ocean-green border-t-0" />
        <span className="absolute left-1/2 top-2.5 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-deep-blue" />
        <span className="absolute left-1/2 top-[1.35rem] h-4 w-2.5 -translate-x-1/2 rounded-full bg-ocean-green" />
      </span>
      <span className="leading-tight">
        <span className={cn("block font-extrabold", compact ? "text-base" : "text-lg", inverse ? "text-white" : "text-dark-navy")}>
          Okyanus
        </span>
        <span className={cn("block text-xs font-bold uppercase tracking-[0.14em]", inverse ? "text-mint-green" : "text-ocean-green")}>
          İnsani Yardım Derneği
        </span>
      </span>
    </Link>
  );
}
