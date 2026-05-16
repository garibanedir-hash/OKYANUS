import { PortalSidebar } from "@/components/portal/PortalSidebar";
import { PortalTopbar } from "@/components/portal/PortalTopbar";

export function PortalShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f4f7f8]">
      <PortalSidebar />
      <div className="lg:pl-[18rem]">
        <PortalTopbar />
        <main className="px-4 py-5 lg:px-6">{children}</main>
      </div>
    </div>
  );
}
