import { CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { MotionReveal } from "@/components/MotionReveal";
import { OfficialLogo } from "@/components/brand/OfficialLogo";

function HeroBrandLockup() {
  return (
    <div className="inline-flex items-center gap-5 rounded-xl border border-border-soft bg-white px-5 py-4 shadow-sm">
      <OfficialLogo variant="color" context="hero" className="shrink-0" />
      <div className="leading-none">
        <p className="text-5xl font-black tracking-[0.02em] text-deep-blue sm:text-6xl lg:text-7xl">OKYANUS</p>
        <p className="mt-2 text-[0.72rem] font-extrabold uppercase tracking-[0.42em] text-ocean-green sm:text-sm sm:tracking-[0.48em]">İnsani Yardım Derneği</p>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-warm-white">
      <div className="absolute inset-x-0 bottom-0 h-24 bg-deep-blue" />
      <div className="absolute inset-x-0 bottom-24 h-px bg-ocean-green/35" />
      <Container className="relative grid min-h-[calc(100vh-5rem)] items-center gap-10 py-14 lg:grid-cols-[1.08fr_0.92fr] lg:py-20">
        <MotionReveal>
          <HeroBrandLockup />
          <div className="mt-10 max-w-3xl">
            <h1 className="text-4xl font-extrabold leading-tight text-dark-navy sm:text-5xl lg:text-6xl">
              İyilik, güvenle büyür.
            </h1>
            <p className="mt-4 text-base font-bold text-ocean-green">
              İyilik Paylaştıkça Okyanusa Dönüşür.
            </p>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-ink-muted">
              Okyanus İnsani Yardım Derneği; bağışları kayıt altına alan, projeleri takip eden ve ihtiyaç sahiplerine insan onurunu gözeten destekler ulaştıran bir dayanışma platformudur.
            </p>
          </div>
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
          <div className="rounded-[1.5rem] border border-border-soft bg-white p-6 shadow-[0_18px_50px_rgba(15,37,71,0.08)]">
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
        </MotionReveal>
      </Container>
    </section>
  );
}
