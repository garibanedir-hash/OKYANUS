import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonProps = {
  href?: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "light";
  className?: string;
  type?: "button" | "submit";
  showIcon?: boolean;
  onClick?: () => void;
};

const styles = {
  primary:
    "bg-ocean-green text-white shadow-card hover:-translate-y-0.5 hover:bg-deep-blue active:translate-y-0",
  secondary:
    "bg-deep-blue text-white shadow-card hover:-translate-y-0.5 hover:bg-dark-navy active:translate-y-0",
  ghost:
    "bg-white/85 text-deep-blue ring-1 ring-deep-blue/10 hover:bg-soft-blue active:bg-mint-green",
  light:
    "bg-white text-deep-blue shadow-card hover:-translate-y-0.5 hover:bg-mint-green active:translate-y-0"
};

export function Button({
  href,
  children,
  variant = "primary",
  className,
  type = "button",
  showIcon = false,
  onClick
}: ButtonProps) {
  const content = (
    <>
      <span>{children}</span>
      {showIcon ? <ArrowRight aria-hidden className="h-4 w-4" /> : null}
    </>
  );
  const classNames = cn(
    "focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition",
    styles[variant],
    className
  );

  if (href) {
    return (
      <Link href={href} className={classNames}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classNames}>
      {content}
    </button>
  );
}
