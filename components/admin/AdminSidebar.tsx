"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BellRing,
  CheckSquare,
  CreditCard,
  FileText,
  HeartHandshake,
  Image,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Newspaper,
  ReceiptText,
  Settings,
  ShieldCheck,
  UserCog,
  UsersRound
} from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    title: "Genel",
    items: [{ label: "Genel Bakış", href: "/admin", icon: LayoutDashboard }]
  },
  {
    title: "Bağış ve Destek",
    items: [
      { label: "Bağışlar", href: "/admin/bagislar", icon: HeartHandshake },
      { label: "Makbuzlar", href: "/admin/makbuzlar", icon: ReceiptText, badge: "demo" },
      { label: "Kampanyalar", href: "/admin/projeler", icon: BarChart3 },
      { label: "Ödeme Kayıtları", href: "/admin/odeme-kayitlari", icon: CreditCard, badge: "demo" },
      { label: "Bağışçı Listesi", href: "/admin/bagisci-listesi", icon: UsersRound, badge: "demo" }
    ]
  },
  {
    title: "İçerik Yönetimi",
    items: [
      { label: "Projeler", href: "/admin/projeler", icon: BarChart3 },
      { label: "Haberler", href: "/admin/haberler", icon: Newspaper },
      { label: "Faaliyet Raporları", href: "/admin/faaliyet-raporlari", icon: FileText },
      { label: "Faaliyet Alanları", href: "/admin/projeler", icon: ShieldCheck, badge: "demo" },
      { label: "Şeffaflık İçeriği", href: "/admin/faaliyet-raporlari", icon: BellRing, badge: "demo" },
      { label: "Yasal Sayfalar", href: "/admin/ayarlar", icon: FileText }
    ]
  },
  {
    title: "İnsan Kaynağı / Gönüllülük",
    items: [
      { label: "Görevler", href: "/admin/gorevler", icon: CheckSquare },
      { label: "Mesajlar", href: "/admin/mesajlar", icon: MessageSquare },
      { label: "Personel", href: "/admin/personel", icon: UserCog },
      { label: "Gönüllü Başvuruları", href: "/admin/gonullu-basvurular", icon: UsersRound },
      { label: "Gönüllü Havuzu", href: "/admin/gonullu-havuzu", icon: UserCog, badge: "demo" },
      { label: "İletişim Mesajları", href: "/admin/iletisim-mesajlari", icon: Mail }
    ]
  },
  {
    title: "Sistem",
    items: [
      { label: "Ayarlar", href: "/admin/ayarlar", icon: Settings },
      { label: "Kullanıcılar", href: "/admin/kullanicilar", icon: UsersRound },
      { label: "Yetkiler", href: "/admin/yetkiler", icon: ShieldCheck },
      { label: "Medya Dosyaları", href: "/admin/ayarlar", icon: Image, badge: "demo" },
      { label: "Audit Log", href: "/admin/ayarlar", icon: ShieldCheck, badge: "demo" },
      { label: "Admin Kullanıcıları", href: "/admin/ayarlar", icon: UserCog, badge: "demo" }
    ]
  }
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-b border-border-soft bg-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-72 lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col">
        <div className="border-b border-border-soft p-5">
          <BrandMark compact />
          <p className="mt-4 rounded-2xl bg-soft-blue p-3 text-xs font-bold leading-5 text-deep-blue">
            Demo/Admin Preview: Gerçek kimlik doğrulama ve veri kaydı yoktur.
          </p>
        </div>
        <nav aria-label="Admin menüsü" className="flex gap-4 overflow-x-auto p-4 lg:flex-1 lg:flex-col lg:overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.title} className="shrink-0 lg:shrink">
              <p className="mb-2 px-2 text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-ink-muted">{group.title}</p>
              <div className="flex gap-2 lg:flex-col">
                {group.items.map(({ label, href, icon: Icon, badge }) => {
                  const active = pathname === href;
                  return (
                    <Link
                      key={`${group.title}-${label}`}
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "focus-ring flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition",
                        active ? "bg-deep-blue text-white shadow-card" : "text-ink-muted hover:bg-soft-blue hover:text-deep-blue"
                      )}
                    >
                      <Icon aria-hidden className="h-5 w-5" />
                      <span>{label}</span>
                      {badge ? <span className="ml-auto rounded-full bg-mint-green px-2 py-0.5 text-[0.65rem] uppercase text-ocean-green">{badge}</span> : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
