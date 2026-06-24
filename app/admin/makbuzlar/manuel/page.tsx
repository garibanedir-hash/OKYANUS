import Link from "next/link";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminPanelNotice } from "@/components/admin/AdminPanelNotice";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { ManualReceiptStatusBadge } from "@/components/admin/manual-receipts/ManualReceiptStatusBadge";
import {
  manualReceiptDonationTypeLabels,
  manualReceiptPaymentMethodLabels,
  manualReceiptStatusLabels
} from "@/data/manualReceiptMock";
import { getAdminManualReceiptsWithSource } from "@/lib/data/manualReceiptRepository";
import { formatDate } from "@/lib/format";
import { cancelManualReceiptAction, generateManualReceiptPdfAction } from "./actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  searchParams?: Promise<{
    receipt_no?: string;
    donor?: string;
    status?: string;
    donation_type?: string;
    payment_method?: string;
    branch?: string;
    date_from?: string;
    date_to?: string;
    durum?: string;
    mesaj?: string;
  }>;
};

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(amount);
}

function matchesDateRange(value: string, dateFrom?: string, dateTo?: string) {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return true;
  if (dateFrom && date < new Date(`${dateFrom}T00:00:00.000Z`)) return false;
  if (dateTo && date > new Date(`${dateTo}T23:59:59.999Z`)) return false;
  return true;
}

function statusMessage(status?: string, message?: string) {
  if (status === "olusturuldu") return "Manuel makbuz oluşturuldu.";
  if (status === "guncellendi") return "Manuel makbuz güncellendi.";
  if (status === "durum-guncellendi" || status === "hazirlandi") return "Manuel makbuz durumu güncellendi.";
  if (status === "yazdirildi") return "Yazdırma kaydı işlendi.";
  if (status === "iptal-edildi") return "Manuel makbuz iptal edildi.";
  if (status === "arsivlendi") return "Manuel makbuz arşivlendi.";
  if (status === "pdf-olusturuldu") return "Manuel makbuz PDF dosyası private storage içinde oluşturuldu.";
  if (status === "hata") return message ?? "Manuel makbuz işlemi tamamlanamadı.";
  return message ?? null;
}

function HiddenReceiptIdentity({ id, receiptNo }: { id: string; receiptNo: string }) {
  return (
    <>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="receiptNo" value={receiptNo} />
    </>
  );
}

