"use client";

import { sanitizeAdminUiNode } from "@/components/admin/adminUiText";
import { cn } from "@/lib/utils";

export function AdminActionButton({
  children,
  variant = "ghost",
  href,
  onClick
}: {
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "danger";
  href?: string;
  onClick?: () => void;
}) {
  const safeChildren = sanitizeAdminUiNode(children);
  const className = cn(
    "focus-ring inline-flex min-h-8 items-center justify-center rounded-md px-2.5 py-1 text-[0.72rem] font-extrabold transition",
    variant === "primary" && "bg-deep-blue text-white hover:bg-dark-navy",
    variant === "ghost" && "bg-white text-deep-blue ring-1 ring-border-soft hover:bg-soft-blue",
    variant === "danger" && "bg-warm-accent/15 text-dark-navy ring-1 ring-warm-accent/25 hover:bg-warm-accent/25"
  );

  if (href) {
    return (
      <a href={href} className={className}>
        {safeChildren}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={onClick ?? (() => window.alert("Bu işlem için gerekli kayıt henüz bulunmuyor."))}
    >
      {safeChildren}
    </button>
  );
}
