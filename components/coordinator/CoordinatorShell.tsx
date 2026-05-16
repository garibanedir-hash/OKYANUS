import { CoordinatorSidebar } from "@/components/coordinator/CoordinatorSidebar";
import { CoordinatorTopbar } from "@/components/coordinator/CoordinatorTopbar";

export function CoordinatorShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f4f7f8]">
      <CoordinatorSidebar />
      <div className="lg:pl-[18rem]">
        <CoordinatorTopbar />
        <main className="px-4 py-5 lg:px-6">{children}</main>
      </div>
    </div>
  );
}
