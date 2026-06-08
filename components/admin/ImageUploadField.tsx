"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ImageUrlField } from "@/components/admin/ImageUrlField";

type ImageUploadFieldProps = {
  label: string;
  fileName: string;
  urlName: string;
  defaultUrl?: string | null;
  helper?: string;
  fallbackLabel?: string;
};

const fileInputClassName = "sr-only";

function isLikelyImageUrl(value?: string | null) {
  if (!value?.trim()) return false;
  if (value.startsWith("/")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function ImageUploadField({
  label,
  fileName,
  urlName,
  defaultUrl,
  helper,
  fallbackLabel = "Görsel önizleme"
}: ImageUploadFieldProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [removeRequested, setRemoveRequested] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const defaultImageIsValid = useMemo(() => isLikelyImageUrl(defaultUrl), [defaultUrl]);
  const objectUrl = useMemo(() => (selectedFile ? URL.createObjectURL(selectedFile) : null), [selectedFile]);
  const previewUrl = removeRequested ? null : objectUrl ?? (defaultImageIsValid ? defaultUrl : null);

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  return (
    <div className="rounded-lg border border-border-soft bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold text-dark-navy">{label}</p>
          {helper ? <p className="mt-1 text-xs font-semibold leading-5 text-ink-muted">{helper}</p> : null}
          <p className="mt-1 text-xs font-semibold leading-5 text-ink-muted">JPG, PNG veya WebP. En fazla 5 MB.</p>
        </div>
        <label className="focus-within:focus-ring inline-flex min-h-10 cursor-pointer items-center justify-center rounded-md bg-ocean-green px-4 py-2 text-sm font-extrabold text-white transition hover:bg-deep-blue">
          Dosya Seç
          <input
            name={fileName}
            type="file"
            ref={fileInputRef}
            accept="image/jpeg,image/png,image/webp"
            className={fileInputClassName}
            onChange={(event) => {
              setSelectedFile(event.currentTarget.files?.[0] ?? null);
              setRemoveRequested(false);
            }}
          />
        </label>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-border-soft bg-soft-gray">
        {previewUrl ? (
          <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url("${previewUrl}")` }} aria-label={`${label} önizlemesi`} />
        ) : (
          <div className="flex h-40 items-center justify-center gap-2 px-4 text-center text-xs font-bold leading-5 text-ink-muted">
            <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-ocean-green stroke-[1.8]">
              <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5Z" />
              <path d="m4 16 4.5-4.5 3 3 2-2L20 19" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 8.5h.01" strokeLinecap="round" />
            </svg>
            {fallbackLabel}
          </div>
        )}
      </div>

      {selectedFile ? (
        <p className="mt-2 text-xs font-bold leading-5 text-ocean-green">
          {selectedFile.name} kaydetme sırasında yüklenecek.
        </p>
      ) : null}

      {defaultUrl ? (
        <label className="mt-3 flex items-start gap-2 rounded-lg border border-border-soft bg-soft-gray px-3 py-2 text-xs font-bold leading-5 text-ink-muted">
          <input
            name={`${urlName}Remove`}
            type="checkbox"
            checked={removeRequested}
            onChange={(event) => {
              setRemoveRequested(event.currentTarget.checked);
              if (event.currentTarget.checked) {
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }
            }}
            className="mt-0.5 h-4 w-4 accent-ocean-green"
          />
          <span>Görseli kaldır</span>
        </label>
      ) : null}

      <details className="mt-4 rounded-lg border border-border-soft bg-soft-gray p-3">
        <summary className="cursor-pointer text-xs font-extrabold text-dark-navy">Gelişmiş: URL ile ekle</summary>
        <div className="mt-3">
          <ImageUrlField
            label={`${label} URL`}
            name={urlName}
            defaultValue={defaultUrl}
            helper="Dosya seçmezseniz bu URL kaydedilir. Boş bırakılırsa mevcut görsel temizlenebilir."
            fallbackLabel={fallbackLabel}
          />
        </div>
      </details>
    </div>
  );
}
