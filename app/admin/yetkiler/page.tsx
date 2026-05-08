import { getPermissions, getRolePermissionMatrix, getRoles } from "@/lib/data/accessRepository";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminPanelNotice } from "@/components/admin/AdminPanelNotice";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";

export default function AdminPermissionsPage() {
  const roles = getRoles();
  const permissions = getPermissions();
  const matrix = getRolePermissionMatrix();

  return (
    <div className="grid gap-6">
      <AdminSectionHeader eyebrow="RBAC" title="Rol ve Yetki Yönetimi" description="Rol bazlı görünürlük, panel erişimi ve işlem yetkileri için demo matris." actionLabel="Rol Oluştur" />
      <AdminPanelNotice title="Güvenlik uyarısı">Yetki değişiklikleri production ortamında server-side doğrulanmalı ve audit log’a kaydedilmelidir.</AdminPanelNotice>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {roles.map((role) => <article key={role.id} className="rounded-brand border border-border-soft bg-white p-5 shadow-card"><h2 className="font-bold text-dark-navy">{role.title}</h2><p className="mt-2 text-sm text-ink-muted">{role.scope}</p></article>)}
      </section>
      <div className="overflow-x-auto rounded-brand border border-border-soft bg-white shadow-card">
        <table className="min-w-[980px] w-full text-left text-sm">
          <thead className="bg-soft-blue text-dark-navy">
            <tr>
              <th className="px-4 py-3">Rol</th>
              {permissions.slice(0, 8).map((permission) => <th key={permission.module} className="px-4 py-3">{permission.module}</th>)}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row) => (
              <tr key={row.role} className="border-t border-border-soft">
                <td className="px-4 py-3 font-bold text-dark-navy">{row.role}</td>
                {row.permissions.slice(0, 8).map((permission) => (
                  <td key={`${row.role}-${permission.module}`} className="px-4 py-3 text-ink-muted">
                    {permission.allowedActions.length ? permission.allowedActions.map((action) => <label key={action} className="mb-1 flex items-center gap-2"><input type="checkbox" defaultChecked />{action}</label>) : "Yok"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AdminActionButton variant="primary">Değişiklikleri Kaydet</AdminActionButton>
    </div>
  );
}
