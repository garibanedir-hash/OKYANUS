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
  return (
    <svg viewBox="0 0 800 800" fill="none" aria-hidden className="absolute inset-0 h-full w-full">
      {[100, 200, 300, 400, 500, 600, 700].map((r, i) => (
        <circle
          key={r}
          cx="400"
          cy="400"
          r={r}
          stroke="rgba(31,128,131,0.10)"
          strokeWidth="1"
          fill="none"
          opacity={1 - i * 0.1}
        />
      ))}
      <circle cx="400" cy="400" r="18" fill="rgba(31,128,131,0.25)" />
      <circle cx="400" cy="400" r="6" fill="rgba(31,128,131,0.55)" />
    </svg>
  );
}

export default function MaintenancePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-dark-navy px-6 py-16 text-center">

      {/* Concentric rings — centered, full background */}
      <div className="pointer-events-none absolute inset-0">
        <OceanRings />
      </div>

      {/* Top radial glow */}
      <div className="pointer-events-none absolute inset-x-0 -top-40 h-[32rem] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(31,128,131,0.22),transparent)]" />

      {/* Top hairline */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ocean-green/50 to-transparent" />
      {/* Bottom hairline */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-ocean-green/20 to-transparent" />

      {/* ── Content ── */}
      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center">

        {/* Status badge */}
        <span className="mb-10 inline-flex items-center gap-2 rounded-full border border-ocean-green/30 bg-ocean-green/10 px-4 py-1.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ocean-green" />
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-ocean-green">
            Hazırlık devam ediyor
          </span>
        </span>

        {/* Logo — centered, large */}
        <OfficialLogo variant="white" size="xl" className="mx-auto mb-12" />

        {/* Headline */}
        <h1 className="text-5xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl">
          Web Sitemiz
          <br />
          <span className="text-ocean-green">Yenileniyor.</span>
        </h1>

        {/* Description */}
        <p className="mx-auto mt-7 max-w-xl text-lg leading-8 text-white/55">
          Dijital altyapımızı daha güvenli, erişilebilir ve kurumsal bir deneyim sunmak için hazırlıyoruz. Kısa süre içinde sizlerle buluşacağız.
        </p>

        {/* Tagline */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <div className="h-px w-8 bg-ocean-green/40" />
          <p className="text-sm font-extrabold text-ocean-green/80">
            İyilik Paylaştıkça Okyanusa Dönüşür.
          </p>
          <div className="h-px w-8 bg-ocean-green/40" />
        </div>

        {/* Pillars */}
        <div className="mt-16 grid w-full gap-6 border-t border-white/8 pt-14 sm:grid-cols-3">
          {pillars.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex flex-col items-center gap-3 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ocean-green/15 ring-1 ring-ocean-green/20">
                <Icon aria-hidden className="h-5 w-5 text-ocean-green" />
              </span>
              <h3 className="font-bold text-white">{title}</h3>
              <p className="text-sm leading-6 text-white/50">{description}</p>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="mt-14 flex items-center justify-center gap-3 border-t border-white/8 pt-8 text-sm text-white/40">
          <Mail aria-hidden className="h-4 w-4 text-ocean-green" />
          <span>Sorularınız için:</span>
          <a href="mailto:info@okyanus.org.tr" className="font-semibold text-white/70 transition hover:text-ocean-green">
            info@okyanus.org.tr
          </a>
        </div>
      </div>

      {/* Footer note */}
      <p className="absolute bottom-5 text-xs text-white/20">
        Bu sayfa bakım modu kapsamında geçici olarak yayındadır.
      </p>
    </main>
  );
}
