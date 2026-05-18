"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

export function AuthSubmitButton({
  idleLabel,
  pendingLabel,
  className
}: {
  idleLabel: string;
  pendingLabel: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className={cn(
        "focus-ring inline-flex min-h-12 w-full items-center justify-center rounded-full bg-deep-blue px-5 py-3 text-sm font-bold text-white transition hover:bg-dark-navy disabled:cursor-wait disabled:opacity-70",
        className
      )}
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