export default async function AdminManualReceiptsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { data: receipts, source } = await getAdminManualReceiptsWithSource();
  const filtered = receipts.filter((receipt) => {
    const receiptMatch = !params?.receipt_no || receipt.receiptNo.toLocaleLowerCase("tr-TR").includes(params.receipt_no.toLocaleLowerCase("tr-TR"));
    const donorMatch = !params?.donor || receipt.donorName.toLocaleLowerCase("tr-TR").includes(params.donor.toLocaleLowerCase("tr-TR"));
    const statusMatch = !params?.status || params.status === "all" || receipt.status === params.status;
    const donationMatch = !params?.donation_type || params.donation_type === "all" || receipt.donationType === params.donation_type;
    const paymentMatch = !params?.payment_method || params.payment_method === "all" || receipt.paymentMethod === params.payment_method;
    const branchText = [receipt.branchName, receipt.unitName].filter(Boolean).join(" ").toLocaleLowerCase("tr-TR");
    const branchMatch = !params?.branch || branchText.includes(params.branch.toLocaleLowerCase("tr-TR"));
    const dateMatch = matchesDateRange(receipt.receiptDate, params?.date_from, params?.date_to);
    return receiptMatch && donorMatch && statusMatch && donationMatch && paymentMatch && branchMatch && dateMatch;
  });
  const message = statusMessage(params?.durum, params?.mesaj);

  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="Manuel / fiziksel tahsilat"
        title="Manuel Makbuzlar"
        description="Elden, saha, merkez veya ofis tahsilatları için dijital ödeme makbuzlarından ayrı çalışan fiziksel makbuz kayıtları."
        actionLabel="Yeni Manuel Makbuz Oluştur"
        actionHref="/admin/makbuzlar/manuel/yeni"
      />
      {message ? <div className="rounded-lg border border-ocean-green/20 bg-mint-green/35 p-4 text-sm font-bold text-dark-navy">{message}</div> : null}
      <div className="w-fit rounded bg-soft-blue px-3 py-1 text-xs font-extrabold text-deep-blue">
        {source === "supabase" ? "Gerçek kayıt" : "Kayıt yok"}
      </div>

      <form>
        <AdminFilterBar>
          <label>
            Makbuz No
            <input name="receipt_no" defaultValue={params?.receipt_no ?? ""} />
          </label>
          <label>
            Bağışçı
            <input name="donor" defaultValue={params?.donor ?? ""} />
          </label>
          <label>
            Durum
            <select name="status" defaultValue={params?.status ?? "all"}>
              <option value="all">Tümü</option>
              {Object.entries(manualReceiptStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Bağış türü
            <select name="donation_type" defaultValue={params?.donation_type ?? "all"}>
              <option value="all">Tümü</option>
              {Object.entries(manualReceiptDonationTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Ödeme yöntemi
            <select name="payment_method" defaultValue={params?.payment_method ?? "all"}>
              <option value="all">Tümü</option>
              {Object.entries(manualReceiptPaymentMethodLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Şube/Birim
            <input name="branch" defaultValue={params?.branch ?? ""} />
          </label>
          <label>
            Başlangıç
            <input name="date_from" type="date" defaultValue={params?.date_from ?? ""} />
          </label>
          <label>
            Bitiş
            <input name="date_to" type="date" defaultValue={params?.date_to ?? ""} />
          </label>
          <div className="flex items-end gap-2">
            <button type="submit" className="focus-ring inline-flex h-8 items-center rounded-md bg-ocean-green px-3 text-xs font-extrabold text-white">
              Filtrele
            </button>
            <Link href="/admin/makbuzlar/manuel" className="focus-ring inline-flex h-8 items-center rounded-md border border-border-soft bg-white px-3 text-xs font-extrabold text-deep-blue">
              Temizle
            </Link>
          </div>
        </AdminFilterBar>
      </form>

      <AdminTable
        headers={["Makbuz No", "Seri/Sıra", "Tarih", "Bağışçı", "Bağış Türü", "Ödeme", "Tutar", "Şube/Birim", "Durum", "Yazdırma", "İşlemler"]}
        recordCount={filtered.length}
        empty={!filtered.length}
      >
        {filtered.map((receipt) => {
          const canWrite = source === "supabase" && !["cancelled", "archived"].includes(receipt.status);
          const canGeneratePdf = canWrite && !receipt.filePath;
          return (
          <tr key={receipt.id}>
            <td className="font-bold text-dark-navy">{receipt.receiptNo}</td>
            <td>{receipt.serialNo || receipt.sequenceNo ? `${receipt.serialNo ?? "-"} / ${receipt.sequenceNo ?? "-"}` : "-"}</td>
            <td>{formatDate(receipt.receiptDate)}</td>
            <td>
              {receipt.donorName}
              {receipt.donorPhone ? <span className="block text-xs text-ink-muted">{receipt.donorPhone}</span> : null}
            </td>
            <td>{receipt.donationTypeLabel}</td>
            <td>{receipt.paymentMethodLabel}</td>
            <td>{formatMoney(receipt.amount, receipt.currency)}</td>
            <td>{[receipt.branchName, receipt.unitName].filter(Boolean).join(" / ") || "-"}</td>
            <td>
              <ManualReceiptStatusBadge status={receipt.status} />
            </td>
            <td>
              {receipt.printedCount}
              {receipt.lastPrintedAt ? <span className="block text-xs text-ink-muted">{formatDate(receipt.lastPrintedAt)}</span> : null}
            </td>
            <td>
              <div className="flex flex-wrap gap-2">
                <Link href={`/admin/makbuzlar/manuel/${receipt.id}`} className="focus-ring rounded-md border border-border-soft px-2.5 py-1 text-[0.72rem] font-extrabold text-deep-blue">
                  Detay
                </Link>
                <Link href={`/admin/makbuzlar/manuel/${receipt.id}/duzenle`} className="focus-ring rounded-md border border-border-soft px-2.5 py-1 text-[0.72rem] font-extrabold text-deep-blue">
                  Düzenle
                </Link>
                <Link href={`/admin/makbuzlar/manuel/${receipt.id}/yazdir`} className="focus-ring rounded-md bg-deep-blue px-2.5 py-1 text-[0.72rem] font-extrabold text-white">
                  Yazdır
                </Link>
                {source === "demo" ? (
                  <button type="button" disabled className="inline-flex rounded-md border border-border-soft bg-soft-gray px-2.5 py-1 text-[0.72rem] font-extrabold text-ink-muted">
                    Supabase kaydı gerekir
                  </button>
                ) : receipt.filePath ? (
                  <a href={`/api/manual-receipts/${receipt.receiptNo}/download`} className="focus-ring rounded-md bg-ocean-green px-2.5 py-1 text-[0.72rem] font-extrabold text-white">
                    PDF
                  </a>
                ) : canGeneratePdf ? (
                  <form action={generateManualReceiptPdfAction}>
                    <HiddenReceiptIdentity id={receipt.id} receiptNo={receipt.receiptNo} />
                    <button type="submit" className="focus-ring rounded-md border border-border-soft px-2.5 py-1 text-[0.72rem] font-extrabold text-deep-blue">
                      PDF Oluştur
                    </button>
                  </form>
                ) : null}
                {canWrite ? (
                  <form action={cancelManualReceiptAction} className="flex gap-1">
                    <HiddenReceiptIdentity id={receipt.id} receiptNo={receipt.receiptNo} />
                    <input name="reason" required minLength={5} placeholder="İptal gerekçesi" className="h-7 w-28 rounded border border-border-soft px-2 text-[0.7rem]" />
                    <button type="submit" className="focus-ring rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-[0.72rem] font-extrabold text-red-700">
                      İptal
                    </button>
                  </form>
                ) : null}
              </div>
            </td>
          </tr>
          );
        })}
      </AdminTable>

      <AdminPanelNotice title="Manuel makbuz notu">
        Bu modül online ödeme sonrası oluşan dijital makbuzdan ayrıdır. Fiziksel/saha tahsilatları için geniş yatay form, imza alanları ve private PDF çıktısı sağlar. Resmî seri-sıra ve mali belge politikası production öncesi yönetim, mali müşavir ve hukuk danışmanı tarafından onaylanmalıdır.
      </AdminPanelNotice>
    </div>
  );
}
