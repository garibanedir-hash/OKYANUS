import { CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { MotionReveal } from "@/components/MotionReveal";
import { OfficialLogo } from "@/components/brand/OfficialLogo";

export function HeroSection() {
  return (
    <section className="ocean-surface relative overflow-hidden">
      {/* Subtle dot-grid texture */}
      <div className="wave-grid absolute inset-0 opacity-30" />

      {/* Top-right ambient glow */}
      <div className="pointer-events-none absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-ocean-green/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-mint-green/40 blur-3xl" />

      {/* Bottom section fade into deep-blue (stats below) */}
      <div className="absolute inset-x-0 bottom-0 h-28 bg-deep-blue" />
      <div className="absolute inset-x-0 bottom-28 h-px bg-ocean-green/30" />

      <Container className="relative grid min-h-[calc(100vh-6rem)] items-center gap-10 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:py-24">
        <MotionReveal>
          {/* Logo lockup */}
          <div className="mb-8 inline-flex items-center justify-center rounded-2xl border border-border-soft bg-white/90 px-5 py-4 shadow-card backdrop-blur-sm">
            <OfficialLogo variant="color" context="hero" className="shrink-0" />
          </div>

          {/* Trust badge */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-ocean-green/25 bg-mint-green/70 px-4 py-1.5 backdrop-blur-sm">
            <ShieldCheck aria-hidden className="h-3.5 w-3.5 text-ocean-green" />
            <span className="text-xs font-bold uppercase tracking-[0.13em] text-ocean-green">
              Güvenilir · Şeffaf · Emanet Bilinçli
            </span>
          </div>

          <h1 className="text-4xl font-extrabold leading-tight text-dark-navy sm:text-5xl lg:text-[3.5rem]">
            İyilik, güvenle büyür.
          </h1>
          <p className="mt-3 text-base font-bold text-ocean-green">
            İyilik Paylaştıkça Okyanusa Dönüşür.
          </p>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-ink-muted">
            Okyanus İnsani Yardım Derneği; bağışları kayıt altına alan, projeleri takip eden ve ihtiyaç sahiplerine insan onurunu gözeten destekler ulaştıran bir dayanışma platformudur.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/bagis-yap" showIcon>
              Bağış Yap
            </Button>
            <Button href="/gonullu-ol" variant="ghost" showIcon>
              Gönüllü Ol
            </Button>
          </div>
        </MotionReveal>

        <MotionReveal delay={0.12}>
          <div className="relative overflow-hidden rounded-[1.5rem] border border-border-soft bg-white shadow-[0_20px_60px_rgba(15,37,71,0.10)]">
            {/* Gradient accent bar at top */}
            <div className="h-1 w-full bg-gradient-to-r from-deep-blue via-ocean-green to-mint-green" />
            <div className="p-6">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-soft-blue text-deep-blue">
                  <ShieldCheck aria-hidden className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-ocean-green">Emanet bilinci</p>
                  <h2 className="mt-2 text-2xl font-bold text-dark-navy">Bağış süreci izlenebilir ve kayıtlı ilerler.</h2>
                </div>
              </div>
              <div className="mt-6 grid gap-3">
                {[
                  "Bağış ve destek alanı kayıt altına alınır.",
                  "Proje bazlı ilerleme ve raporlama hazırlanır.",
                  "Bağışçı ve gönüllüler süreçten bilgilendirilir."
                ].map((item) => (
                  <div key={item} className="flex gap-3 rounded-2xl bg-soft-gray p-4 text-sm font-bold leading-6 text-deep-blue">
                    <CheckCircle2 aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-ocean-green" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </MotionReveal>
      </Container>
    </section>
  );
}
