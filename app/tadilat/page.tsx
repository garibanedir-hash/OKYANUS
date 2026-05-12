import type { Metadata } from "next";
import { BrandMark } from "@/components/BrandMark";

export const metadata: Metadata = {
  title: "Çok Yakında Yayındayız | Okyanus",
  description: "Okyanus İnsani Yardım Derneği web sitesi bakım ve hazırlık modundadır."
};

export default function MaintenancePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-warm-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(31,128,131,0.14),transparent_32%),linear-gradient(135deg,rgba(255,254,253,0.96),rgba(232,242,243,0.92))]" />
      <div className="absolute inset-x-0 bottom-0 h-64 opacity-50">
        <div className="h-full rounded-t-[55%] bg-soft-blue" />
      </div>
      <section className="relative z-10 flex min-h-screen items-center justify-center px-5 py-12">
        <div className="mx-auto max-w-3xl rounded-brand border border-border-soft bg-white/88 p-8 text-center shadow-card backdrop-blur md:p-12">
          <div className="flex justify-center">
            <BrandMark compact />
          </div>
          <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.18em] text-ocean-green">Bakım modu</p>
          <h1 className="mt-3 text-4xl font-extrabold text-dark-navy md:text-5xl">Çok Yakında Yayındayız</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-ink-muted">
            Okyanus İnsani Yardım Derneği web sitesi daha iyi, daha güvenli ve daha erişilebilir bir deneyim sunmak için hazırlanıyor.
          </p>
          <p className="mx-auto mt-4 max-w-2xl leading-7 text-ink-muted">
            Bu süreçte çalışmalarımızı titizlikle sürdürüyoruz. Kısa süre içinde yeniden görüşmek üzere.
          </p>
          <div className="mx-auto mt-8 inline-flex rounded-full bg-soft-blue px-5 py-3 text-sm font-bold text-deep-blue">
            İletişim için: info@okyanus.org.tr
          </div>
        </div>
      </section>
    </main>
  );
}
