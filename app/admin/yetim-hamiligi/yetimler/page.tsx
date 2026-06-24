import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { getAdminOrphanProfiles } from "@/lib/data/orphanSponsorshipRepository";
import { formatDate } from "@/lib/format";
import { formatSponsorshipMoney, PrivacyNotice, SponsorshipStatusCell } from "@/app/admin/yetim-hamiligi/_components/OrphanAdminShared";

export default async function AdminOrphanProfilesPage() {
  const profiles = await getAdminOrphanProfiles();

  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="Yetim Hamiliği"
        title="Yetim Profilleri"
        description="Yetim/çocuk kayıtları güvenli ve sınırlı alanlarla read-only listelenir. Açık kimlik ve hassas aile bilgileri gösterilmez."
      />
      <PrivacyNotice />
      <AdminFilterBar>
        <label>Kod<input disabled placeholder="Filtre" /></label>
        <label>Ülke/bölge<input disabled placeholder="Filtre" /></label>
        <label>Durum<select disabled><option>Tümü</option><option>Sponsor bekliyor</option><option>Sponsorlu</option></select></label>
      </AdminFilterBar>
      <AdminTable headers={["Kod", "Güvenli ad", "Yaş grubu", "Ülke/bölge", "Eğitim durumu", "Destek ihtiyacı", "Durum", "Son güncelleme", "İşlem"]} recordCount={profiles.length} empty={!profiles.length}>
        {profiles.map((profile) => (
          <tr key={profile.id}>
            <td className="font-bold text-dark-navy">{profile.code}</td>
            <td>{profile.safeName}</td>
            <td>{profile.ageGroup}</td>
            <td>{profile.country}<span className="block text-xs text-ink-muted">{profile.cityOrRegion}</span></td>
            <td>{profile.educationStatus}</td>
            <td>{formatSponsorshipMoney(profile.sponsorshipNeedAmount, profile.currency)}</td>
            <td><SponsorshipStatusCell status={profile.statusLabel} /></td>
            <td>{formatDate(profile.updatedAt)}</td>
            <td><AdminActionButton>Detay</AdminActionButton></td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
