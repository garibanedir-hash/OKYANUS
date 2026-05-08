import type { Metadata } from "next";
import { PortalShell } from "@/components/portal/PortalShell";

export const metadata: Metadata = {
  title: "Kullanıcı Paneli | Okyanus",
  description: "Okyanus bağışçı ve gönüllü demo kullanıcı paneli."
};

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return <PortalShell>{children}</PortalShell>;
}
