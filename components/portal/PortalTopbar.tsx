import Link from "next/link";
import { Bell } from "lucide-react";
import { getCurrentPortalUser } from "@/lib/data/portalRepository";

export function PortalTopbar() {
  const user = getCurrentPortalUser();

  return (
    <header className="sticky top-0 z-30 border-b border-border-soft bg-warm-white/90 px-5 py-4 backdrop-blur lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ocean-green">Demo kullanıcı paneli</p>
          <h1 className="text-xl font-extrabold text-dark-navy">Merhaba, {user.fullName}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-mint-green px-3 py-1 text-xs font-extrabold text-ocean-green">{user.accountType}</span>
          <button className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-deep-blue shadow-card" type="button" aria-label="Bildirimler">
            <Bell aria-hidden className="h-5 w-5" />
          </button>
          <Link className="focus-ring rounded-full bg-white px-4 py-2 text-sm font-bold text-deep-blue shadow-card" href="/">Siteye Dön</Link>
        </div>
      </div>
    </header>
  );
}
