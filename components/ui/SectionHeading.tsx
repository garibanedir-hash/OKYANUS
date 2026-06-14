import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn("min-w-0 max-w-[calc(100vw-2.5rem)] sm:max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow ? (
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-ocean-green">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="break-words text-3xl font-bold leading-tight text-dark-navy sm:text-4xl">{title}</h2>
      {description ? <p className="mt-4 break-words text-base leading-7 text-ink-muted sm:text-lg">{description}</p> : null}
    </div>
  );
}
