import Link from "next/link";
import { Bell, ExternalLink, Plus, Search, ShieldCheck } from "lucide-react";
import { adminAuthEnabled, isAdminDemoMode } from "@/config/admin";

export function AdminTopbar() {
  const authLabel = isAdminDemoMode ? "Demo Mod" : adminAuthEnabled ? "Auth Hazır" : "Demo Mod";

  return (
    <header className="sticky top-0 z-30 border-b border-border-soft bg-warm-white/90 backdrop-blur">
      <div className="flex min-h-16 flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <p className="text-sm font-bold text-ink-muted">Okyanus Yönetim Paneli</p>
          <h1 className="text-xl font-extrabold text-dark-navy">Operasyon ve İçerik Önizleme</h1>
        </div>
        <div className="flex flex-1 flex-wrap items-center justify-end gap-3">
          <label className="relative hidden min-w-64 md:block">
            <span className="sr-only">Admin panelde ara</span>
            <Search aria-hidden className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input className="focus-ring w-full rounded-full border border-border-soft bg-white py-2 pl-10 pr-4 text-sm" placeholder="Proje, bağış, gönüllü ara" />
          </label>
          <button className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-deep-blue shadow-card ring-1 ring-border-soft" type="button" aria-label="Bildirimler">
            <Bell aria-hidden className="h-4 w-4" />
          </button>
          <button className="focus-ring inline-flex items-center gap-2 rounded-full bg-deep-blue px-4 py-2 text-sm font-bold text-white shadow-card" type="button">
            <Plus aria-hidden className="h-4 w-4" />
            Hızlı İşlem
          </button>
          <span className="inline-flex items-center gap-2 rounded-full bg-mint-green px-3 py-1.5 text-xs font-extrabold text-ocean-green">
            <ShieldCheck aria-hidden className="h-4 w-4" />
            {authLabel}
          </span>
          <Link href="/" className="focus-ring inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-deep-blue shadow-card ring-1 ring-border-soft">
            Siteye Dön
            <ExternalLink aria-hidden className="h-4 w-4" />
          </Link>
          <div className="rounded-full bg-soft-blue px-4 py-2 text-sm font-bold text-deep-blue">
            Admin Kullanıcı ▾
          </div>
        </div>
      </div>
    </header>
  );
}
