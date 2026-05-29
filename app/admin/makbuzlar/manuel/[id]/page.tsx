import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPanelNotice } from "@/components/admin/AdminPanelNotice";
import { ManualReceiptStatusBadge } from "@/components/admin/manual-receipts/ManualReceiptStatusBadge";
import { getManualReceiptByIdWithSource, getManualReceiptEvents } from "@/lib/data/manualReceiptRepository";
import { formatDate } from "@/lib/format";
import {
  archiveManualReceiptAction,
  cancelManualReceiptAction,
  generateManualReceiptPdfAction,
  markManualReceiptPreparedAction
} from "../actions";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ durum?: string; mesaj?: string }>;
};

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(amount);
}

function Info({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="rounded-md border border-border-soft bg-white px-3 py-2">
      <p className="text-[0.66rem] font-extrabold uppercase tracking-[0.08em] text-ink-muted">{label}</p>
      <p className="mt-1 text-sm font-bold text-dark-navy">{value || "-"}</p>
    </div>
  );
}

function HiddenId({ id }: { id: string }) {
  return <input type="hidden" name="id" value={id} />;
}

function statusMessage(status?: string, message?: string) {
  if (status === "olusturuldu") return "Manuel makbuz oluşturuldu.";
  if (status === "guncellendi") return "Manuel makbuz güncellendi.";
  if (status === "hazirlandi") return "Manuel makbuz hazırlandı.";
  if (status === "pdf-olusturuldu") return "Manuel makbuz PDF dosyası oluşturuldu.";
  if (status === "iptal-edildi") return "Manuel makbuz iptal edildi.";
  if (status === "arsivlendi") return "Manuel makbuz arşivlendi.";
  if (status === "hata") return message ?? "Manuel makbuz işlemi tamamlanamadı.";
  return null;
}

