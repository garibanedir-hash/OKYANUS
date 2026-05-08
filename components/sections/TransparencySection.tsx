import type { LucideIcon } from "lucide-react";

export function TransparencySection({
  icon: Icon,
  title,
  text
}: {
  icon: LucideIcon;
  title: string;
  text: string;
}) {
  return (
    <article className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mint-green text-ocean-green">
        <Icon aria-hidden className="h-5 w-5" />
      </span>
      <h2 className="mt-4 text-xl font-bold text-dark-navy">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-ink-muted">{text}</p>
    </article>
  );
}
