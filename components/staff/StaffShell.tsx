import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffTopbar } from "@/components/staff/StaffTopbar";

export function StaffShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-soft-gray">
      <StaffSidebar />
      <div className="lg:pl-72">
        <StaffTopbar />
        <main className="px-5 py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
