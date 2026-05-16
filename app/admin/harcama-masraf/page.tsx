import { expenseRequests, expenseRows } from "@/data/adminOperationsMock";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminRelatedRecordsModal } from "@/components/admin/AdminRelatedRecordsModal";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";

export default function AdminExpensePage() {
  return (
    <div className="grid gap-5">
      <AdminSectionHeader eyebrow="Finans Operasyon" title="Harcama & Masraf Talepleri" description="Görev, faaliyet ve proje bazlı masraf taleplerinin demo takip ekranı." actionLabel="Yeni Masraf Talebi" />
      <AdminFilterBar showActions>
        <label>Açıklama<input className="focus-ring mt-1 w-full border px-3" placeholder="Harcama ara" /></label>
        <label>Gider türü<select className="focus-ring mt-1 w-full border px-3"><option>Tümü</option><option>Lojistik</option><option>Ulaşım</option></select></label>
        <label>Durum<select className="focus-ring mt-1 w-full border px-3"><option>Tümü</option><option>Onay Bekliyor</option></select></label>
      </AdminFilterBar>
      <AdminTable headers={["Talep ID", "Harcama Açıklaması", "Tür", "Tutar", "Faaliyet", "Durum", "Muhasebe Kodu", "İşlem"]} recordCount={expenseRequests.length}>
        {expenseRequests.map((expense) => (
          <tr key={expense.id}>
            <td className="font-bold text-dark-navy">{expense.id}</td>
            <td>{expense.description}</td>
            <td>{expense.type}</td>
            <td className="font-bold text-dark-navy">{expense.amount}</td>
            <td>{expense.activity}</td>
            <td><AdminStatusBadge status={expense.status} /></td>
            <td>{expense.code}</td>
            <td><AdminRelatedRecordsModal title="Harcama Kayıtları" triggerLabel="Harcama Detayı" headers={["Tarih", "Fon Raporu", "Harcama Açıklaması", "Tür", "Faaliyet", "Kaynak", "Bölge", "Proje", "Tutar", "Stopaj", "Muhasebe Kodu"]} rows={expenseRows} showExpenseFilters /></td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
