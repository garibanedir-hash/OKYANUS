import Link from "next/link";
import { getCoordinatorDashboard } from "@/lib/data/accessRepository";

export function CoordinatorTopbar() {
  const { profile } = getCoordinatorDashboard();

  return (
    <header className="sticky top-0 z-30 border-b border-border-soft bg-white/95 px-4 py-2.5 backdrop-blur lg:px-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-ocean-green">Koordinatör demo paneli</p>
          <h1 className="text-base font-extrabold text-dark-navy">{profile.fullName}</h1>
        </div>
        <div className="flex gap-2">
          <span className="rounded bg-soft-blue px-2.5 py-2 text-xs font-extrabold text-deep-blue">{profile.area}</span>
          <Link className="focus-ring rounded-lg bg-white px-3 py-2 text-xs font-bold text-deep-blue ring-1 ring-border-soft" href="/">Siteye Dön</Link>
        </div>
      </div>
    </header>
  );
}
