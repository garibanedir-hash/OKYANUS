import type { Metadata } from "next";
import { StaffShell } from "@/components/staff/StaffShell";

export const metadata: Metadata = {
  title: "Personel Paneli | Okyanus",
  description: "Okyanus personel paneli."
};

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return <StaffShell>{children}</StaffShell>;
}
