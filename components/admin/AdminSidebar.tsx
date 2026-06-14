"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BellRing,
  CalendarClock,
  CheckSquare,
  ChevronDown,
  ClipboardCheck,
  CreditCard,
  FileText,
  HeartHandshake,
  LayoutDashboard,
  Mail,
  MapPinned,
  MessageSquare,
  Newspaper,
  ReceiptText,
  Route,
  Settings,
  ShieldCheck,
  TableProperties,
  UserCog,
  UsersRound,
  WalletCards
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { OfficialLogo } from "@/components/brand/OfficialLogo";
import { cn } from "@/lib/utils";

type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
};

type AdminNavGroup = {
  title: string;
  items: AdminNavItem[];
};

const navGroups: AdminNavGroup[] = [
  {
    title: "GENEL",
    items: [
      { label: "Genel Bakış", href: "/admin", icon: LayoutDashboard },
      { label: "Raporlar", href: "/admin/raporlar", icon: FileText, badge: "demo" },
      { label: "Grafikler", href: "/admin/grafikler", icon: BarChart3, badge: "demo" }
    ]
  },
  {
    title: "OPERASYON",
    items: [
      { label: "İş Kayıtları & Faaliyetler", href: "/admin/is-kayitlari", icon: TableProperties, badge: "demo" },
      { label: "Faaliyet Kayıtları", href: "/admin/faaliyet-kayitlari", icon: ClipboardCheck, badge: "yeni" },
      { label: "Görevlendirmeler", href: "/admin/gorevlendirmeler", icon: Route, badge: "demo" },
      { label: "Görevler", href: "/admin/gorevler", icon: CheckSquare },
      { label: "Harcama & Masraf Talepleri", href: "/admin/harcama-masraf", icon: WalletCards, badge: "demo" },
      { label: "Ulaşım & Konaklama", href: "/admin/ulasim-konaklama", icon: Route, badge: "demo" }
    ]
  },
  {
    title: "TOPLANTI VE REZERVASYON",
    items: [
      { label: "Toplantı Yönetimi", href: "/admin/toplanti-yonetimi", icon: CalendarClock, badge: "demo" },
      { label: "Toplantı Rezervasyonu", href: "/admin/toplanti-rezervasyonu", icon: CalendarClock, badge: "demo" },
      { label: "Rezervasyon Takvimi", href: "/admin/rezervasyon-takvimi", icon: CalendarClock, badge: "demo" }
    ]
  },
  {
    title: "BAĞIŞ VE DESTEK",
    items: [
      { label: "Bağışlar", href: "/admin/bagislar", icon: HeartHandshake },
      { label: "Makbuzlar", href: "/admin/makbuzlar", icon: ReceiptText, badge: "demo" },
      { label: "Manuel Makbuzlar", href: "/admin/makbuzlar/manuel", icon: ReceiptText, badge: "yeni" },
      { label: "Ödeme Kayıtları", href: "/admin/odeme-kayitlari", icon: CreditCard, badge: "demo" },
      { label: "Bildirim Kuyruğu", href: "/admin/bildirim-kuyrugu", icon: BellRing, badge: "demo" },
      { label: "Bağışçı Listesi", href: "/admin/bagisci-listesi", icon: UsersRound, badge: "demo" }
    ]
  },
  {
    title: "KURBAN ÇALIŞMALARI",
    items: [
      { label: "Genel Bakış", href: "/admin/kurban", icon: LayoutDashboard },
      { label: "Kampanyalar", href: "/admin/kurban/kampanyalar", icon: BarChart3, badge: "demo" },
      { label: "Kurban Bağışları", href: "/admin/kurban/bagislar", icon: HeartHandshake, badge: "demo" },
      { label: "Vekaletler", href: "/admin/kurban/vekaletler", icon: CheckSquare, badge: "demo" },
      { label: "Kesim Takibi", href: "/admin/kurban/kesim-takibi", icon: Route, badge: "demo" },
      { label: "Dağıtımlar", href: "/admin/kurban/dagitimlar", icon: TableProperties, badge: "demo" },
      { label: "Bildirimler", href: "/admin/kurban/bildirimler", icon: BellRing, badge: "demo" },
      { label: "Raporlar", href: "/admin/kurban/raporlar", icon: FileText, badge: "demo" },
      { label: "Export", href: "/admin/kurban/export", icon: FileText, badge: "demo" }
    ]
  },
  {
    title: "YETİM ÇALIŞMALARI",
    items: [
      { label: "Genel Bakış", href: "/admin/yetim-hamiligi", icon: LayoutDashboard, badge: "demo" },
      { label: "Yetim Profilleri", href: "/admin/yetim-hamiligi/yetimler", icon: ShieldCheck, badge: "demo" },
      { label: "Sponsorluklar", href: "/admin/yetim-hamiligi/sponsorluklar", icon: HeartHandshake, badge: "demo" },
      { label: "Başvurular", href: "/admin/yetim-hamiligi/basvurular", icon: ClipboardCheck, badge: "demo" },
      { label: "Raporlar", href: "/admin/yetim-hamiligi/raporlar", icon: FileText, badge: "demo" },
      { label: "Güncellemeler", href: "/admin/yetim-hamiligi/guncellemeler", icon: BellRing, badge: "demo" },
      { label: "Görevler", href: "/admin/yetim-hamiligi/gorevler", icon: CheckSquare, badge: "demo" },
      { label: "Bildirimler", href: "/admin/yetim-hamiligi/bildirimler", icon: Mail, badge: "demo" },
      { label: "Export", href: "/admin/yetim-hamiligi/export", icon: FileText, badge: "demo" }
    ]
  },
  {
    title: "PROJE VE İÇERİK",
    items: [
      { label: "Projeler", href: "/admin/projeler", icon: BarChart3 },
      { label: "Proje Bölgeleri", href: "/admin/proje-bolgeleri", icon: MapPinned, badge: "yeni" },
      { label: "Haberler", href: "/admin/haberler", icon: Newspaper },
      { label: "Faaliyet Raporları", href: "/admin/faaliyet-raporlari", icon: FileText }
    ]
  },
  {
    title: "İLETİŞİM VE GÖNÜLLÜLÜK",
    items: [
      { label: "Mesajlar", href: "/admin/mesajlar", icon: MessageSquare },
      { label: "Personel", href: "/admin/personel", icon: UserCog },
      { label: "Gönüllü Başvuruları", href: "/admin/gonullu-basvurular", icon: UsersRound },
      { label: "Gönüllü Havuzu", href: "/admin/gonullu-havuzu", icon: UserCog, badge: "demo" },
      { label: "İletişim Mesajları", href: "/admin/iletisim-mesajlari", icon: Mail }
    ]
  },
  {
    title: "AYARLAR",
    items: [
      { label: "Kullanıcılar", href: "/admin/kullanicilar", icon: UsersRound },
      { label: "Roller/Yetkiler", href: "/admin/yetkiler", icon: ShieldCheck },
      { label: "Site Ayarları", href: "/admin/ayarlar", icon: Settings }
    ]
  }
];

