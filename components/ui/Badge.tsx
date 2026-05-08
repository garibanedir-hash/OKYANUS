import { cn } from "@/lib/utils";

export function Badge({
  children,
  variant = "green",
  className
}: {
  children: React.ReactNode;
  variant?: "green" | "blue" | "light";
  className?: string;
}) {
  const variants = {
    green: "bg-mint-green text-ocean-green ring-ocean-green/10",
    blue: "bg-soft-blue text-deep-blue ring-primary-blue/10",
    light: "bg-white/85 text-deep-blue ring-white/60"
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
