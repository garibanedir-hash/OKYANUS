"use client";

import { useMemo, useState } from "react";

type ImageUrlFieldProps = {
  label: string;
  name: string;
  defaultValue?: string | null;
  helper?: string;
  placeholder?: string;
  fallbackLabel?: string;
};

const inputClassName = "focus-ring mt-2 w-full rounded-lg border border-border-soft px-3 py-2 text-sm text-dark-navy";

function isLikelyUrl(value: string) {
  if (!value.trim()) return false;
  if (value.startsWith("/")) return true;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function ImageUrlField({
  label,
  name,
  defaultValue,
  helper,
  placeholder = "https://...",
  fallbackLabel = "Görsel önizleme"
}: ImageUrlFieldProps) {
  const [value, setValue] = useState(defaultValue ?? "");
  const validUrl = useMemo(() => isLikelyUrl(value), [value]);
  const showWarning = value.trim().length > 0 && !validUrl;

  return (
    <label className="text-sm font-bold text-dark-navy">
      {label}
      <input
        name={name}
        type="text"
        inputMode="url"
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        onChange={(event) => setValue(event.currentTarget.value)}
        className={inputClassName}
      />
      {helper ? <span className="mt-1 block text-xs font-semibold leading-5 text-ink-muted">{helper}</span> : null}
      <span className="mt-3 block overflow-hidden rounded-lg border border-border-soft bg-soft-gray">
        {validUrl ? (
          <span
            className="block h-32 bg-cover bg-center"
            style={{ backgroundImage: `url("${value}")` }}
            aria-label={`${label} önizlemesi`}
          />
        ) : (
          <span className="flex h-32 items-center justify-center gap-2 px-4 text-center text-xs font-bold leading-5 text-ink-muted">
            <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-ocean-green stroke-[1.8]">
              <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5Z" />
              <path d="m4 16 4.5-4.5 3 3 2-2L20 19" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 8.5h.01" strokeLinecap="round" />
            </svg>
            {fallbackLabel}
          </span>
        )}
      </span>
      {showWarning ? <span className="mt-1 block text-xs font-bold text-red-700">Geçerli bir görsel URL girin veya boş bırakın.</span> : null}
    </label>
  );
}
