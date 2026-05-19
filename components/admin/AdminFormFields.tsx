type BaseFieldProps = {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  required?: boolean;
  helper?: string;
};

const inputClassName = "focus-ring mt-2 w-full rounded-lg border border-border-soft px-3 py-2 text-sm text-dark-navy";

export function AdminTextInput({
  label,
  name,
  defaultValue,
  required,
  helper,
  type = "text",
  placeholder
}: BaseFieldProps & {
  type?: "text" | "number" | "date" | "url";
  placeholder?: string;
}) {
  return (
    <label className="text-sm font-bold text-dark-navy">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className={inputClassName}
      />
      {helper ? <span className="mt-1 block text-xs font-semibold leading-5 text-ink-muted">{helper}</span> : null}
    </label>
  );
}

export function AdminTextarea({
  label,
  name,
  defaultValue,
  required,
  helper,
  rows = 5,
  placeholder
}: BaseFieldProps & {
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="text-sm font-bold text-dark-navy">
      {label}
      <textarea
        name={name}
        required={required}
        defaultValue={defaultValue ?? ""}
        rows={rows}
        placeholder={placeholder}
        className={`${inputClassName} min-h-28 resize-y leading-6`}
      />
      {helper ? <span className="mt-1 block text-xs font-semibold leading-5 text-ink-muted">{helper}</span> : null}
    </label>
  );
}

export function AdminSelect({
  label,
  name,
  defaultValue,
  options,
  helper
}: BaseFieldProps & {
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <label className="text-sm font-bold text-dark-navy">
      {label}
      <select name={name} defaultValue={defaultValue ?? options[0]?.value} className={inputClassName}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      {helper ? <span className="mt-1 block text-xs font-semibold leading-5 text-ink-muted">{helper}</span> : null}
    </label>
  );
}
