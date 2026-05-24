import { cn } from "@/lib/utils";

const fieldClass =
  "focus-ring mt-2 w-full rounded-2xl border border-border-soft bg-white px-4 py-3 text-dark-navy shadow-sm transition placeholder:text-ink-muted/60 hover:border-primary-blue/35";

export function TextField({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
  className,
  min,
  max,
  step,
  maxLength,
  autoComplete
}: {
  label: string;
  name?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  min?: number;
  max?: number;
  step?: number | string;
  maxLength?: number;
  autoComplete?: string;
}) {
  return (
    <label className={cn("block text-sm font-bold text-dark-navy", className)}>
      {label}
      <input
        name={name}
        required={required}
        type={type}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        maxLength={maxLength}
        autoComplete={autoComplete}
        className={fieldClass}
      />
    </label>
  );
}

export function TextAreaField({
  label,
  name,
  required = false,
  placeholder,
  className,
  rows = 4,
  maxLength
}: {
  label: string;
  name?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  rows?: number;
  maxLength?: number;
}) {
  return (
    <label className={cn("block text-sm font-bold text-dark-navy", className)}>
      {label}
      <textarea name={name} required={required} rows={rows} maxLength={maxLength} placeholder={placeholder} className={cn(fieldClass, "min-h-28 resize-y")} />
    </label>
  );
}

export function SelectField({
  label,
  children,
  className,
  name,
  value,
  onChange,
  required = false
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  name?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
}) {
  return (
    <label className={cn("block text-sm font-bold text-dark-navy", className)}>
      {label}
      <select name={name} value={value} onChange={onChange} required={required} className={cn(fieldClass, "appearance-none")}>
        {children}
      </select>
    </label>
  );
}
