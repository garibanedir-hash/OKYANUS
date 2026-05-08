import { Droplets, HandHeart, Waves } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export function VisualPlaceholder({
  label,
  className
}: {
  label: string;
  className?: string;
}) {
  return (
    <div className={cn("ocean-card relative overflow-hidden", className)}>
      <div className="absolute inset-0 wave-grid opacity-55" />
      <div className="wave-lines absolute inset-x-0 bottom-0 h-28 opacity-60" />
      <Badge variant="light" className="absolute left-5 top-5 shadow-sm">
        {label}
      </Badge>
      <div className="absolute bottom-5 left-5 flex items-center gap-3 text-deep-blue">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/86 shadow-card">
          <HandHeart aria-hidden className="h-7 w-7" />
        </span>
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-mint-green text-ocean-green shadow-sm">
          <Droplets aria-hidden className="h-6 w-6" />
        </span>
      </div>
      <Waves aria-hidden className="absolute right-5 bottom-6 h-10 w-10 text-primary-blue/35" />
    </div>
  );
}
