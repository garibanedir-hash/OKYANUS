import { Button } from "@/components/ui/Button";
import { getDonationTarget } from "@/lib/donations/donationMode";
import type { DonationContext } from "@/lib/donations/donationTarget";

type DonationCtaButtonProps = {
  label: string;
  context?: DonationContext;
  onlineHref?: string;
  className?: string;
  variant?: "primary" | "secondary" | "ghost" | "light";
  showIcon?: boolean;
};

export function DonationCtaButton({
  label,
  context,
  onlineHref = "/bagis-yap",
  className,
  variant = "primary",
  showIcon = false
}: DonationCtaButtonProps) {
  const target = getDonationTarget(context, onlineHref);

  return (
    <Button
      href={target.href}
      target={target.isExternal ? "_blank" : undefined}
      rel={target.isExternal ? "noopener noreferrer" : undefined}
      variant={variant}
      className={className}
      showIcon={showIcon}
    >
      {label}
    </Button>
  );
}
