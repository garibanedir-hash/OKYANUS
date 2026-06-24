"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BrandMark } from "@/components/BrandMark";
import { cn } from "@/lib/utils";

const logoSources = {
  color: { src: "/brand/logo.png", width: 500, height: 200 },
  white: { src: "/brand/logo-white.png", width: 500, height: 200 },
  mark: { src: "/brand/mark.png", width: 96, height: 96 }
};

const sizeClasses = {
  sm: {
    logo: "h-10 w-[9.75rem]",
    mark: "h-16 w-16",
    text: "text-sm"
  },
  md: {
    logo: "h-12 w-[11.75rem]",
    mark: "h-20 w-20",
    text: "text-base"
  },
  lg: {
    logo: "h-16 w-[15.5rem]",
    mark: "h-28 w-28",
    text: "text-lg"
  },
  xl: {
    logo: "h-20 w-[19.5rem]",
    mark: "h-40 w-40",
    text: "text-xl"
  },
  auth: {
    logo: "h-20 w-[19.5rem] sm:h-24 sm:w-[23.5rem] lg:h-28 lg:w-[27.25rem]",
    mark: "h-40 w-40",
    text: "text-xl"
  },
  footer: {
    logo: "h-[4.75rem] w-[18.5rem] sm:h-20 sm:w-[19.5rem]",
    mark: "h-28 w-28",
    text: "text-lg"
  },
  hero: {
    logo: "h-24 w-[23.5rem] sm:h-28 sm:w-[27.25rem] lg:h-32 lg:w-[31.25rem]",
    mark: "h-36 w-36",
    text: "text-xl"
  },
  header: {
    logo: "h-12 w-[11.75rem]",
    mark: "h-20 w-20",
    text: "text-base"
  }
};

const contextDefaults = {
  header: "header",
  sidebar: "md",
  topbar: "md",
  auth: "auth",
  hero: "hero",
  footer: "footer",
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
  size?: "sm" | "md" | "lg" | "xl" | "auth" | "footer" | "hero" | "header";
  showText?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  const [failed, setFailed] = useState(false);
  const inverse = variant === "white";
  const resolvedSize = size ?? (context ? contextDefaults[context] : "md");
  const dimensions = sizeClasses[resolvedSize];
  const source = logoSources[variant];
  const isMark = variant === "mark";
  const eager =
    resolvedSize === "header" ||
    resolvedSize === "lg" ||
    resolvedSize === "xl" ||
    resolvedSize === "auth" ||
    resolvedSize === "footer" ||
    resolvedSize === "hero";

  if (failed) {
    const isLarge = resolvedSize === "lg" || resolvedSize === "xl" || resolvedSize === "hero";
    return <BrandMark compact={resolvedSize === "sm"} large={isLarge} inverse={inverse} onClick={onClick} />;
  }

  return (
    <Link href="/" className={cn("focus-ring inline-flex items-center gap-3 rounded-xl", className)} onClick={onClick}>
      <Image
        src={source.src}
        alt={isMark && !showText ? "Okyanus" : "Okyanus İnsani Yardım Derneği"}
        width={source.width}
        height={source.height}
        className={cn(isMark ? "shrink-0 object-contain" : "max-w-full object-contain object-center", isMark ? dimensions.mark : dimensions.logo)}
        onError={() => setFailed(true)}
        loading={eager ? "eager" : undefined}
        preload={eager}
      />
      {isMark && showText ? (
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
