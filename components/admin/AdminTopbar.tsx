import Link from "next/link";
import { Bell, ExternalLink, Plus, Search, ShieldCheck } from "lucide-react";
import { adminAuthEnabled, isAdminDemoMode } from "@/config/admin";

export function AdminTopbar() {
  const authLabel = isAdminDemoMode ? "Demo Mod" : adminAuthEnabled ? "Auth Hazır" : "Demo Mod";

  return (
    <header className="sticky top-0 z-30 border-b border-border-soft bg-white/95 backdrop-blur">
      <div className="flex min-h-11 flex-col gap-2 px-3 py-1.5 md:flex-row md:items-center md:justify-between lg:px-4">
        <div>
          <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-ocean-green">Okyanus Yönetim Paneli</p>
          <h1 className="text-sm font-extrabold text-dark-navy">Operasyon Merkezi</h1>
        </div>
        <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
          <label className="relative hidden min-w-64 md:block">
            <span className="sr-only">Admin panelde ara</span>
            <Search aria-hidden className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
            <input className="focus-ring h-9 w-full rounded-lg border border-border-soft bg-soft-gray/60 pl-9 pr-3 text-sm" placeholder="Proje, bağış, gönüllü ara" />
          </label>
          <button className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-md bg-white text-deep-blue ring-1 ring-border-soft" type="button" aria-label="Bildirimler">
            <Bell aria-hidden className="h-4 w-4" />
          </button>
          <button className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-md bg-deep-blue px-2.5 text-[0.7rem] font-bold text-white" type="button">
            <Plus aria-hidden className="h-3.5 w-3.5" />
            Hızlı İşlem
          </button>
          <span className="inline-flex h-8 items-center gap-1.5 rounded-md bg-mint-green px-2 text-[0.65rem] font-extrabold text-ocean-green">
            <ShieldCheck aria-hidden className="h-3.5 w-3.5" />
            {authLabel}
          </span>
          <Link href="/" className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-md bg-white px-2.5 text-[0.7rem] font-bold text-deep-blue ring-1 ring-border-soft">
            Siteye Dön
            <ExternalLink aria-hidden className="h-3.5 w-3.5" />
          </Link>
          <div className="rounded-md bg-soft-blue px-2.5 py-1.5 text-[0.7rem] font-bold text-deep-blue">
            Admin Kullanıcı ▾
          </div>
        </div>
      </div>
    </header>
  );
}
