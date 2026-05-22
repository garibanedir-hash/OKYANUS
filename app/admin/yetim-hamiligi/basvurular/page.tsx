import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { getActiveSponsorshipPrograms, getAdminSponsorshipApplications } from "@/lib/data/orphanSponsorshipRepository";
import { formatDate } from "@/lib/format";
import { formatSponsorshipMoney, SponsorshipStatusCell } from "@/app/admin/yetim-hamiligi/_components/OrphanAdminShared";

type AdminSponsorshipApplicationsPageProps = {
  searchParams?: Promise<{ status?: string; program?: string; city?: string; date?: string; q?: string }>;
};

export default async function AdminSponsorshipApplicationsPage({ searchParams }: AdminSponsorshipApplicationsPageProps) {
  const params = await searchParams;
  const [applications, programs] = await Promise.all([getAdminSponsorshipApplications(), getActiveSponsorshipPrograms()]);
  const filteredApplications = applications.filter((item) => {
    const statusMatch = !params?.status || params.status === "all" || item.status === params.status;
    const programMatch = !params?.program || params.program === "all" || item.programId === params.program;
    const cityMatch = !params?.city || item.applicantCity.toLowerCase().includes(params.city.toLowerCase());
    const dateMatch = !params?.date || item.createdAt.startsWith(params.date);
    const queryMatch =
      !params?.q ||
      item.applicationNo.toLowerCase().includes(params.q.toLowerCase()) ||
      item.applicantDisplayName.toLowerCase().includes(params.q.toLowerCase());

    return statusMatch && programMatch && cityMatch && dateMatch && queryMatch;
  });

  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="Yetim Hamiliği"
        title="Başvurular"
        description="Yetim hamiliği başvuruları maskeli kişisel veriyle listelenir. Supabase erişimi veya yetki yoksa ekran güvenli demo fallback ile çalışır."
      />
      <form>
        <AdminFilterBar>
          <label>Başvuru No<input name="q" defaultValue={params?.q ?? ""} placeholder="YHB-..." /></label>
          <label>Program<select name="program" defaultValue={params?.program ?? "all"}><option value="all">Tümü</option>{programs.map((program) => <option key={program.id} value={program.id}>{program.title}</option>)}</select></label>
          <label>Durum<select name="status" defaultValue={params?.status ?? "all"}><option value="all">Tümü</option><option value="pending">Başvuru alındı</option><option value="reviewing">İncelemede</option><option value="approved">Onaylandı</option><option value="matched">Eşleştirildi</option><option value="rejected">Reddedildi</option></select></label>
          <label>Şehir<input name="city" defaultValue={params?.city ?? ""} placeholder="Şehir" /></label>
          <label>Tarih<input name="date" type="date" defaultValue={params?.date ?? ""} /></label>
          <div className="flex items-end gap-2">
            <button type="submit" className="focus-ring inline-flex h-8 items-center rounded-md bg-ocean-green px-3 text-xs font-extrabold text-white">Filtrele</button>
            <a href="/admin/yetim-hamiligi/basvurular" className="focus-ring inline-flex h-8 items-center rounded-md border border-border-soft bg-white px-3 text-xs font-extrabold text-deep-blue">Temizle</a>
          </div>
        </AdminFilterBar>
      </form>
      <AdminTable headers={["Başvuru No", "Başvuran maskeli", "Program", "Tutar", "Durum", "KVKK", "Tarih", "İşlem"]} recordCount={filteredApplications.length} empty={!filteredApplications.length}>
        {filteredApplications.map((item) => (
          <tr key={item.id}>
            <td className="font-bold text-dark-navy">{item.applicationNo}</td>
            <td>{item.applicantDisplayName}<span className="block text-xs text-ink-muted">{item.applicantEmailMasked}</span><span className="block text-xs text-ink-muted">{item.applicantPhoneMasked}</span></td>
            <td>{item.programTitle}</td>
            <td>{formatSponsorshipMoney(item.requestedAmount, item.currency)}<span className="block text-xs text-ink-muted">{item.supportPeriodLabel}</span></td>
            <td><SponsorshipStatusCell status={item.statusLabel} /></td>
            <td><SponsorshipStatusCell status={item.kvkkAccepted ? "KVKK alındı" : "KVKK eksik"} /></td>
            <td>{formatDate(item.createdAt)}<span className="block text-xs text-ink-muted">{item.applicantCity}</span></td>
            <td><AdminActionButton href={`/admin/yetim-hamiligi/basvurular/${item.id}/eslestir`}>Eşleştir</AdminActionButton></td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
