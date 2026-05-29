import type { ManualReceipt } from "@/data/manualReceiptMock";

function formatMoney(amount: number, currency: string) {
  return `${new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)} ${currency === "TRY" ? "TL" : currency}`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return value;
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "long", timeStyle: "short" }).format(date);
}

function Info({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="border border-slate-300 px-3 py-2">
      <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 min-h-5 text-sm font-bold text-slate-900">{value || "-"}</p>
    </div>
  );
}

export function ManualReceiptPrintView({ receipt }: { receipt: ManualReceipt }) {
  return (
    <article className="manual-receipt-print mx-auto grid w-full max-w-[1120px] gap-4 border border-slate-300 bg-white p-6 text-slate-900 shadow-sm print:max-w-none print:border-0 print:p-0 print:shadow-none">
      <header className="grid grid-cols-[220px_1fr_220px] items-center gap-4 border-b-4 border-[#1F8083] pb-4">
        <div>
          <p className="text-2xl font-black text-[#0F2547]">OKYANUS</p>
          <p className="text-xs font-bold uppercase text-slate-500">İnsani Yardım Derneği</p>
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-black text-[#0F2547]">MANUEL BAĞIŞ MAKBUZU</h1>
          <p className="mt-1 text-sm font-bold text-[#1F8083]">Fiziksel / saha tipi tahsilat formu</p>
        </div>
        <div className="grid gap-1 text-xs">
          <Info label="Makbuz No" value={receipt.receiptNo} />
          <Info label="Seri / Sıra" value={`${receipt.serialNo ?? "-"} / ${receipt.sequenceNo ?? "-"}`} />
        </div>
      </header>

      <section className="grid grid-cols-4 gap-2">
        <Info label="Tarih" value={formatDate(receipt.receiptDate)} />
        <Info label="Şube / Birim" value={[receipt.branchName, receipt.unitName].filter(Boolean).join(" / ")} />
        <Info label="Bağış Türü" value={receipt.donationTypeLabel} />
        <Info label="Ödeme Yöntemi" value={receipt.paymentMethodLabel} />
      </section>

      <section className="grid grid-cols-4 gap-2">
        <div className="col-span-2">
          <Info label="Bağışçı / Kurum" value={receipt.donorName} />
        </div>
        <Info label="Telefon" value={receipt.donorPhone} />
        <Info label="E-posta" value={receipt.donorEmail} />
        <div className="col-span-2">
          <Info label="Kampanya / Proje" value={receipt.campaignName || receipt.projectName} />
        </div>
        <Info label="Tutar Rakamla" value={formatMoney(receipt.amount, receipt.currency)} />
        <Info label="Tutar Yazıyla" value={receipt.amountInWords} />
      </section>

      <section className="border border-slate-300 p-3">
        <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Bağışın Amacı / Açıklama</p>
        <p className="mt-2 min-h-14 text-sm leading-6">{receipt.purpose || receipt.description || "-"}</p>
      </section>

      <section className="rounded bg-[#F2F7F8] p-3 text-sm font-bold leading-6 text-[#0F2547]">
        Yukarıda bilgileri yer alan bağış tarafımızca teslim alınmıştır. Okyanus İnsani Yardım Derneği, yapılan bu bağışı ilgili mevzuat ve dernek amaçları doğrultusunda kullanmayı taahhüt eder.
      </section>

      <section className="grid grid-cols-3 gap-4">
        {[
          ["Teslim Alan", receipt.collectorName],
          ["Muhasebe / Yetkili", receipt.accountingOfficerName],
          ["Onay", receipt.approvedByName]
        ].map(([label, name]) => (
          <div key={label} className="border border-slate-300 p-4">
            <p className="font-black text-[#0F2547]">{label}</p>
            <p className="mt-4 text-sm font-bold">{name || "-"}</p>
            <div className="mt-8 border-t border-slate-400 pt-2 text-xs font-bold text-slate-500">İmza</div>
          </div>
        ))}
      </section>

      <footer className="border-t border-slate-300 pt-3 text-xs font-semibold text-slate-500">
        Bu belge manuel/fiziksel makbuz çıktısı olarak oluşturulmuştur. Resmî belge niteliği, seri-sıra kullanımı ve arşiv süresi dernek yönetimi ve mali müşavir onayıyla kesinleşmelidir.
      </footer>
    </article>
  );
}
