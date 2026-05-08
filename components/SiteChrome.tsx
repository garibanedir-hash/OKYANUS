"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPrivatePanel =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/panel") ||
    pathname.startsWith("/koordinator") ||
    pathname.startsWith("/personel");

  if (isPrivatePanel) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
