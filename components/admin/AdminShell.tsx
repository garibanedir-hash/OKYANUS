"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/admin/giris") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#f4f7f8]">
      <AdminSidebar />
      <div className="lg:pl-[14rem]">
        <AdminTopbar />
        <main className="px-3 py-3 lg:px-4">{children}</main>
      </div>
    </div>
  );
}
