import { OfficialLogo } from "@/components/brand/OfficialLogo";
import { cn } from "@/lib/utils";

export function LoadingScreen({
  variant = "light",
  message = "Yükleniyor...",
  description = "Lütfen bekleyin."
}: {
  variant?: "light" | "dark";
  message?: string;
  description?: string;
}) {
  const dark = variant === "dark";

  return (
    <main className={cn("grid min-h-screen place-items-center px-6", dark ? "bg-deep-blue text-white" : "bg-warm-white text-dark-navy")}>
      <div className="flex max-w-sm flex-col items-center text-center">
        <OfficialLogo variant={dark ? "white" : "color"} size="xl" className="max-w-[260px]" />
        <div className={cn("mt-8 h-1 w-28 overflow-hidden rounded-full", dark ? "bg-white/12" : "bg-soft-blue")}>
          <div className={cn("h-full w-1/2 animate-pulse rounded-full", dark ? "bg-mint-green" : "bg-ocean-green")} />
        </div>
        <p className={cn("mt-5 text-lg font-extrabold", dark ? "text-white" : "text-dark-navy")}>{message}</p>
        <p className={cn("mt-2 text-sm font-semibold", dark ? "text-white/70" : "text-ink-muted")}>{description}</p>
      </div>
    </main>
  );
}
