"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { OfficialLogo } from "@/components/brand/OfficialLogo";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Ana Sayfa", href: "/" },
  { label: "Hakkımızda", href: "/hakkimizda" },
  { label: "Faaliyetler", href: "/faaliyetler" },
  { label: "Projeler", href: "/projeler" },
  { label: "Gönüllü Ol", href: "/gonullu-ol" },
  { label: "Haberler", href: "/haberler" },
  { label: "İletişim", href: "/iletisim" }
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-transparent bg-warm-white/88 backdrop-blur transition",
        scrolled && "border-slate-200/80 shadow-sm"
      )}
    >
      <Container className="flex h-20 items-center justify-between">
        <OfficialLogo variant="color" context="header" onClick={() => setOpen(false)} />

        <nav aria-label="Ana menü" className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className={cn(
                "focus-ring rounded-full px-1 py-2 text-sm font-semibold transition hover:text-deep-blue",
                pathname === item.href ? "text-deep-blue" : "text-slate-700"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button href="/giris" variant="ghost">Giriş Yap</Button>
          <Button href="/bagis-yap">Bağış Yap</Button>
        </div>

        <button
          type="button"
          aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-deep-blue shadow-card lg:hidden"
        >
          {open ? <X aria-hidden className="h-5 w-5" /> : <Menu aria-hidden className="h-5 w-5" />}
        </button>
      </Container>

      {open ? (
        <div className="border-t border-slate-200 bg-warm-white lg:hidden">
          <Container className="grid gap-2 py-5 shadow-soft">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={pathname === item.href ? "page" : undefined}
                className={cn(
                  "focus-ring rounded-2xl px-4 py-3 text-sm font-semibold transition hover:bg-soft-blue",
                  pathname === item.href ? "bg-soft-blue text-deep-blue" : "text-slate-700"
                )}
              >
                {item.label}
              </Link>
            ))}
            <Button href="/bagis-yap" className="mt-2 w-full" onClick={() => setOpen(false)}>
              Bağış Yap
            </Button>
            <Button href="/giris" variant="ghost" className="w-full" onClick={() => setOpen(false)}>
              Giriş Yap
            </Button>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
