import Link from "next/link";
import { Bell } from "lucide-react";
import { getCurrentPortalUser } from "@/lib/data/portalRepository";

export function PortalTopbar() {
  const user = getCurrentPortalUser();

  return (
    <header className="sticky top-0 z-30 border-b border-border-soft bg-white/95 px-4 py-2.5 backdrop-blur lg:px-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-ocean-green">Demo kullanıcı paneli</p>
          <h1 className="text-base font-extrabold text-dark-navy">Merhaba, {user.fullName}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded bg-mint-green px-2.5 py-1 text-xs font-extrabold text-ocean-green">{user.accountType}</span>
          <button className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white text-deep-blue ring-1 ring-border-soft" type="button" aria-label="Bildirimler">
            <Bell aria-hidden className="h-4 w-4" />
          </button>
          <Link className="focus-ring rounded-lg bg-white px-3 py-2 text-xs font-bold text-deep-blue ring-1 ring-border-soft" href="/">Siteye Dön</Link>
        </div>
      </div>
    </header>
  );
}
