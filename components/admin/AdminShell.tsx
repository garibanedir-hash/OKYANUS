import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-soft-gray">
      <AdminSidebar />
      <div className="lg:pl-72">
        <AdminTopbar />
        <main className="px-5 py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
