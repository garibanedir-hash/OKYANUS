"use client";

import { cn } from "@/lib/utils";

type ProjectRegionZoomControlsProps = {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFocusRegion: () => void;
  onReset: () => void;
  className?: string;
};

export function ProjectRegionZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onFocusRegion,
  onReset,
  className
}: ProjectRegionZoomControlsProps) {
  return (
    <div
      className={cn(
        "absolute bottom-4 right-4 z-20 flex flex-col overflow-hidden rounded-md border border-white/15 bg-white/92 shadow-[0_12px_28px_rgba(15,37,71,0.16)] backdrop-blur",
        className
      )}
      aria-label="Harita yakınlaştırma kontrolleri"
    >
      <button
        type="button"
        onClick={onZoomIn}
        className="flex h-9 w-9 items-center justify-center border-b border-[#DDE8E7] text-base font-semibold text-[#0F2547] transition hover:bg-[#F4F8F7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F8083]"
        aria-label="Haritayı yakınlaştır"
      >
        +
      </button>
      <button
        type="button"
        onClick={onZoomOut}
        className="flex h-9 w-9 items-center justify-center border-b border-[#DDE8E7] text-base font-semibold text-[#0F2547] transition hover:bg-[#F4F8F7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F8083]"
        aria-label="Haritayı uzaklaştır"
      >
        -
      </button>
      <button
        type="button"
        onClick={onFocusRegion}
        className="flex h-9 w-9 items-center justify-center border-b border-[#DDE8E7] text-sm font-semibold text-[#1F8083] transition hover:bg-[#F4F8F7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F8083]"
        aria-label="Seçili bölgeye odaklan"
      >
        ◎
      </button>
      <button
        type="button"
        onClick={onReset}
        className="flex h-9 w-9 items-center justify-center text-sm font-semibold text-[#64748B] transition hover:bg-[#F4F8F7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F8083]"
        aria-label={`Harita görünümünü sıfırla, mevcut yakınlaştırma ${Math.round(zoom * 100)}%`}
        title={`${Math.round(zoom * 100)}%`}
      >
        ↺
      </button>
    </div>
  );
}
