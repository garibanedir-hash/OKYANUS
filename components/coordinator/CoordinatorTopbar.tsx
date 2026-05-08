import Link from "next/link";
import { getCoordinatorDashboard } from "@/lib/data/accessRepository";

export function CoordinatorTopbar() {
  const { profile } = getCoordinatorDashboard();

  return (
    <header className="sticky top-0 z-30 border-b border-border-soft bg-warm-white/90 px-5 py-4 backdrop-blur lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ocean-green">Koordinatör demo paneli</p>
          <h1 className="text-xl font-extrabold text-dark-navy">{profile.fullName}</h1>
        </div>
        <div className="flex gap-2">
          <span className="rounded-full bg-soft-blue px-3 py-2 text-xs font-extrabold text-deep-blue">{profile.area}</span>
          <Link className="focus-ring rounded-full bg-white px-4 py-2 text-sm font-bold text-deep-blue shadow-card" href="/">Siteye Dön</Link>
        </div>
      </div>
    </header>
  );
}
