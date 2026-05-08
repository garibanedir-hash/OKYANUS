"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CheckSquare, Home, Mail, UsersRound, Waves } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
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
    <aside className="border-b border-border-soft bg-white lg:fixed lg:inset-y-0 lg:w-72 lg:border-b-0 lg:border-r">
      <div className="border-b border-border-soft p-5">
        <BrandMark compact />
        <p className="mt-4 rounded-2xl bg-soft-blue p-3 text-xs font-bold leading-5 text-deep-blue">Koordinatör paneli sadece sorumlu ekip, faaliyet ve görev alanlarını gösterir.</p>
      </div>
      <nav className="flex gap-2 overflow-x-auto p-4 lg:flex-col" aria-label="Koordinatör menüsü">
        {items.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className={cn("focus-ring flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition", active ? "bg-deep-blue text-white" : "text-ink-muted hover:bg-soft-blue hover:text-deep-blue")}>
              <Icon aria-hidden className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
