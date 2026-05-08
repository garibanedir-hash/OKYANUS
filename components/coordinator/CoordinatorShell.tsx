import { CoordinatorSidebar } from "@/components/coordinator/CoordinatorSidebar";
import { CoordinatorTopbar } from "@/components/coordinator/CoordinatorTopbar";

export function CoordinatorShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-soft-gray">
      <CoordinatorSidebar />
      <div className="lg:pl-72">
        <CoordinatorTopbar />
        <main className="px-5 py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
