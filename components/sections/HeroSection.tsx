import { ArrowDownRight, Droplets, ReceiptText, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { MotionReveal } from "@/components/MotionReveal";

export function HeroSection() {
  return (
    <section className="ocean-surface relative overflow-hidden">
      <div className="absolute inset-0 wave-grid opacity-60" />
      <div className="wave-lines absolute inset-x-0 bottom-0 h-44 opacity-70" />
      <Container className="relative grid min-h-[calc(100vh-5rem)] items-center gap-10 py-14 lg:grid-cols-[1.02fr_0.98fr] lg:py-20">
        <MotionReveal>
          <p className="mb-4 inline-flex rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-ocean-green shadow-sm ring-1 ring-ocean-green/10">
            Emanet bilinciyle izlenebilir iyilik
          </p>
          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight text-dark-navy sm:text-5xl lg:text-6xl">
            İyilik büyür, umut olur.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Okyanus İnsani Yardım Derneği; bağışları kayıt altına alan, projeleri takip eden ve ihtiyaç sahiplerine insan
            onurunu gözeten destekler ulaştıran bir dayanışma platformudur.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/bagis-yap" showIcon>
              Bağış Yap
            </Button>
            <Button href="/gonullu-ol" variant="ghost" showIcon>
              Gönüllü Ol
            </Button>
          </div>
          <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
            {["Kayıtlı bağış", "Proje bazlı takip", "Gönüllü saha desteği"].map((item) => (
              <div key={item} className="rounded-2xl bg-white/75 p-3 text-sm font-bold text-deep-blue shadow-sm ring-1 ring-white/70">
                {item}
              </div>
            ))}
          </div>
        </MotionReveal>

        <MotionReveal delay={0.12}>
          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-4 rounded-[2rem] bg-white/50 blur-2xl" />
            <div className="relative overflow-hidden rounded-[1.75rem] bg-white shadow-soft ring-1 ring-white/80">
              <div className="h-80 bg-gradient-to-br from-deep-blue via-primary-blue to-ocean-green p-6 text-white sm:h-[27rem]">
                <div className="flex h-full flex-col justify-between rounded-[1.3rem] border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-white/18 px-3 py-1 text-xs font-semibold">Okyanus saha akışı</span>
                    <Droplets aria-hidden className="h-8 w-8 text-mint-green" />
                  </div>
                  <div>
                    <div className="grid gap-3">
                      {[
                        ["Bağış alınır", "Tutar ve destek alanı kaydedilir."],
                        ["İhtiyaç eşleşir", "Proje veya saha ekibiyle planlanır."],
                        ["Bilgi paylaşılır", "Destekçiler süreçten haberdar edilir."]
                      ].map(([title, text]) => (
                        <div key={title} className="flex items-start gap-3 rounded-2xl bg-white/15 p-3">
                          <ArrowDownRight aria-hidden className="mt-0.5 h-5 w-5 text-mint-green" />
                          <div>
                            <p className="text-sm font-bold">{title}</p>
                            <p className="text-xs leading-5 text-white/78">{text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 rounded-2xl bg-white p-5 text-dark-navy shadow-card">
                      <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mint-green text-ocean-green">
                          <ReceiptText aria-hidden className="h-6 w-6" />
                        </span>
                        <div>
                          <p className="text-sm font-bold">Emanet takip paneli</p>
                          <p className="text-xs text-slate-500">Ödeme entegrasyonuna hazır bağış akışı.</p>
                        </div>
                      </div>
                      <div className="mt-4 h-2 rounded-full bg-soft-gray">
                        <div className="h-full w-3/4 rounded-full bg-ocean-green" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-5 right-3 rounded-2xl bg-white p-4 shadow-soft ring-1 ring-slate-100 sm:right-10">
              <div className="flex items-center gap-3">
                <ShieldCheck aria-hidden className="h-6 w-6 text-ocean-green" />
                <div>
                  <p className="text-sm font-bold text-dark-navy">Şeffaf süreç</p>
                  <p className="text-xs text-slate-500">Bağışçı bilgilendirmesi hazır</p>
                </div>
              </div>
            </div>
          </div>
        </MotionReveal>
      </Container>
    </section>
  );
}
