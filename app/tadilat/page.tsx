import type { Metadata } from "next";
import { Building2, Mail, ShieldCheck, Waves } from "lucide-react";
import { OfficialLogo } from "@/components/brand/OfficialLogo";

export const metadata: Metadata = {
  title: "Web Sitemiz Yenileniyor | Okyanus",
  description: "Okyanus İnsani Yardım Derneği web sitesi daha güvenli, erişilebilir ve kurumsal bir deneyim için yenileniyor."
};

const pillars = [
  {
    icon: ShieldCheck,
    title: "Güvenli Altyapı",
    description: "Bağış, gönüllülük ve iletişim süreçleri için daha güvenli bir dijital zemin hazırlanıyor."
  },
  {
    icon: Waves,
    title: "Şeffaf Süreç",
    description: "Projeler, faaliyet raporları ve destek süreçleri daha takip edilebilir hale getiriliyor."
  },
  {
    icon: Building2,
    title: "Kurumsal Deneyim",
    description: "Ziyaretçi, bağışçı, gönüllü ve ekip panelleri daha düzenli bir yapıya taşınıyor."
  }
];

function OceanRings() {
  const radii = [80, 160, 240, 320, 400, 480, 560, 640];
  return (
    <svg
      viewBox="0 0 640 640"
      fill="none"
      aria-hidden
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="xMaxYMax slice"
    >
      {radii.map((r, i) => (
        <circle
          key={r}
          cx="640"
          cy="640"
          r={r}
          stroke="rgba(31,128,131,0.13)"
          strokeWidth="1"
          fill="none"
          opacity={1 - i * 0.08}
        />
      ))}
      <circle cx="640" cy="640" r="20" fill="rgba(31,128,131,0.3)" />
      <circle cx="640" cy="640" r="7" fill="rgba(31,128,131,0.65)" />
    </svg>
  );
}

export default function MaintenancePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-dark-navy">

      {/* Ambient radial glow — top center */}
      <div className="pointer-events-none absolute inset-x-0 -top-40 h-[40rem] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(31,128,131,0.2),transparent)]" />

      {/* Bottom-left warmth */}
      <div className="pointer-events-none absolute bottom-0 left-0 h-80 w-96 bg-[radial-gradient(circle,rgba(220,239,237,0.04),transparent_70%)]" />

      {/* Ocean rings — bottom right */}
      <div className="pointer-events-none absolute bottom-0 right-0 h-[70%] w-[55%] overflow-hidden">
        <OceanRings />
      </div>

      {/* Top hairline */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ocean-green/40 to-transparent" />

      {/* ── Page ── */}
      <div className="relative z-10 flex min-h-screen flex-col px-5 py-10 sm:px-8 lg:px-16">

        {/* Header */}
        <header className="flex items-center justify-between">
          <OfficialLogo variant="white" size="xl" />
          <span className="inline-flex items-center gap-2 rounded-full border border-ocean-green/30 bg-ocean-green/10 px-4 py-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ocean-green" />
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-ocean-green">
              Hazırlık devam ediyor
            </span>
          </span>
        </header>

        {/* Main content */}
        <div className="flex flex-1 items-center py-16">
          <div className="w-full max-w-4xl">

            {/* Headline */}
            <h1 className="text-5xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-[5rem]">
              Web Sitemiz
              <br />
              <span className="text-ocean-green">Yenileniyor.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/55">
              Dijital altyapımızı daha güvenli, erişilebilir ve kurumsal bir deneyim sunmak için hazırlıyoruz. Kısa süre içinde faaliyetlerimizi, projelerimizi ve bağış süreçlerimizi sizlerle buluşturacağız.
            </p>

            {/* Tagline */}
            <div className="mt-7 inline-flex items-center gap-3">
              <div className="h-px w-8 bg-ocean-green/50" />
              <p className="text-sm font-extrabold text-ocean-green/80">
                İyilik Paylaştıkça Okyanusa Dönüşür.
              </p>
            </div>

            {/* Pillars */}
            <div className="mt-16 grid gap-8 border-t border-white/8 pt-12 sm:grid-cols-3">
              {pillars.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex flex-col gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ocean-green/15 ring-1 ring-ocean-green/20">
                    <Icon aria-hidden className="h-5 w-5 text-ocean-green" />
                  </span>
                  <h3 className="font-bold text-white">{title}</h3>
                  <p className="text-sm leading-6 text-white/50">{description}</p>
                </div>
              ))}
            </div>

            {/* Contact */}
            <div className="mt-12 flex items-center gap-3 border-t border-white/8 pt-8 text-sm font-semibold text-white/40">
              <Mail aria-hidden className="h-4 w-4 text-ocean-green" />
              <span>Sorularınız için:</span>
              <a
                href="mailto:info@okyanus.org.tr"
                className="text-white/70 transition hover:text-ocean-green"
              >
                info@okyanus.org.tr
              </a>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs font-semibold text-white/25">
          Bu sayfa bakım modu kapsamında geçici olarak yayındadır.
        </p>
      </div>
    </main>
  );
}
