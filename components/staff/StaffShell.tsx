import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffTopbar } from "@/components/staff/StaffTopbar";

export function StaffShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f4f7f8]">
      <StaffSidebar />
      <div className="lg:pl-[18rem]">
        <StaffTopbar />
        <main className="px-4 py-5 lg:px-6">{children}</main>
      </div>
    </div>
  );
}
