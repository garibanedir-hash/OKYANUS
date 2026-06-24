"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CalendarDays, Gift, HeartHandshake, Home, ShieldCheck, UserRound, Waves } from "lucide-react";
import { OfficialLogo } from "@/components/brand/OfficialLogo";
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
  { label: "Kurbanlarım", href: "/panel/kurbanlarim", icon: Gift },
  { label: "Bildirimler", href: "/panel/bildirimler", icon: Bell },
  { label: "Profil", href: "/panel/profil", icon: UserRound }
];

export function PortalSidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-b border-deep-blue/80 bg-deep-blue text-white lg:fixed lg:inset-y-0 lg:w-[18rem] lg:border-b-0 lg:border-r">
      <div className="border-b border-white/10 px-5 py-5">
        <OfficialLogo variant="white" context="sidebar" className="-ml-3" />
        <p className="mt-3 border-l-2 border-ocean-green/80 pl-3 text-[0.7rem] font-semibold leading-5 text-white/72">
          Kullanıcı paneli, yetkili oturumla kişisel kayıtları görüntülemek için hazırlanmıştır.
        </p>
      </div>
      <nav aria-label="Kullanıcı panel menüsü" className="flex gap-1.5 overflow-x-auto px-3 py-4 lg:flex-col lg:overflow-y-auto">
        {items.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "focus-ring flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-[0.84rem] font-bold transition",
                active ? "bg-white text-deep-blue shadow-sm" : "text-white/76 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon aria-hidden className={cn("h-[18px] w-[18px]", active ? "text-ocean-green" : "text-white/62")} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
