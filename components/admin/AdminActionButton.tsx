"use client";

import { cn } from "@/lib/utils";

export function AdminActionButton({
  children,
  variant = "ghost",
  href
}: {
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "danger";
  href?: string;
}) {
  const className = cn(
    "focus-ring inline-flex min-h-9 items-center justify-center rounded-full px-3 py-1.5 text-xs font-bold transition",
    variant === "primary" && "bg-deep-blue text-white hover:bg-dark-navy",
    variant === "ghost" && "bg-white text-deep-blue ring-1 ring-border-soft hover:bg-soft-blue",
    variant === "danger" && "bg-warm-accent/15 text-dark-navy ring-1 ring-warm-accent/25 hover:bg-warm-accent/25"
  );

  if (href) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={() => window.alert("Demo mod: Bu işlem gerçek veri üzerinde değişiklik yapmaz.")}
    >
      {children}
    </button>
  );
}
