import { cn } from "@/lib/utils";

export function Card({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-brand border border-border-soft bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-soft",
        className
      )}
    >
      {children}
    </div>
  );
}
