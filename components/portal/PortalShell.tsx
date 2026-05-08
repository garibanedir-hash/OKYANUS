import { PortalSidebar } from "@/components/portal/PortalSidebar";
import { PortalTopbar } from "@/components/portal/PortalTopbar";

export function PortalShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-soft-gray">
      <PortalSidebar />
      <div className="lg:pl-72">
        <PortalTopbar />
        <main className="px-5 py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
