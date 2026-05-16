import type { Metadata } from "next";
import { Building2, Mail, ShieldCheck, Sparkles, Waves } from "lucide-react";
import { OfficialLogo } from "@/components/brand/OfficialLogo";

export const metadata: Metadata = {
  title: "Web Sitemiz Yenileniyor | Okyanus",
  description: "Okyanus İnsani Yardım Derneği web sitesi daha güvenli, erişilebilir ve kurumsal bir deneyim için yenileniyor."
};

const infoCards = [
  {
    title: "Güvenli Altyapı",
    description: "Bağış, gönüllülük ve iletişim süreçleri için daha güvenli bir dijital zemin hazırlanıyor.",
    icon: ShieldCheck
  },
  {
    title: "Şeffaf Süreç",
    description: "Projeler, faaliyet raporları ve destek süreçleri daha takip edilebilir hale getiriliyor.",
    icon: Waves
  },
  {
    title: "Kurumsal Deneyim",
    description: "Ziyaretçi, bağışçı, gönüllü ve ekip panelleri daha düzenli bir yapıya taşınıyor.",
    icon: Building2
  }
];

export default function MaintenancePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-warm-white text-dark-navy">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,254,253,0.98)_0%,rgba(245,247,248,0.98)_58%,rgba(232,242,243,0.72)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-deep-blue via-ocean-green to-deep-blue" />
      <div className="absolute -right-32 bottom-0 h-72 w-[34rem] rounded-tl-full bg-deep-blue/95" />
      <div className="absolute -right-24 bottom-10 h-56 w-[30rem] rounded-tl-full border-t border-white/18 bg-ocean-green/18" />
      <div className="wave-lines absolute inset-x-0 bottom-0 h-40 opacity-20" />

      <section className="relative z-10 flex min-h-screen items-center px-5 py-8 sm:py-12">
        <div className="mx-auto w-full max-w-6xl">
          <header className="mb-8 flex items-center justify-between gap-4">
            <OfficialLogo variant="color" size="md" />
            <span className="hidden rounded-full border border-border-soft bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-ocean-green shadow-card sm:inline-flex">
              Hazırlık süreci devam ediyor
            </span>
          </header>

          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
            <section className="rounded-[1.75rem] border border-border-soft bg-white p-7 shadow-card md:p-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-soft-blue px-4 py-2 text-sm font-bold text-deep-blue">
                <Sparkles aria-hidden className="h-4 w-4 text-ocean-green" />
                Hazırlık süreci devam ediyor
              </div>
              <h1 className="mt-7 max-w-3xl text-4xl font-extrabold leading-tight text-dark-navy md:text-5xl">
                Web Sitemiz Yenileniyor
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-ink-muted">
                Okyanus İnsani Yardım Derneği olarak dijital altyapımızı daha güvenli, erişilebilir ve kurumsal bir deneyim sunmak için hazırlıyoruz.
              </p>
              <p className="mt-4 max-w-3xl leading-7 text-ink-muted">
                Bu süreçte çalışmalarımız kontrollü şekilde devam etmektedir. Kısa süre içinde faaliyetlerimizi, projelerimizi ve bağış süreçlerimizi daha şeffaf ve kullanıcı dostu bir yapı ile sizlerle buluşturacağız.
              </p>
              <p className="mt-7 border-l-4 border-ocean-green pl-4 text-base font-extrabold text-deep-blue">
                İyilik Paylaştıkça Okyanusa Dönüşür.
              </p>
            </section>

            <aside className="rounded-[1.75rem] bg-deep-blue p-7 text-white shadow-card md:p-10">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-mint-green">Kurumsal bilgilendirme</p>
              <h2 className="mt-4 text-2xl font-bold">Dijital altyapı kontrollü şekilde hazırlanıyor.</h2>
              <div className="mt-8 grid gap-4">
                {infoCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <article key={card.title} className="rounded-2xl border border-white/10 bg-white/8 p-4">
                      <div className="flex gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-ocean-green">
                          <Icon aria-hidden className="h-5 w-5" />
                        </span>
                        <div>
                          <h3 className="font-bold">{card.title}</h3>
                          <p className="mt-1 text-sm leading-6 text-white/72">{card.description}</p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </aside>
          </div>

          <section className="mt-6 grid gap-4 rounded-[1.5rem] border border-border-soft bg-white p-5 shadow-card md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="text-lg font-bold text-dark-navy">İletişim</h2>
              <p className="mt-1 text-sm leading-6 text-ink-muted">
                Acil iletişim ve kurumsal talepler için bizimle iletişime geçebilirsiniz.
              </p>
            </div>
            <div className="grid gap-2 text-sm font-bold text-deep-blue sm:grid-cols-2 md:min-w-[28rem]">
              <span className="inline-flex items-center gap-2 rounded-2xl bg-soft-gray px-4 py-3">
                <Mail aria-hidden className="h-4 w-4 text-ocean-green" />
                info@okyanus.org.tr
              </span>
              <span className="inline-flex items-center gap-2 rounded-2xl bg-soft-gray px-4 py-3">
                <Waves aria-hidden className="h-4 w-4 text-ocean-green" />
                www.okyanus.org.tr
              </span>
            </div>
          </section>

          <p className="mt-6 text-center text-xs font-semibold text-ink-muted">
            Bu sayfa bakım modu kapsamında geçici olarak yayındadır.
          </p>
        </div>
      </section>
    </main>
  );
}
