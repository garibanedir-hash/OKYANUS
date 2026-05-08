import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export function PageHero({
  eyebrow,
  title,
  description,
  children,
  className
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("ocean-surface relative overflow-hidden border-b border-border-soft py-14 sm:py-20", className)}>
      <div className="absolute inset-0 wave-grid opacity-45" />
      <div className="wave-lines absolute inset-x-0 bottom-0 h-28 opacity-55" />
      <Container className="relative">
        <div className="max-w-4xl">
          <Badge variant="light">{eyebrow}</Badge>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight text-dark-navy sm:text-5xl">{title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-ink-muted">{description}</p>
        </div>
        {children ? <div className="mt-8">{children}</div> : null}
      </Container>
    </section>
  );
}
