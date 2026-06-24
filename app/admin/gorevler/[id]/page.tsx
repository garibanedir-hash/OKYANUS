import Link from "next/link";
import { Printer } from "lucide-react";
import { assignmentDetail, expenseRows, relatedRecordGroups } from "@/data/adminOperationsMock";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminRelatedRecordsModal } from "@/components/admin/AdminRelatedRecordsModal";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border-soft bg-white px-3 py-2">
      <p className="text-[0.66rem] font-extrabold uppercase tracking-[0.08em] text-ink-muted">{label}</p>
      <p className="mt-1 text-sm font-bold text-dark-navy">{value}</p>
    </div>
  );
}

type AdminTaskDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminTaskDetailPage({ params }: AdminTaskDetailPageProps) {
  const { id } = await params;
  const detail = assignmentDetail;

  if (!relatedRecordGroups.length) {
    return (
      <div className="grid gap-4">
        <div className="rounded-lg border border-border-soft bg-white px-4 py-3 shadow-sm">
          <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-ocean-green">Görev Detayı</p>
          <h1 className="text-2xl font-black text-dark-navy">Görev ID #{id}</h1>
        </div>
        <section className="rounded-lg border border-dashed border-border-soft bg-white p-6 text-sm font-semibold leading-6 text-ink-muted shadow-sm">
          Henüz görev detayı bulunmuyor. Gerçek kayıtlar oluşturulduğunda bu alanda görüntülenecektir.
        </section>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border-soft bg-white px-4 py-3 shadow-sm">
        <div>
          <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-ocean-green">Görev Detayı</p>
          <h1 className="text-2xl font-black text-dark-navy">Görev ID #{id}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <AdminActionButton variant="primary">Kaydet</AdminActionButton>
          <AdminActionButton>Yazdır</AdminActionButton>
          <Link className="focus-ring inline-flex min-h-8 items-center gap-1.5 rounded-md border border-border-soft bg-white px-2.5 py-1 text-[0.72rem] font-extrabold text-deep-blue" href="/admin/gorevler">
            <Printer aria-hidden className="h-3.5 w-3.5" />
            Geri Dön
          </Link>
        </div>
      </div>

      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-4">
          <div className="rounded-lg border border-border-soft bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3 border-b border-border-soft pb-3">
              <h2 className="font-extrabold text-dark-navy">{detail.subject}</h2>
              <AdminStatusBadge status={detail.stage} />
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <InfoField label="Birim" value={detail.unit} />
              <InfoField label="Görev Bölgesi" value={detail.region} />
              <InfoField label="Başlama zamanı" value={detail.startAt} />
              <InfoField label="Bitiş zamanı" value={detail.endAt} />
              <InfoField label="Fon faaliyeti" value={detail.fundActivity} />
              <InfoField label="Fon bölgesi" value={detail.fundRegion} />
              <InfoField label="Sorumlu" value={detail.responsible} />
              <InfoField label="Form imzacıları" value={detail.signers} />
              <InfoField label="Ulaşım araçları" value={detail.transport} />
            </div>
            <div className="mt-3 rounded-md border border-border-soft bg-soft-gray p-3">
              <p className="text-[0.66rem] font-extrabold uppercase tracking-[0.08em] text-ink-muted">Görev açıklaması</p>
              <p className="mt-2 text-sm leading-6 text-ink-muted">{detail.description}</p>
            </div>
          </div>

          <div className="rounded-lg border border-border-soft bg-white p-4 shadow-sm">
            <h2 className="mb-3 border-b border-border-soft pb-3 font-extrabold text-dark-navy">Finansal Özet</h2>
            <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
              {Object.entries(detail.finance).map(([key, value]) => (
                <InfoField key={key} label={key.replace(/([A-Z])/g, " $1")} value={value} />
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border-soft bg-white p-4 shadow-sm">
            <h2 className="font-extrabold text-dark-navy">Görev Raporu ve Notlar</h2>
            <textarea className="focus-ring mt-3 min-h-28 w-full rounded-md border border-border-soft p-3 text-sm" defaultValue="Gerçek görev notları bağlantılı kayıt panelinden izlenebilir." />
          </div>
        </div>

        <aside className="rounded-lg border border-border-soft bg-white p-4 shadow-sm">
          <h2 className="border-b border-border-soft pb-3 font-extrabold text-dark-navy">Bağlantılı Kayıtlar</h2>
          <div className="mt-3 grid gap-2">
            {relatedRecordGroups.map((group) => (
              <AdminRelatedRecordsModal
                key={group.label}
                title={group.label}
                triggerLabel={`${group.label} (${group.count})`}
                headers={["Tarih", "Fon Raporu", "Harcama Açıklaması", "Tür", "Faaliyet", "Kaynak", "Bölge", "Proje", "Tutar", "Stopaj", "Muhasebe Kodu"]}
                rows={expenseRows}
                showExpenseFilters={group.label === "Harcamalar"}
              />
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}
