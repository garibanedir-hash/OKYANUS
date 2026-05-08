export function Timeline({ items }: { items: string[] }) {
  return (
    <ol className="grid gap-4">
      {items.map((item, index) => (
        <li key={item} className="flex gap-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mint-green text-sm font-extrabold text-ocean-green">
            {index + 1}
          </span>
          <p className="pt-1 text-sm font-semibold leading-6 text-ink-muted">{item}</p>
        </li>
      ))}
    </ol>
  );
}