export default async function ManualReceiptDetailPage({ params, searchParams }: PageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const { data: receipt, source } = await getManualReceiptByIdWithSource(id);
  if (!receipt) notFound();
  const events = await getManualReceiptEvents(id);
  const message = statusMessage(query?.durum, query?.mesaj);
  const canMutate = source === "supabase" && !["cancelled", "archived"].includes(receipt.status);

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border-soft bg-white px-4 py-3 shadow-sm">
        <div>
          <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-ocean-green">Manuel Makbuz Detayı</p>
          <h1 className="mt-1 text-2xl font-black text-dark-navy">{receipt.receiptNo}</h1>
          <div className="mt-2">
            <ManualReceiptStatusBadge status={receipt.status} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/makbuzlar/manuel" className="focus-ring rounded-md border border-border-soft px-3 py-2 text-sm font-extrabold text-deep-blue">
            Listeye Dön
          </Link>
          {canMutate ? (
            <Link href={`/admin/makbuzlar/manuel/${id}/duzenle`} className="focus-ring rounded-md border border-border-soft px-3 py-2 text-sm font-extrabold text-deep-blue">
              Düzenle
            </Link>
          ) : null}
          <Link href={`/admin/makbuzlar/manuel/${id}/yazdir`} className="focus-ring rounded-md bg-deep-blue px-3 py-2 text-sm font-extrabold text-white">
            Yazdır
          </Link>
          {receipt.filePath ? (
            <a href={`/api/manual-receipts/${receipt.receiptNo}/download`} className="focus-ring rounded-md bg-ocean-green px-3 py-2 text-sm font-extrabold text-white">
              PDF Görüntüle
            </a>
          ) : null}
        </div>
      </div>

      {message ? <div className="rounded-lg border border-ocean-green/20 bg-mint-green/35 p-4 text-sm font-bold text-dark-navy">{message}</div> : null}
      <div className="w-fit rounded bg-soft-blue px-3 py-1 text-xs font-extrabold text-deep-blue">
        {source === "supabase" ? "Supabase manual_receipts" : "Demo/mock fallback"}
      </div>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid gap-4">
          <div className="rounded-lg border border-border-soft bg-white p-4 shadow-sm">
            <h2 className="mb-3 border-b border-border-soft pb-2 font-black text-dark-navy">Makbuz Bilgileri</h2>
            <div className="grid gap-3 md:grid-cols-3">
              <Info label="Makbuz No" value={receipt.receiptNo} />
              <Info label="Seri / Sıra" value={`${receipt.serialNo ?? "-"} / ${receipt.sequenceNo ?? "-"}`} />
              <Info label="Koçan No" value={receipt.bookletNo} />
              <Info label="Tarih" value={formatDate(receipt.receiptDate)} />
              <Info label="Şube / Birim" value={[receipt.branchName, receipt.unitName].filter(Boolean).join(" / ")} />
              <Info label="Çıktı Türü" value={receipt.outputTypeLabel} />
            </div>
          </div>

          <div className="rounded-lg border border-border-soft bg-white p-4 shadow-sm">
            <h2 className="mb-3 border-b border-border-soft pb-2 font-black text-dark-navy">Bağış ve Bağışçı</h2>
            <div className="grid gap-3 md:grid-cols-3">
              <Info label="Bağışçı" value={receipt.donorName} />
              <Info label="Telefon" value={receipt.donorPhone} />
              <Info label="E-posta" value={receipt.donorEmail} />
              <Info label="Bağış Türü" value={receipt.donationTypeLabel} />
              <Info label="Ödeme Yöntemi" value={receipt.paymentMethodLabel} />
              <Info label="Tutar" value={formatMoney(receipt.amount, receipt.currency)} />
              <Info label="Tutar Yazıyla" value={receipt.amountInWords} />
              <Info label="Kampanya" value={receipt.campaignName} />
              <Info label="Proje" value={receipt.projectName} />
            </div>
            <div className="mt-3 rounded-md border border-border-soft bg-soft-gray p-3">
              <p className="text-[0.66rem] font-extrabold uppercase tracking-[0.08em] text-ink-muted">Amaç / Açıklama</p>
              <p className="mt-2 text-sm leading-6 text-ink-muted">{receipt.purpose || receipt.description || "-"}</p>
            </div>
          </div>

          <div className="rounded-lg border border-border-soft bg-white p-4 shadow-sm">
            <h2 className="mb-3 border-b border-border-soft pb-2 font-black text-dark-navy">Durum Geçmişi</h2>
            <div className="grid gap-2">
              {events.length ? (
                events.map((event) => (
                  <div key={event.id} className="rounded-md border border-border-soft px-3 py-2 text-sm">
                    <p className="font-bold text-dark-navy">{event.eventType}</p>
                    <p className="text-xs text-ink-muted">{formatDate(event.createdAt)} · {event.note ?? "Not yok"}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm font-semibold text-ink-muted">Durum geçmişi bulunamadı.</p>
              )}
            </div>
          </div>
        </div>

        <aside className="grid gap-3 self-start rounded-lg border border-border-soft bg-white p-4 shadow-sm">
          <h2 className="font-black text-dark-navy">İşlemler</h2>
          {source === "demo" ? (
            <AdminPanelNotice title="Supabase kaydı gerekir">
              Bu kayıt demo/mock fallback kaydı olduğu için oluşturma, güncelleme, yazdırma, PDF ve iptal aksiyonları çalıştırılmaz.
            </AdminPanelNotice>
          ) : null}
          {source === "supabase" && receipt.status === "draft" ? (
            <form action={markManualReceiptPreparedAction}>
              <HiddenId id={receipt.id} />
              <button type="submit" className="focus-ring w-full rounded-md bg-ocean-green px-3 py-2 text-sm font-extrabold text-white">
                Hazırlandı İşaretle
              </button>
            </form>
          ) : null}
          {source === "supabase" && !receipt.filePath && receipt.status !== "cancelled" ? (
            <form action={generateManualReceiptPdfAction}>
              <HiddenId id={receipt.id} />
              <button type="submit" className="focus-ring w-full rounded-md border border-border-soft px-3 py-2 text-sm font-extrabold text-deep-blue">
                PDF Oluştur
              </button>
            </form>
          ) : null}
          {canMutate ? (
            <form action={cancelManualReceiptAction} className="grid gap-2">
              <HiddenId id={receipt.id} />
              <input name="reason" required minLength={5} placeholder="İptal gerekçesi" className="focus-ring rounded-md border border-border-soft px-3 py-2 text-sm" />
              <button type="submit" className="focus-ring rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-extrabold text-red-700">
                İptal Et
              </button>
            </form>
          ) : null}
          {source === "supabase" && receipt.status !== "cancelled" && receipt.status !== "archived" ? (
            <form action={archiveManualReceiptAction}>
              <HiddenId id={receipt.id} />
              <button type="submit" className="focus-ring w-full rounded-md border border-border-soft px-3 py-2 text-sm font-extrabold text-deep-blue">
                Arşivle
              </button>
            </form>
          ) : null}
          {receipt.cancelledReason ? <AdminPanelNotice title="İptal gerekçesi">{receipt.cancelledReason}</AdminPanelNotice> : null}
        </aside>
      </section>
    </div>
  );
}