function isAdminItemActive(pathname: string, href: string) {
  return pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`));
}

function isAdminGroupActive(pathname: string, group: AdminNavGroup) {
  return group.items.some((item) => isAdminItemActive(pathname, item.href));
}

function CollapsibleSidebarGroup({ group, pathname }: { group: AdminNavGroup; pathname: string }) {
  const activeGroup = isAdminGroupActive(pathname, group);
  const [userOpen, setUserOpen] = useState(false);
  const open = activeGroup || userOpen;

  return (
    <section className="rounded-lg border border-white/8 bg-white/[0.035]">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setUserOpen((value) => !value)}
        className={cn(
          "focus-ring flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left transition",
          activeGroup ? "bg-white/8 text-white" : "text-white/66 hover:bg-white/6 hover:text-white"
        )}
      >
        <span className="min-w-0 truncate text-[0.62rem] font-extrabold uppercase tracking-[0.12em]">{group.title}</span>
        <ChevronDown aria-hidden className={cn("h-3.5 w-3.5 shrink-0 transition", open && "rotate-180")} />
      </button>

      {open ? (
        <div className="grid gap-1 px-1.5 pb-2 pt-1">
          {group.items.map(({ label, href, icon: Icon, badge }) => {
            const active = isAdminItemActive(pathname, href);
            return (
              <Link
                key={`${group.title}-${label}`}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "focus-ring relative flex min-h-[34px] items-center gap-2 rounded-md px-2 py-1.5 text-[0.74rem] font-bold leading-4 transition",
                  active
                    ? "bg-white/12 text-white before:absolute before:left-0 before:top-1 before:h-[calc(100%-0.5rem)] before:w-0.5 before:rounded-full before:bg-ocean-green"
                    : "text-white/72 hover:bg-white/8 hover:text-white"
                )}
              >
                <Icon aria-hidden className={cn("h-3.5 w-3.5 shrink-0", active ? "text-ocean-green" : "text-white/52")} />
                <span className="min-w-0 flex-1 truncate">{label}</span>
                {badge ? (
                  <span className={cn("ml-auto rounded px-1 py-0.5 text-[0.52rem] uppercase", active ? "bg-ocean-green text-white" : "bg-white/10 text-white/58")}>
                    {badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-b border-deep-blue/80 bg-deep-blue text-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-[14rem] lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col">
        <div className="border-b border-white/10 px-3 py-3">
          <OfficialLogo variant="white" context="sidebar" className="-ml-2" />
          <p className="mt-1 border-l-2 border-ocean-green/80 pl-2 text-[0.62rem] font-semibold leading-4 text-white/62">
            Demo panel · veri kaydı yoktur
          </p>
        </div>
        <nav aria-label="Admin menüsü" className="grid gap-2 overflow-x-hidden px-2 py-3 lg:flex-1 lg:overflow-y-auto">
          {navGroups.map((group) => (
            <CollapsibleSidebarGroup key={group.title} group={group} pathname={pathname} />
          ))}
        </nav>
        <div className="border-t border-white/10 p-3">
          <button type="button" className="focus-ring w-full rounded-md bg-white/8 px-2 py-2 text-left text-[0.68rem] font-extrabold text-white/60 hover:bg-white/12">
            Menüyü daralt · demo
          </button>
        </div>
      </div>
    </aside>
  );
}
