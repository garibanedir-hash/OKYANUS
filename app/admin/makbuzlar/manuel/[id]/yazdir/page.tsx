import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPanelNotice } from "@/components/admin/AdminPanelNotice";
import { ManualReceiptPrintView } from "@/components/admin/manual-receipts/ManualReceiptPrintView";
import { PrintButton } from "@/components/admin/manual-receipts/PrintButton";
import { getManualReceiptById } from "@/lib/data/manualReceiptRepository";
import { generateManualReceiptPdfAction, markManualReceiptPrintedAction } from "../../actions";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ durum?: string; mesaj?: string }>;
};

function HiddenId({ id }: { id: string }) {
  return <input type="hidden" name="id" value={id} />;
}

function statusMessage(status?: string, message?: string) {
  if (status === "yazdirildi") return "Yazdırma kaydı işlendi.";
  if (status === "pdf-olusturuldu") return "Manuel makbuz PDF dosyası oluşturuldu.";
  if (status === "hata") return message ?? "Yazdırma işlemi tamamlanamadı.";
  return null;
}

export default async function ManualReceiptPrintPage({ params, searchParams }: PageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const receipt = await getManualReceiptById(id);
  if (!receipt) notFound();
  const message = statusMessage(query?.durum, query?.mesaj);
  const canPrint = receipt.status !== "cancelled";

  return (
    <div className="grid gap-4">
      <style>
        {`
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
          @media print {
            body {
              background: white !important;
            }
            .admin-print-controls,
            aside,
            nav {
              display: none !important;
            }
            main,
            .manual-receipt-print {
              margin: 0 !important;
              max-width: none !important;
              width: 100% !important;
              box-shadow: none !important;
            }
          }
        `}
      </style>

      <div className="admin-print-controls rounded-lg border border-border-soft bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-ocean-green">Yazdırma önizlemesi</p>
            <h1 className="mt-1 text-2xl font-black text-dark-navy">{receipt.receiptNo}</h1>
            <p className="mt-1 text-sm leading-6 text-ink-muted">
              A4 yatay fiziksel makbuz formu. Yazdırma butonu tarayıcı yazdırma penceresini açar; yazdırma kaydı ayrıca işlenir.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/admin/makbuzlar/manuel/${receipt.id}`} className="focus-ring inline-flex min-h-10 items-center rounded-md border border-border-soft px-4 py-2 text-sm font-extrabold text-deep-blue">
              Detaya Dön
            </Link>
            <PrintButton />
            {canPrint ? (
              <form action={markManualReceiptPrintedAction}>
                <HiddenId id={receipt.id} />
                <button type="submit" className="focus-ring inline-flex min-h-10 items-center rounded-md bg-ocean-green px-4 py-2 text-sm font-extrabold text-white">
                  Yazdırıldı İşaretle
                </button>
              </form>
            ) : null}
            {receipt.filePath ? (
              <a href={`/api/manual-receipts/${receipt.receiptNo}/download`} className="focus-ring inline-flex min-h-10 items-center rounded-md border border-border-soft px-4 py-2 text-sm font-extrabold text-deep-blue">
                PDF Görüntüle
              </a>
            ) : canPrint ? (
              <form action={generateManualReceiptPdfAction}>
                <HiddenId id={receipt.id} />
                <button type="submit" className="focus-ring inline-flex min-h-10 items-center rounded-md border border-border-soft px-4 py-2 text-sm font-extrabold text-deep-blue">
                  PDF Oluştur
                </button>
              </form>
            ) : null}
          </div>
        </div>
        {message ? <div className="mt-4 rounded-lg border border-ocean-green/20 bg-mint-green/35 p-3 text-sm font-bold text-dark-navy">{message}</div> : null}
        {receipt.status === "cancelled" ? (
          <div className="mt-4">
            <AdminPanelNotice title="İptal edilmiş makbuz">
              Bu makbuz iptal edildiği için yeni yazdırma kaydı oluşturulamaz. Admin detay ekranından iptal gerekçesi görüntülenebilir.
            </AdminPanelNotice>
          </div>
        ) : null}
      </div>

      <ManualReceiptPrintView receipt={receipt} />
    </div>
  );
}
