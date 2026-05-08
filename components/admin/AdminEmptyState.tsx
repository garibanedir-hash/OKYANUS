import { Inbox } from "lucide-react";

export function AdminEmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-brand border border-dashed border-border-soft bg-white p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-soft-blue text-deep-blue">
        <Inbox aria-hidden className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-xl font-bold text-dark-navy">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-ink-muted">{description}</p>
    </div>
  );
}
