"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BrandMark } from "@/components/BrandMark";
import { cn } from "@/lib/utils";

const logoSources = {
  color: "/brand/logo.png",
  white: "/brand/logo-white.png",
  mark: "/brand/mark.png"
};

const sizeClasses = {
  sm: {
    logo: "h-16 w-16",
    mark: "h-14 w-14",
    text: "text-sm"
  },
  md: {
    logo: "h-28 w-28",
    mark: "h-20 w-20",
    text: "text-base"
  },
  lg: {
    logo: "h-44 w-44",
    mark: "h-28 w-28",
    text: "text-lg"
  },
  xl: {
    logo: "h-56 w-56",
    mark: "h-36 w-36",
    text: "text-xl"
  },
  hero: {
    logo: "h-72 w-72 sm:h-80 sm:w-80 lg:h-96 lg:w-96",
    mark: "h-36 w-36",
    text: "text-xl"
  },
  header: {
    logo: "h-20 w-20",
    mark: "h-16 w-16",
    text: "text-base"
  }
};

const contextDefaults = {
  header: "header",
  sidebar: "lg",
  topbar: "md",
  auth: "xl",
  hero: "hero",
  footer: "lg",
  compact: "sm"
} as const;

export function OfficialLogo({
  variant = "color",
  context,
  size,
  showText = false,
  className,
  onClick
}: {
  variant?: "color" | "white" | "mark";
  context?: "header" | "sidebar" | "topbar" | "auth" | "hero" | "footer" | "compact";
  size?: "sm" | "md" | "lg" | "xl" | "hero" | "header";
  showText?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  const [failed, setFailed] = useState(false);
  const inverse = variant === "white";
  const resolvedSize = size ?? (context ? contextDefaults[context] : "md");
  const dimensions = sizeClasses[resolvedSize];

  if (failed) {
    return <BrandMark compact={resolvedSize === "sm"} inverse={inverse} onClick={onClick} />;
  }

  return (
    <Link href="/" className={cn("focus-ring inline-flex items-center gap-3 rounded-xl", className)} onClick={onClick}>
      <Image
        src={logoSources[variant]}
        alt={variant === "mark" && !showText ? "Okyanus" : "Okyanus İnsani Yardım Derneği"}
        width={variant === "mark" ? 96 : 360}
        height={variant === "mark" ? 96 : 120}
        className={cn("shrink-0 object-contain", variant === "mark" ? dimensions.mark : dimensions.logo)}
        onError={() => setFailed(true)}
        priority={resolvedSize === "lg" || resolvedSize === "xl"}
      />
      {variant === "mark" && showText ? (
        <span className="leading-tight">
          <span className={cn("block font-extrabold", dimensions.text, inverse ? "text-white" : "text-dark-navy")}>
            Okyanus
          </span>
          <span className={cn("block text-[0.68rem] font-bold uppercase tracking-[0.14em]", inverse ? "text-mint-green" : "text-ocean-green")}>
            İnsani Yardım Derneği
          </span>
        </span>
      ) : null}
    </Link>
  );
}
