import { cn } from "@/lib/utils";

const fieldClass =
  "focus-ring mt-2 w-full rounded-2xl border border-border-soft bg-white px-4 py-3 text-dark-navy shadow-sm transition placeholder:text-ink-muted/60 hover:border-primary-blue/35";

export function TextField({
  label,
  type = "text",
  required = false,
  placeholder,
  className
}: {
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={cn("block text-sm font-bold text-dark-navy", className)}>
      {label}
      <input required={required} type={type} placeholder={placeholder} className={fieldClass} />
    </label>
  );
}

export function TextAreaField({
  label,
  required = false,
  placeholder,
  className,
  rows = 4
}: {
  label: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  rows?: number;
}) {
  return (
    <label className={cn("block text-sm font-bold text-dark-navy", className)}>
      {label}
      <textarea required={required} rows={rows} placeholder={placeholder} className={cn(fieldClass, "min-h-28 resize-y")} />
    </label>
  );
}

export function SelectField({
  label,
  children,
  className,
  value,
  onChange
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <label className={cn("block text-sm font-bold text-dark-navy", className)}>
      {label}
      <select value={value} onChange={onChange} className={cn(fieldClass, "appearance-none")}>
        {children}
      </select>
    </label>
  );
}
