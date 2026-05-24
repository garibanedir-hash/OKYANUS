import { notFound } from "next/navigation";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/Button";
import {
  getAdminOrphanProfiles,
  getAdminSponsorshipApplicationById
} from "@/lib/data/orphanSponsorshipRepository";
import { formatDate } from "@/lib/format";
import { formatSponsorshipMoney, PrivacyNotice, SponsorshipStatusCell } from "@/app/admin/yetim-hamiligi/_components/OrphanAdminShared";
import { approveAndMatchSponsorshipAction, rejectSponsorshipApplicationAction } from "../../actions";

type MatchApplicationPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ durum?: string; mesaj?: string; sponsorluk?: string; odeme?: string; odeme_hata?: string }>;
};

export default async function MatchApplicationPage({ params, searchParams }: MatchApplicationPageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [application, orphans] = await Promise.all([getAdminSponsorshipApplicationById(id), getAdminOrphanProfiles()]);

  if (!application) {
    notFound();
  }

  const eligibleOrphans = orphans.filter((orphan) => ["active", "waiting"].includes(orphan.status));
  const canMatch = ["pending", "reviewing", "approved"].includes(application.status);

  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="Yetim Hamiliği"
        title="Başvuru Eşleştirme"
        description="Başvuru güvenli özetle değerlendirilir; çocuk mahremiyetini aşan kimlik, adres, okul veya aile detayı gösterilmez."
      />

      {query?.durum === "basarili" ? (
        <div className="rounded-lg border border-ocean-green/20 bg-mint-green/45 p-4 text-sm font-bold leading-6 text-dark-navy">
          Eşleştirme tamamlandı. Sponsorluk No: {query.sponsorluk ?? "oluşturuldu"}.
          {query.odeme ? <span className="block">Ödeme No: {query.odeme}</span> : null}
          {query.odeme_hata === "1" ? <span className="block">Ödeme bağlantısı daha sonra yönetim ekranından hazırlanabilir.</span> : null}
        </div>
      ) : null}
      {query?.durum === "reddedildi" ? (
        <div className="rounded-lg border border-warm-accent/25 bg-warm-accent/10 p-4 text-sm font-bold leading-6 text-dark-navy">
          Başvuru reddedildi olarak işaretlendi.
        </div>
      ) : null}
      {query?.durum === "hata" ? (
        <div className="rounded-lg border border-warm-accent/25 bg-warm-accent/10 p-4 text-sm font-bold leading-6 text-dark-navy">
          {query.mesaj ?? "İşlem tamamlanamadı."}
        </div>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-lg border border-border-soft bg-white p-5 shadow-sm">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ocean-green">Başvuru Özeti</p>
          <h2 className="mt-2 text-2xl font-extrabold text-dark-navy">{application.applicationNo}</h2>
          <div className="mt-4 grid gap-3 text-sm font-semibold leading-6 text-ink-muted md:grid-cols-2">
            <p>Başvuran: <span className="text-dark-navy">{application.applicantDisplayName}</span></p>
            <p>E-posta: <span className="text-dark-navy">{application.applicantEmailMasked}</span></p>
            <p>Telefon: <span className="text-dark-navy">{application.applicantPhoneMasked}</span></p>
            <p>Şehir: <span className="text-dark-navy">{application.applicantCity}</span></p>
            <p>Program: <span className="text-dark-navy">{application.programTitle}</span></p>
            <p>Tutar: <span className="text-dark-navy">{formatSponsorshipMoney(application.requestedAmount, application.currency)}</span></p>
            <p>Periyot: <span className="text-dark-navy">{application.supportPeriodLabel}</span></p>
            <p>Tarih: <span className="text-dark-navy">{formatDate(application.createdAt)}</span></p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <SponsorshipStatusCell status={application.statusLabel} />
            <SponsorshipStatusCell status={application.kvkkAccepted ? "KVKK alındı" : "KVKK eksik"} />
            <SponsorshipStatusCell status={application.contactPermission ? "İletişim izni var" : "İletişim izni yok"} />
          </div>
        </div>
        <PrivacyNotice />
      </section>

      <form action={approveAndMatchSponsorshipAction} className="grid gap-4">
        <input type="hidden" name="applicationId" value={application.id} />
        <div className="rounded-lg border border-border-soft bg-white p-4 shadow-sm">
          <label className="text-sm font-bold text-dark-navy">
            Eşleştirme notu
            <textarea name="note" rows={3} maxLength={500} className="focus-ring mt-2 w-full rounded-lg border border-border-soft px-3 py-2" placeholder="Mahremiyet sınırlarını aşmayan iç değerlendirme notu" />
          </label>
        </div>
        <AdminTable
          headers={["Seç", "Kod", "Güvenli ad", "Yaş grubu", "Ülke/bölge", "Eğitim", "Destek ihtiyacı", "Durum"]}
          recordCount={eligibleOrphans.length}
          empty={!eligibleOrphans.length}
        >
          {eligibleOrphans.map((orphan, index) => (
            <tr key={orphan.id}>
              <td>
                <input name="orphanId" type="radio" value={orphan.id} required defaultChecked={index === 0} disabled={!canMatch} className="h-4 w-4 accent-ocean-green" />
              </td>
              <td className="font-bold text-dark-navy">{orphan.code}</td>
              <td>{orphan.safeName}</td>
              <td>{orphan.ageGroup}</td>
              <td>{orphan.country}<span className="block text-xs text-ink-muted">{orphan.cityOrRegion}</span></td>
              <td>{orphan.educationStatus}</td>
              <td>{formatSponsorshipMoney(orphan.sponsorshipNeedAmount, orphan.currency)}</td>
              <td><SponsorshipStatusCell status={orphan.statusLabel} /></td>
            </tr>
          ))}
        </AdminTable>
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={!canMatch || !eligibleOrphans.length}
            className="focus-ring inline-flex min-h-10 items-center rounded-md bg-deep-blue px-4 text-sm font-extrabold text-white transition hover:bg-dark-navy disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Eşleştir ve Sponsorluk Oluştur
          </button>
          <Button href="/admin/yetim-hamiligi/basvurular" variant="secondary">
            Listeye Dön
          </Button>
        </div>
      </form>

      {canMatch ? (
        <form action={rejectSponsorshipApplicationAction} className="rounded-lg border border-warm-accent/25 bg-white p-4 shadow-sm">
          <input type="hidden" name="applicationId" value={application.id} />
          <label className="text-sm font-bold text-dark-navy">
            Red notu
            <textarea name="rejectNote" rows={2} maxLength={400} className="focus-ring mt-2 w-full rounded-lg border border-border-soft px-3 py-2" placeholder="Kurum içi kısa değerlendirme notu" />
          </label>
          <button type="submit" className="focus-ring mt-3 inline-flex min-h-9 items-center rounded-md bg-warm-accent/15 px-3 text-xs font-extrabold text-dark-navy ring-1 ring-warm-accent/25">
            Başvuruyu Reddet
          </button>
        </form>
      ) : null}
    </div>
  );
}
