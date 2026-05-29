import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminFormShell } from "@/components/admin/AdminFormShell";
import { AdminPanelNotice } from "@/components/admin/AdminPanelNotice";
import { ManualReceiptForm } from "@/components/admin/manual-receipts/ManualReceiptForm";
import { getManualReceiptByIdWithSource } from "@/lib/data/manualReceiptRepository";
import { updateManualReceiptAction } from "../../actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditManualReceiptPage({ params }: PageProps) {
  const { id } = await params;
  const { data: receipt, source } = await getManualReceiptByIdWithSource(id);
  if (!receipt) notFound();

  const locked = source === "demo" || receipt.status === "cancelled" || receipt.status === "archived";

  return (
    <AdminFormShell
      eyebrow="Manuel / fiziksel tahsilat"
      title={`${receipt.receiptNo} düzenle`}
      description="Manuel makbuz alanlarını güncelleyin. İptal edilmiş veya arşivlenmiş kayıtlar üzerinde değişiklik yapılmaz."
      aside={
        <div className="grid gap-3 text-sm leading-6 text-ink-muted">
          <p className="font-bold text-dark-navy">Düzenleme politikası</p>
          <p>Seri, sıra, bağışçı ve tahsilat bilgileri admin yetkisiyle güncellenir. İptal ve arşiv durumları audit/event geçmişinde saklanır.</p>
          <Link href={`/admin/makbuzlar/manuel/${receipt.id}`} className="focus-ring inline-flex justify-center rounded-md border border-border-soft px-3 py-2 text-sm font-extrabold text-deep-blue">
            Detaya Dön
          </Link>
        </div>
      }
    >
      {locked ? (
        <AdminPanelNotice title={source === "demo" ? "Supabase kaydı gerekir" : "Düzenleme kapalı"}>
          {source === "demo"
            ? "Bu kayıt demo/mock fallback kaydı olduğu için düzenlenemez."
            : `Bu manuel makbuz ${receipt.statusLabel.toLocaleLowerCase("tr-TR")} durumunda olduğu için düzenlenemez.`}
        </AdminPanelNotice>
      ) : (
        <ManualReceiptForm action={updateManualReceiptAction} receipt={receipt} submitLabel="Manuel Makbuzu Güncelle" />
      )}
    </AdminFormShell>
  );
}
