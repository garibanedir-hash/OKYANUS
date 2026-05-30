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
        "absolute bottom-4 right-4 z-20 flex flex-col overflow-hidden rounded-md border border-white/10 bg-[#061824]/90 shadow-[0_16px_40px_rgba(0,0,0,0.32)] backdrop-blur",
        className
      )}
      aria-label="Harita yakınlaştırma kontrolleri"
    >
      <button
        type="button"
        onClick={onZoomIn}
        className="flex h-11 w-11 items-center justify-center border-b border-white/10 text-lg font-bold text-slate-200 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F8083]"
        aria-label="Haritayı yakınlaştır"
      >
        +
      </button>
      <button
        type="button"
        onClick={onZoomOut}
        className="flex h-11 w-11 items-center justify-center border-b border-white/10 text-lg font-bold text-slate-200 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F8083]"
        aria-label="Haritayı uzaklaştır"
      >
        -
      </button>
      <button
        type="button"
        onClick={onFocusRegion}
        className="flex h-11 w-11 items-center justify-center border-b border-white/10 text-sm font-extrabold text-[#E8B04B] transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F8083]"
        aria-label="Seçili bölgeye odaklan"
      >
        ◎
      </button>
      <button
        type="button"
        onClick={onReset}
        className="flex h-11 w-11 items-center justify-center text-[0.58rem] font-extrabold uppercase tracking-[0.08em] text-[#9DB7C5] transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F8083]"
        aria-label={`Harita görünümünü sıfırla, mevcut yakınlaştırma ${Math.round(zoom * 100)}%`}
        title={`${Math.round(zoom * 100)}%`}
      >
        MAP
      </button>
    </div>
  );
}
