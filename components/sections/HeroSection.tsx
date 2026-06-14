"use client";

import { CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { OfficialLogo } from "@/components/brand/OfficialLogo";
import { resolveDonationTarget } from "@/lib/donations/donationTarget";
import type { DonationPublicConfig } from "@/lib/donations/donationTarget";

const trustPoints = [
  "Bağış ve destek alanı kayıt altına alınır.",
  "Proje bazlı ilerleme ve raporlama hazırlanır.",
  "Bağışçı ve gönüllüler süreçten bilgilendirilir.",
];

function OceanRings() {
  const radii = [80, 160, 240, 320, 400, 480, 560, 640];
  return (
    <svg
      viewBox="0 0 640 640"
      fill="none"
      aria-hidden
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="xMaxYMin slice"
    >
      {radii.map((r, i) => (
        <circle
          key={r}
          cx="640"
          cy="0"
          r={r}
          stroke="rgba(31,128,131,0.14)"
          strokeWidth="1"
          fill="none"
          opacity={1 - i * 0.08}
        />
      ))}
      <circle cx="640" cy="0" r="24" fill="rgba(31,128,131,0.35)" />
      <circle cx="640" cy="0" r="8" fill="rgba(31,128,131,0.7)" />
    </svg>
  );
}

export function HeroSection({ donationConfig }: { donationConfig: DonationPublicConfig }) {
  const donationTarget = resolveDonationTarget(donationConfig, { source: "general" }, "/bagis-yap");

  return (
    <section className="relative min-h-[calc(100vh-6rem)] overflow-hidden bg-dark-navy">
      {/* Ambient glow top-center */}
      <div className="pointer-events-none absolute inset-x-0 -top-32 h-[36rem] bg-[radial-gradient(ellipse_70%_50%_at_55%_0%,rgba(31,128,131,0.22),transparent)]" />
      {/* Bottom-left warmth */}
      <div className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 bg-[radial-gradient(circle,rgba(220,239,237,0.05),transparent_70%)]" />

      {/* Ocean ring decoration — top right */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 overflow-hidden opacity-100">
        <OceanRings />
      </div>

      {/* Hairline separator to stats below */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-ocean-green/25 to-transparent" />

      <Container className="relative flex min-h-[calc(100vh-6rem)] flex-col justify-center py-20 lg:py-28">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">

          {/* ── Left column ── */}
          <div className="flex flex-col">
            {/* Logo — no box, no border, just the mark */}
            <div className="mb-10 self-start">
              <OfficialLogo variant="white" size="lg" />
            </div>

            {/* Trust pill */}
            <div className="mb-6 self-start">
              <span className="inline-flex items-center gap-2 rounded-full border border-ocean-green/30 bg-ocean-green/12 px-4 py-1.5">
                <ShieldCheck aria-hidden className="h-3.5 w-3.5 text-ocean-green" />
                <span className="text-xs font-bold uppercase tracking-[0.13em] text-ocean-green">
                  Güvenilir · Şeffaf · Emanet Bilinçli
                </span>
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.6rem]">
              İyilik,{" "}
              <span className="text-ocean-green">güvenle</span>{" "}
              büyür.
            </h1>

            <p className="mt-3 text-sm font-semibold text-ocean-green/75">
              İyilik Paylaştıkça Okyanusa Dönüşür.
            </p>

            <p className="mt-6 max-w-[34rem] text-lg leading-8 text-white/60">
              Bağışları kayıt altına alan, projeleri takip eden ve ihtiyaç sahiplerine insan onurunu gözeten destekler ulaştıran bir dayanışma platformu.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button
                href={donationTarget.href}
                target={donationTarget.isExternal ? "_blank" : undefined}
                rel={donationTarget.isExternal ? "noopener noreferrer" : undefined}
                showIcon
              >
                Bağış Yap
              </Button>
              <Button href="/gonullu-ol" variant="ghost" showIcon>
                Gönüllü Ol
              </Button>
            </div>
          </div>

          {/* ── Right column — glassmorphism card ── */}
          <div>
            <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.07] p-7 shadow-[0_24px_64px_rgba(0,0,0,0.4)] backdrop-blur-xl">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-ocean-green/20 ring-1 ring-ocean-green/30">
                  <ShieldCheck aria-hidden className="h-6 w-6 text-ocean-green" />
                </span>
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ocean-green">
                    Emanet bilinci
                  </p>
                  <h2 className="mt-1.5 text-xl font-bold leading-snug text-white">
                    Bağış süreci izlenebilir ve kayıtlı ilerler.
                  </h2>
                </div>
              </div>

              <div className="mt-5 grid gap-2.5">
                {trustPoints.map((item) => (
                  <div
                    key={item}
                    className="flex gap-3 rounded-xl border border-white/8 bg-white/5 px-4 py-3.5 text-sm font-semibold leading-6 text-white/75"
                  >
                    <CheckCircle2 aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-ocean-green" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-2 rounded-xl border border-ocean-green/20 bg-ocean-green/10 px-4 py-3">
                <span className="h-2 w-2 rounded-full bg-ocean-green" />
                <span className="text-xs font-bold text-white/80">
                  Bağış bilgilendirme hattımız WhatsApp üzerinden açık
                </span>
              </div>
            </div>
          </div>

        </div>
      </Container>
    </section>
  );
}
