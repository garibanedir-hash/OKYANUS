import type { Metadata } from "next";
import { CoordinatorShell } from "@/components/coordinator/CoordinatorShell";

export const metadata: Metadata = {
  title: "Koordinatör Paneli | Okyanus",
  description: "Okyanus koordinatör demo paneli."
};

export default function CoordinatorLayout({ children }: { children: React.ReactNode }) {
  return <CoordinatorShell>{children}</CoordinatorShell>;
}
