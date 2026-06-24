import { sanitizeAdminUiNode, sanitizeAdminUiText } from "@/components/admin/adminUiText";

export function AdminPanelNotice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-primary-blue/20 bg-soft-blue p-4 text-deep-blue shadow-sm">
      <p className="font-extrabold">{sanitizeAdminUiText(title)}</p>
      <div className="mt-1 text-sm font-semibold leading-6">{sanitizeAdminUiNode(children)}</div>
    </div>
  );
}
