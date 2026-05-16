"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CheckSquare, Home, Mail, UsersRound, Waves } from "lucide-react";
import { OfficialLogo } from "@/components/brand/OfficialLogo";
import { cn } from "@/lib/utils";

const items = [
  { label: "Özet", href: "/koordinator", icon: Home },
  { label: "Görevler", href: "/koordinator/gorevler", icon: CheckSquare },
  { label: "Ekip", href: "/koordinator/ekip", icon: UsersRound },
  { label: "Faaliyetler", href: "/koordinator/faaliyetler", icon: Waves },
  { label: "Mesajlar", href: "/koordinator/mesajlar", icon: Mail },
  { label: "Raporlar", href: "/koordinator/raporlar", icon: BarChart3 }
];

export function CoordinatorSidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-b border-deep-blue/80 bg-deep-blue text-white lg:fixed lg:inset-y-0 lg:w-[18rem] lg:border-b-0 lg:border-r">
      <div className="border-b border-white/10 px-5 py-5">
        <OfficialLogo variant="white" context="sidebar" className="-ml-3" />
        <p className="mt-3 border-l-2 border-ocean-green/80 pl-3 text-[0.7rem] font-semibold leading-5 text-white/72">Koordinatör paneli sadece sorumlu ekip, faaliyet ve görev alanlarını gösterir.</p>
      </div>
      <nav className="flex gap-1.5 overflow-x-auto px-3 py-4 lg:flex-col" aria-label="Koordinatör menüsü">
        {items.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className={cn("focus-ring flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-[0.84rem] font-bold transition", active ? "bg-white text-deep-blue shadow-sm" : "text-white/76 hover:bg-white/10 hover:text-white")}>
              <Icon aria-hidden className={cn("h-[18px] w-[18px]", active ? "text-ocean-green" : "text-white/62")} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
