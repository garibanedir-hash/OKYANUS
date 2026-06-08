"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import type { DonationPublicConfig } from "@/lib/donations/donationTarget";

export function SiteChrome({
  children,
  donationConfig
}: {
  children: React.ReactNode;
  donationConfig: DonationPublicConfig;
}) {
  const pathname = usePathname();
  const isPrivatePanel =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/panel") ||
    pathname.startsWith("/koordinator") ||
    pathname.startsWith("/personel") ||
    pathname.startsWith("/tadilat") ||
    pathname === "/giris" ||
    pathname === "/kayit";

  if (isPrivatePanel) {
    return <>{children}</>;
  }

  return (
    <>
      <Header donationConfig={donationConfig} />
      <main>{children}</main>
      <Footer donationConfig={donationConfig} />
    </>
  );
}
