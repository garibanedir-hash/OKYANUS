"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CalendarDays, Gift, HeartHandshake, Home, ShieldCheck, UserRound, Waves } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { cn } from "@/lib/utils";

const items = [
  { label: "Özet", href: "/panel", icon: Home },
  { label: "Bağışçı", href: "/panel/bagisci", icon: HeartHandshake },
  { label: "Gönüllü", href: "/panel/gonullu", icon: Waves },
  { label: "Projeler", href: "/panel/projeler", icon: Gift },
  { label: "Faaliyetler", href: "/panel/faaliyetler", icon: CalendarDays },
  { label: "Etkinlikler", href: "/panel/etkinlikler", icon: CalendarDays },
  { label: "Yetim Sponsorluk", href: "/panel/yetim-sponsorluk", icon: ShieldCheck },
  { label: "Bağışlarım", href: "/panel/bagislarim", icon: HeartHandshake },
  { label: "Bildirimler", href: "/panel/bildirimler", icon: Bell },
  { label: "Profil", href: "/panel/profil", icon: UserRound }
];

export function PortalSidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-b border-border-soft bg-white lg:fixed lg:inset-y-0 lg:w-72 lg:border-b-0 lg:border-r">
      <div className="border-b border-border-soft p-5">
        <BrandMark compact />
        <p className="mt-4 rounded-2xl bg-soft-blue p-3 text-xs font-bold leading-5 text-deep-blue">
          Kullanıcı paneli demo modda çalışır. Gerçek oturum ve veri erişimi 8B sonrası bağlanacaktır.
        </p>
      </div>
      <nav aria-label="Kullanıcı panel menüsü" className="flex gap-2 overflow-x-auto p-4 lg:flex-col lg:overflow-y-auto">
        {items.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "focus-ring flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition",
                active ? "bg-deep-blue text-white shadow-card" : "text-ink-muted hover:bg-soft-blue hover:text-deep-blue"
              )}
            >
              <Icon aria-hidden className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
