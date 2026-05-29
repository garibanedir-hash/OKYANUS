import { AdminFormShell } from "@/components/admin/AdminFormShell";
import { ManualReceiptForm } from "@/components/admin/manual-receipts/ManualReceiptForm";
import { createManualReceiptAction } from "../actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function NewManualReceiptPage() {
  return (
    <AdminFormShell
      eyebrow="Manuel / fiziksel tahsilat"
      title="Yeni Manuel Makbuz"
      description="Elden, saha veya merkez tahsilatı için geniş yatay çıktı üretebilen fiziksel makbuz kaydı oluşturun."
      aside={
        <div className="text-sm leading-6 text-ink-muted">
          <p className="font-bold text-dark-navy">Güvenlik notu</p>
          <p className="mt-2">
            Bu kayıt dijital payment intent makbuzlarından ayrıdır. TCKN/VKN gibi alanlar yalnızca gerekli hallerde girilmeli ve production öncesi mali/hukuki politika onaylanmalıdır.
          </p>
        </div>
      }
    >
      <ManualReceiptForm action={createManualReceiptAction} submitLabel="Manuel Makbuz Oluştur" />
    </AdminFormShell>
  );
}
