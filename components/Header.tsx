"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { OfficialLogo } from "@/components/brand/OfficialLogo";
import { cn } from "@/lib/utils";
import { resolveDonationTarget } from "@/lib/donations/donationTarget";
import type { DonationPublicConfig } from "@/lib/donations/donationTarget";

type HeaderNavLink = {
  label: string;
  href: string;
};

type HeaderNavGroup = {
  id: "corporate" | "works";
  label: string;
  items: HeaderNavLink[];
};

const navGroups: HeaderNavGroup[] = [
  {
    id: "corporate",
    label: "Kurumsal",
    items: [
      { label: "Biz Kimiz", href: "/hakkimizda#biz-kimiz" },
      { label: "Hakkımızda", href: "/hakkimizda" },
      { label: "Tüzük", href: "/hukuki/kullanim-sartlari" },
      { label: "SSS", href: "/iletisim" },
      { label: "İletişim", href: "/iletisim" }
    ]
  },
  {
    id: "works",
    label: "Çalışmalarımız",
    items: [
      { label: "Faaliyetlerimiz", href: "/faaliyetler" },
      { label: "Projeler", href: "/projeler" },
      { label: "Yetim", href: "/yetim-hamiligi" },
      { label: "Kurban", href: "/kurban" }
    ]
  }
];

const directNavItems: HeaderNavLink[] = [
  { label: "Gönüllü Ol", href: "/gonullu-ol" },
  { label: "Haberler", href: "/haberler" }
];

function isActivePath(pathname: string, href: string) {
  const path = href.split("#")[0] || href;
  return pathname === path || (path !== "/" && pathname.startsWith(`${path}/`));
}

function isGroupActive(pathname: string, group: HeaderNavGroup) {
  return group.items.some((item) => isActivePath(pathname, item.href));
}

function DesktopDropdown({ group, active }: { group: HeaderNavGroup; active: boolean }) {
  const pathname = usePathname();

  return (
    <div className="group relative">
      <button
        type="button"
        aria-haspopup="true"
        className={cn(
          "focus-ring inline-flex h-10 items-center gap-1 rounded-full px-3 text-sm font-semibold transition",
          active ? "bg-soft-blue text-deep-blue" : "text-slate-700 hover:bg-soft-blue/70 hover:text-deep-blue"
        )}
      >
        <span className="whitespace-nowrap">{group.label}</span>
        <ChevronDown
          aria-hidden
          className="h-4 w-4 transition group-hover:rotate-180 group-focus-within:rotate-180"
        />
      </button>
      <div className="invisible absolute left-0 top-full z-50 w-60 translate-y-1 pt-3 opacity-0 transition duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
        <div className="rounded-2xl border border-border-soft bg-warm-white p-2 shadow-soft">
          {group.items.map((item) => {
            const itemActive = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={itemActive ? "page" : undefined}
                className={cn(
                  "focus-ring block rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                  itemActive ? "bg-soft-blue text-deep-blue" : "text-slate-700 hover:bg-mint-green/55 hover:text-deep-blue"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MobileNavGroup({
  group,
  open,
  active,
  onToggle,
  onNavigate
}: {
  group: HeaderNavGroup;
  open: boolean;
  active: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="rounded-2xl border border-border-soft bg-white/72">
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className={cn(
          "focus-ring flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left text-sm font-extrabold transition",
          active ? "text-deep-blue" : "text-slate-700 hover:bg-soft-blue"
        )}
      >
        <span>{group.label}</span>
        <ChevronDown aria-hidden className={cn("h-4 w-4 transition", open && "rotate-180")} />
      </button>
      {open ? (
        <div className="grid gap-1 px-2 pb-2">
          {group.items.map((item) => {
            const itemActive = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={itemActive ? "page" : undefined}
                className={cn(
                  "focus-ring rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                  itemActive ? "bg-soft-blue text-deep-blue" : "text-slate-700 hover:bg-mint-green/55"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function Header({ donationConfig }: { donationConfig: DonationPublicConfig }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openMobileGroups, setOpenMobileGroups] = useState<HeaderNavGroup["id"][]>([]);
  const pathname = usePathname();
  const donationTarget = resolveDonationTarget(donationConfig, { source: "general" }, "/bagis-yap");
  const donationLinkProps = {
    href: donationTarget.href,
    target: donationTarget.isExternal ? "_blank" : undefined,
    rel: donationTarget.isExternal ? "noopener noreferrer" : undefined
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function toggleMobileGroup(groupId: HeaderNavGroup["id"]) {
    setOpenMobileGroups((current) =>
      current.includes(groupId) ? current.filter((item) => item !== groupId) : [...current, groupId]
    );
  }

  function isMobileGroupOpen(group: HeaderNavGroup) {
    return openMobileGroups.includes(group.id) || isGroupActive(pathname, group);
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-transparent bg-warm-white/88 backdrop-blur transition",
        scrolled && "border-slate-200/80 shadow-sm"
      )}
    >
      <Container className="flex h-24 items-center justify-between gap-4">
        <OfficialLogo variant="color" context="header" onClick={() => setOpen(false)} />

        <nav aria-label="Ana menü" className="hidden min-w-0 items-center gap-2 lg:flex">
          {navGroups.map((group) => (
            <DesktopDropdown key={group.id} group={group} active={isGroupActive(pathname, group)} />
          ))}
          {directNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActivePath(pathname, item.href) ? "page" : undefined}
              className={cn(
                "focus-ring whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold transition",
                isActivePath(pathname, item.href)
                  ? "bg-soft-blue text-deep-blue"
                  : "text-slate-700 hover:bg-soft-blue/70 hover:text-deep-blue"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <Button href="/giris" variant="ghost" className="h-11 min-w-[6.25rem] whitespace-nowrap px-4">
            Giriş Yap
          </Button>
          <Button {...donationLinkProps} className="h-11 min-w-[6.25rem] whitespace-nowrap px-4">
            Bağış Yap
          </Button>
        </div>

        <button
          type="button"
          aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="focus-ring inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-deep-blue shadow-card lg:hidden"
        >
          {open ? <X aria-hidden className="h-5 w-5" /> : <Menu aria-hidden className="h-5 w-5" />}
        </button>
      </Container>

      {open ? (
        <div className="border-t border-slate-200 bg-warm-white lg:hidden">
          <Container className="grid gap-2 py-5 shadow-soft">
            {navGroups.map((group) => (
              <MobileNavGroup
                key={group.id}
                group={group}
                open={isMobileGroupOpen(group)}
                active={isGroupActive(pathname, group)}
                onToggle={() => toggleMobileGroup(group.id)}
                onNavigate={() => setOpen(false)}
              />
            ))}
            {directNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={isActivePath(pathname, item.href) ? "page" : undefined}
                className={cn(
                  "focus-ring rounded-2xl px-4 py-3 text-sm font-semibold transition hover:bg-soft-blue",
                  isActivePath(pathname, item.href) ? "bg-soft-blue text-deep-blue" : "text-slate-700"
                )}
              >
                {item.label}
              </Link>
            ))}
            <Button href="/giris" variant="ghost" className="mt-2 w-full whitespace-nowrap" onClick={() => setOpen(false)}>
              Giriş Yap
            </Button>
            <Button {...donationLinkProps} className="w-full whitespace-nowrap" onClick={() => setOpen(false)}>
              Bağış Yap
            </Button>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
